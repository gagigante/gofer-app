import path from 'node:path'
import { open } from 'node:fs/promises'
import { app } from 'electron'

export async function getOrderTemplate() {
  // src / api / templates / order - template.html
  // Read the HTML template file
  const templatePath = path.join(app.getAppPath(), 'src', 'api', 'templates', 'order-template', 'index.html')
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
