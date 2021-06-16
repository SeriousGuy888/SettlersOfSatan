const gameCanvas = document.querySelector("#game-canvas")
/**
 * @type {RenderingContext} ctx
 */
const ctx = gameCanvas.getContext("2d")

const canvasWidth = 1280
const canvasHeight = 720

const canvasElems = []

let drawLoop = false
let board

setInterval(() => {
  if(drawLoop) {
    if (board) canvasFunctions.draw(board)
  }
}, 500)

const canvasFunctions = {}
canvasFunctions.setup = (setupBoard) => {
  gameCanvas.width = canvasWidth
  gameCanvas.height = canvasHeight
  drawLoop = true
  board = setupBoard
}
canvasFunctions.stop = () => drawLoop = false
canvasFunctions.draw = (board) => {
  canvasFunctions.background()

  for(const elem of canvasElems) {
    if(elem.render) {
      elem.render()
    }
    if(elem.delete) {
      canvasElems.splice(canvasElems.indexOf(elem), 1)
    }
  }

  let top = 50
  for (let row of board) {
    let column = 50
    for (let space of row) {
      if (space) canvasFunctions.drawHexagon(column, top, space.resource)
      column += 100
    }
    top += 100
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