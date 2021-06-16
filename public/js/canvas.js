const gameCanvas = document.querySelector("#game-canvas")
/**
 * @type {RenderingContext} ctx
 */
const ctx = gameCanvas.getContext("2d")

const canvasWidth = 1280
const canvasHeight = 720

const canvasElems = []

let drawLoop = false
setInterval(() => {
  if(drawLoop) {
    canvasFunctions.draw()
  }
}, 500)

const canvasFunctions = {}
canvasFunctions.setup = () => {
  gameCanvas.width = canvasWidth
  gameCanvas.height = canvasHeight
  drawLoop = true
}
canvasFunctions.stop = () => drawLoop = false
canvasFunctions.draw = () => {
  canvasFunctions.background()

  for(const elem of canvasElems) {
    if(elem.render) {
      elem.render()
    }
    if(elem.delete) {
      canvasElems.splice(canvasElems.indexOf(elem), 1)
    }
  }
}

canvasFunctions.background = (colour) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.beginPath()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = colour || "#dedede"
  ctx.fill()
}

canvasFunctions.drawHexagon = (x, y, resource, number) => { // thieved from https://eperezcosano.github.io/hex-grid/
  const angle = 2 * Math.PI / 6
  const r = 50

  ctx.beginPath()
  for (var i = 0; i < 6; i++) {
    ctx.lineTo(x + r * Math.cos(angle * i), y + r * Math.sin(angle * i))
  }

  const resourceColours = {
    "mud": "#753d00",
    "forest": "#0e5700",
    "mountain": "#333333",
    "farm": "#fef177",
    "pasture": "#94ff8f",
    "desert": "#a39d5d"
  }

  ctx.fillStyle = resourceColours[resource]
  ctx.fill()
  ctx.closePath()
  ctx.stroke()
}