import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'node:path'
import { open, writeFile } from 'node:fs/promises'

import {
  type CreateOrderRequest,
  type GetOrderRequest,
  type ListOrdersRequest,
  OrdersController,
} from '../controllers/orders-controller'
import { Response } from '../types/response'

const ordersController = new OrdersController()

ipcMain.handle('orders:list', async (_event, data: ListOrdersRequest) => await ordersController.listOrders(data))

ipcMain.handle('orders:get', async (_event, data: GetOrderRequest) => await ordersController.getOrder(data))

ipcMain.handle('orders:create', async (_event, data: CreateOrderRequest) => await ordersController.createOrder(data))

async function loadOrderTemplate() {
  // src / api / templates / order - template.html
  // Read the HTML template file
  const templatePath = path.join(app.getAppPath(), 'src', 'api', 'templates', 'order-template.html')
  const template = await open(templatePath)
  // let template = fs.readFile(templatePath, {})

  // Replace placeholders with order data
  // template = template
  //   .replace('{{orderId}}', order.id)
  //   .replace('{{orderDate}}', order.date)
  //   .replace('{{customerName}}', order.customerName)
  //   .replace('{{total}}', order.total.toFixed(2))

  // Generate item rows as HTML
  // const itemsHtml = order.items
  //   .map(
  //     (item) => `
  //     <div class="item-row">
  //       <span>${item.name} (x${item.quantity})</span>
  //       <span>$${(item.price * item.quantity).toFixed(2)}</span>
  //     </div>`,
  //   )
  //   .join('')

  // template = template.replace('{{items}}', itemsHtml)
  return template
}

ipcMain.handle('orders:download-file', async (_event, data: GetOrderRequest): Promise<Response<null>> => {
  const { data: order, err } = await ordersController.getOrder(data)

  if (err) {
    return { data: null, err }
  }

  const printWindow = new BrowserWindow({ show: false })
  // TODO: implements pdf generation and save

  return { data: null, err: null }
})

export const ordersHandler = (window: BrowserWindow) => {
  ipcMain.handle('orders:print', async (_event, _data: unknown) => {
    console.log({ _event, _data })

    const htmlContent = await loadOrderTemplate()

    let template = ''

    for await (const line of htmlContent.readLines()) {
      template += line
    }

    console.log({ template })

    const printWindow = new BrowserWindow({
      show: false,
    })
    // await printWindow.loadURL(`file://${templatePath}`);
    await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(template)}`)

    const printers = await printWindow.webContents.getPrintersAsync()
    console.log({ printers })

    // Print once the content is loaded
    // printWindow.webContents.on('did-finish-load', () => {
    //   printWindow.webContents.print({ silent: false, printBackground: true }, (success, errorType) => {
    //     console.log('entrou')
    //     if (!success) console.log('Print failed:', errorType)
    //     printWindow.close() // Close the window after printing
    //   })
    // })

    // const win = new BrowserWindow()
    // win.loadURL('https://github.com')

    const pdfPath = path.join(app.getAppPath(), 'src', 'api', 'templates', 'temp.pdf')
    console.log({ pdfPath })

    let documentsDir = ''

    try {
      documentsDir = app.getPath('documents')
    } catch (e) {
      console.log(e) // TODO
    }

    const { filePath, canceled } = await dialog.showSaveDialog(window, {
      defaultPath: `${documentsDir}/test.pdf`, // TODO: order file name
      message: 'Salvar comprovante de vend',
      showsTagField: false,
      properties: ['createDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
    })

    if (canceled) return

    console.log({ filePath })

    try {
      const pdfBuffer = await printWindow.webContents.printToPDF({
        // TODO
        pageSize: 'A5',
      })

      await writeFile(filePath, pdfBuffer)

      // TODO: success feedback
    } catch (e) {
      // TODO: error feedback
      console.log({ e })
    }

    // printWindow.webContents.on('did-finish-load', () => {
    //   // Use default printing options

    //   const pdfPath = path.join(app.getAppPath(), 'src', 'api', 'templates', 'temp.pdf')
    //   console.log({ pdfPath })

    //   printWindow.webContents
    //     .printToPDF({})
    //     .then((data) => {
    //       writeFile(pdfPath, data).catch((error) => {
    //         console.log(`Wrote PDF successfully to ${pdfPath}`)
    //         throw error
    //       })
    //     })
    //     .catch((error) => {
    //       console.log(`Failed to write PDF to ${pdfPath}: `, error)
    //     })
    // })
  })
}
