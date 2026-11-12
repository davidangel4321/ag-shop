// Genera un favicon cuadrado a partir del logo, recortando el espacio blanco
// (mismo recorte central que se usa en los PDF).
export function setLogoFavicon() {
  const img = new Image()
  img.onload = () => {
    const crop = 0.52
    const sw = img.width * crop
    const sh = img.height * crop
    const sx = (img.width - sw) / 2
    const sy = (img.height - sh) / 2
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
    // Escalar el recorte para llenar el cuadrado
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)

    let link = document.querySelector("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.type = 'image/png'
    link.href = canvas.toDataURL('image/png')
  }
  img.src = '/logo.jpeg'
}
