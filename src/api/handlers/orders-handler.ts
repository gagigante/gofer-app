import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { writeFile } from 'node:fs/promises'

import {
  type CreateOrderRequest,
  type DeleteOrderRequest,
  type GetOrderRequest,
  type GetOrderTemplateRequest,
  type ListOrdersRequest,
  OrdersController,
} from '../controllers/orders-controller'

import { FailToGenerateFileError } from '../errors/FailToGenerateFileError'

import type { Response } from '../types/response'

const ordersController = new OrdersController()

ipcMain.handle('orders:list', async (_event, data: ListOrdersRequest) => await ordersController.listOrders(data))

ipcMain.handle('orders:get', async (_event, data: GetOrderRequest) => await ordersController.getOrder(data))

ipcMain.handle('orders:create', async (_event, data: CreateOrderRequest) => await ordersController.createOrder(data))

ipcMain.handle('orders:delete', async (_event, data: DeleteOrderRequest) => await ordersController.deleteOrder(data))

export const ordersHandler = (window: BrowserWindow) => {
  ipcMain.handle(
    'orders:download-file',
    async (_event, data: GetOrderTemplateRequest): Promise<Response<{ is_canceled: boolean }>> => {
      const { data: response, err } = await ordersController.getOrderTemplate(data)

      if (err) {
        return { data: null, err: new FailToGenerateFileError() }
      }

      const printWindow = new BrowserWindow({ show: false })

      try {
        await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(response.template)}`)
      } catch {
        return { data: null, err: new FailToGenerateFileError() }
      }

      let documentsDir = ''

      try {
        documentsDir = app.getPath('documents')
      } catch {
        return { data: null, err: new FailToGenerateFileError() }
      }

      const reducedOrderId = response.order.id.split('-')[0]
      const { filePath, canceled } = await dialog.showSaveDialog(window, {
        defaultPath: `${documentsDir}/pedido-${reducedOrderId}.pdf`,
        message: 'Salvar comprovante de vend',
        showsTagField: false,
        properties: ['createDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
      })

      if (canceled) return { data: { is_canceled: true }, err: null }

      try {
        const pdfBuffer = await printWindow.webContents.printToPDF({
          pageSize: 'A5',
          landscape: true,
          displayHeaderFooter: true,
          headerTemplate: '<div></div>',
          footerTemplate: `
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              .container {
                width: 100%;
                padding: 12px 40px 0;
                font-size: 14px !important;
                color: #000;
              }
            </style>

            <div id="header-template" class="container">
              <p>Página <span class="pageNumber"></span> de <span class="totalPages"></span></p>
            </div>
          `,
        })

        await writeFile(filePath, pdfBuffer)

        return { data: { is_canceled: false }, err: null }
      } catch {
        return { data: null, err: new FailToGenerateFileError() }
      }
    },
  )
}
