const gameCanvas = document.querySelector("#game-canvas")
/**
 * @type {RenderingContext} ctx
 */
const ctx = gameCanvas.getContext("2d")

const canvasWidth = 1280
const canvasHeight = 720

const canvasElems = []


/*
  billzo's hexagon notes

  The radius of a regular hexagon = the side length
  
  To find apothem
  a^2 + b^2 = c^2
  a = apothem
  b = side length / 2 = radius / 2
  c = radius

  a^2 + (radius / 2)^2 = radius^2
  a^2 = radius^2 - (radius / 2)^2
  a = sqrt(radius^2 - (radius / 2)^2)

  so in javascript:
  const apothem = Math.sqrt(hexRadius ** 2 - (hexRadius / 2) ** 2)
*/


const hexRadius = 50
const hexApothem = Math.sqrt(hexRadius ** 2 - (hexRadius / 2) ** 2)

let drawLoop = false
let board

setInterval(() => {
  if(drawLoop) {
    if (board) canvasFunctions.draw()
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

  let y = hexRadius
  for (let i in board) {
    const row = board[i]
    let x = hexRadius
    for (let space of row) {
      if (space) {
        const xOffset = i % 2 !== 0 ? hexApothem : 0
        canvasFunctions.drawHexagon(x + xOffset, y, space.resource)
      }
      x += hexApothem * 2
    }
    y += hexRadius * 2 - hexRadius / 2
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

  ctx.beginPath()
  for (var i = 0; i < 6; i++) {
    ctx.lineTo(
      x + hexRadius * Math.cos(angle * i - angle / 2),
      y + hexRadius * Math.sin(angle * i - angle / 2)
    )
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