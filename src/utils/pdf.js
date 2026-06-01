import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDateTime, formatDate, formatCOP } from './format'
import { STORE } from './storeConfig'

export async function generateReceipt(sale) {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] })
  const pageWidth = 80
  const margin = 5

  // ── Cargar y recortar logo ────────────────────────────────────────────────────
  let logoDataUrl = null
  try {
    const res = await fetch('/logo.jpeg')
    const blob = await res.blob()
    const rawDataUrl = await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
    logoDataUrl = await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const crop = 0.52
        const sx = img.width  * (1 - crop) / 2
        const sy = img.height * (1 - crop) / 2
        const sw = img.width  * crop
        const sh = img.height * crop
        const canvas = document.createElement('canvas')
        canvas.width = sw
        canvas.height = sh
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, sw, sh)
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
        resolve(canvas.toDataURL('image/jpeg', 0.95))
      }
      img.src = rawDataUrl
    })
  } catch {}

  // ── Header ────────────────────────────────────────────────────────────────────
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'JPEG', pageWidth / 2 - 10, 3, 20, 20)
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)
    doc.text(`NIT: ${STORE.nit}`, pageWidth / 2, 26, { align: 'center' })
    doc.text(`Tel: ${STORE.phone}`, pageWidth / 2, 30, { align: 'center' })
    if (STORE.address) doc.text(STORE.address, pageWidth / 2, 34, { align: 'center' })
    doc.setLineWidth(0.3)
    doc.line(margin, 37, pageWidth - margin, 37)
    doc.text(`Fecha: ${formatDateTime(sale.date)}`, margin, 42)
    doc.text(`Venta #: ${sale.id}`, margin, 46)
    doc.text(`Cliente: ${sale.customer.name}`, margin, 50)
    doc.text(`Pago: ${sale.paymentMethod}`, margin, 54)
    doc.line(margin, 57, pageWidth - margin, 57)
    autoTable(doc, {
      startY: 59,
      head: [['SKU', 'Producto', 'Cant', 'Precio', 'Total']],
      body: sale.items.map(item => [
        item.sku,
        item.name.substring(0, 15),
        item.qty,
        formatCOP(item.price),
        formatCOP(item.price * item.qty),
      ]),
      theme: 'plain',
      styles: { font: 'courier', fontSize: 7, cellPadding: 1 },
      headStyles: { fontStyle: 'bold', fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 14 },
        1: { cellWidth: 20 },
        2: { cellWidth: 8, halign: 'center' },
        3: { cellWidth: 16, halign: 'right' },
        4: { cellWidth: 16, halign: 'right' },
      },
      margin: { left: margin, right: margin },
    })
    const finalY = doc.lastAutoTable.finalY + 3
    const rightX = pageWidth - margin
    if (sale.discount > 0) {
      doc.text('Subtotal:', rightX - 40, finalY)
      doc.text(formatCOP(sale.subtotal), rightX, finalY, { align: 'right' })
      doc.text('Descuento:', rightX - 40, finalY + 4)
      doc.text(`- ${formatCOP(sale.discount)}`, rightX, finalY + 4, { align: 'right' })
    }
    doc.setFont('courier', 'bold')
    doc.setFontSize(9)
    const totalY = sale.discount > 0 ? finalY + 9 : finalY
    doc.text('TOTAL:', rightX - 40, totalY)
    doc.text(formatCOP(sale.total), rightX, totalY, { align: 'right' })
    doc.setLineWidth(0.3)
    doc.line(margin, totalY + 3, pageWidth - margin, totalY + 3)
    doc.setFont('courier', 'bold')
    doc.setFontSize(8)
    doc.text('¡Gracias por su compra!', pageWidth / 2, totalY + 8, { align: 'center' })
    doc.setFont('courier', 'normal')
    doc.setFontSize(7)
    doc.text(STORE.slogan, pageWidth / 2, totalY + 13, { align: 'center' })
    doc.save(`recibo-${sale.id}.pdf`)
    return
  }

  doc.setFont('courier', 'bold')
  doc.setFontSize(14)
  doc.text(STORE.name, pageWidth / 2, 10, { align: 'center' })

  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.text(`NIT: ${STORE.nit}`, pageWidth / 2, 15, { align: 'center' })
  doc.text(`Tel: ${STORE.phone}`, pageWidth / 2, 19, { align: 'center' })
  if (STORE.address) doc.text(STORE.address, pageWidth / 2, 23, { align: 'center' })

  doc.setLineWidth(0.3)
  doc.line(margin, 26, pageWidth - margin, 26)

  doc.text(`Fecha: ${formatDateTime(sale.date)}`, margin, 31)
  doc.text(`Venta #: ${sale.id}`, margin, 35)
  doc.text(`Cliente: ${sale.customer.name}`, margin, 39)
  doc.text(`Pago: ${sale.paymentMethod}`, margin, 43)

  doc.line(margin, 46, pageWidth - margin, 46)

  const tableBody = sale.items.map(item => [
    item.sku,
    item.name.substring(0, 15),
    item.qty,
    formatCOP(item.price),
    formatCOP(item.price * item.qty),
  ])

  autoTable(doc, {
    startY: 48,
    head: [['SKU', 'Producto', 'Cant', 'Precio', 'Total']],
    body: tableBody,
    theme: 'plain',
    styles: { font: 'courier', fontSize: 7, cellPadding: 1 },
    headStyles: { fontStyle: 'bold', fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 20 },
      2: { cellWidth: 8, halign: 'center' },
      3: { cellWidth: 16, halign: 'right' },
      4: { cellWidth: 16, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  const finalY = doc.lastAutoTable.finalY + 3
  const rightX = pageWidth - margin

  doc.setFont('courier', 'normal')
  doc.setFontSize(8)

  if (sale.discount > 0) {
    doc.text('Subtotal:', rightX - 40, finalY)
    doc.text(formatCOP(sale.subtotal), rightX, finalY, { align: 'right' })
    doc.text('Descuento:', rightX - 40, finalY + 4)
    doc.text(`- ${formatCOP(sale.discount)}`, rightX, finalY + 4, { align: 'right' })
  }

  doc.setFont('courier', 'bold')
  doc.setFontSize(9)
  const totalY = sale.discount > 0 ? finalY + 9 : finalY
  doc.text('TOTAL:', rightX - 40, totalY)
  doc.text(formatCOP(sale.total), rightX, totalY, { align: 'right' })

  doc.setLineWidth(0.3)
  doc.line(margin, totalY + 3, pageWidth - margin, totalY + 3)

  doc.setFont('courier', 'bold')
  doc.setFontSize(8)
  doc.text('¡Gracias por su compra!', pageWidth / 2, totalY + 8, { align: 'center' })

  doc.setFont('courier', 'normal')
  doc.setFontSize(7)
  doc.text(STORE.slogan, pageWidth / 2, totalY + 13, { align: 'center' })
  if (STORE.website) doc.text(STORE.website, pageWidth / 2, totalY + 17, { align: 'center' })

  doc.save(`recibo-${sale.id}.pdf`)
}

export async function generateShippingLabel(sale) {
  const W = 74
  const H = 100
  const doc = new jsPDF({ unit: 'mm', format: [W, H], orientation: 'portrait' })
  const lx = 5

  // ── Cargar y recortar logo (elimina el espacio blanco del JPEG) ──────────────
  let logoDataUrl = null
  try {
    const res = await fetch('/logo.jpeg')
    const blob = await res.blob()
    const rawDataUrl = await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
    // Recortar el centro del imagen donde está el monograma (~50% del área)
    logoDataUrl = await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const crop = 0.52
        const sx = img.width  * (1 - crop) / 2
        const sy = img.height * (1 - crop) / 2
        const sw = img.width  * crop
        const sh = img.height * crop
        const canvas = document.createElement('canvas')
        canvas.width  = sw
        canvas.height = sh
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, sw, sh)
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
        resolve(canvas.toDataURL('image/jpeg', 0.95))
      }
      img.src = rawDataUrl
    })
  } catch {}

  // ── Fondo blanco ─────────────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, W, H, 'F')

  // ── Borde exterior ────────────────────────────────────────────────────────────
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.rect(2, 2, W - 4, H - 4)

  // ── Header: logo o texto ──────────────────────────────────────────────────────
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'JPEG', W / 2 - 16, 3, 32, 32)
  } else {
    doc.setFillColor(0, 0, 0)
    doc.rect(2, 2, W - 4, 18, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text(STORE.name, W / 2, 15, { align: 'center' })
  }

  // Línea separadora bajo el logo
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.6)
  doc.line(2, 36, W - 2, 36)

  // ── Pedido + fecha ────────────────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(`N° ${sale.id}`, lx, 41)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(formatDate(sale.date), W - lx, 41, { align: 'right' })

  // ── Slogan ────────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(0, 0, 0)
  doc.text(`"${STORE.slogan}"`, W / 2, 46, { align: 'center' })

  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  doc.line(lx, 48, W - lx, 48)

  // ── Campos destinatario ───────────────────────────────────────────────────────
  const fields = [
    { label: 'Nombre',    value: sale.customer.name },
    { label: 'Celular',   value: sale.customer.phone },
    { label: 'Dirección', value: sale.customer.address },
    { label: 'Ciudad',    value: sale.customer.city },
  ]

  let y = 52
  fields.forEach(({ label, value }) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(0, 0, 0)
    doc.text(label.toUpperCase(), lx, y)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const display = doc.splitTextToSize(value, W - lx * 2)[0]
    doc.text(display, lx, y + 5.5)

    y += 10
  })

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.4)
  doc.line(lx, H - 11, W - lx, H - 11)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.text(`TOTAL: ${formatCOP(sale.total)}`, lx, H - 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(sale.paymentMethod, W - lx, H - 6, { align: 'right' })

  doc.save(`etiqueta-${sale.id}.pdf`)
}
