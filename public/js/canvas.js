const gameCanvas = document.querySelector("#game-canvas")
/**
 * @type {RenderingContext} ctx
 */
const ctx = gameCanvas.getContext("2d")

const canvasWidth = 1280
const canvasHeight = 720

const canvasFunctions = {}


canvasFunctions.setup = () => {
  gameCanvas.width = canvasWidth
  gameCanvas.height = canvasHeight

  canvasFunctions.background()
}

canvasFunctions.background = (colour) => {
  ctx.beginPath()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = colour || "#dedede"
  ctx.fill()
}