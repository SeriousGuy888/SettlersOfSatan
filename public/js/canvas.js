const gameCanvas = document.querySelector("#game-canvas")
/**
 * @type {RenderingContext} ctx
 */
const ctx = gameCanvas.getContext("2d")
const canvasWidth = 1920
const canvasHeight = 1080
const canvasElems = []


const canvasFullscreenButton = document.querySelector("#canvas-fullscreen")
canvasFullscreenButton.addEventListener("click", () => {
  if(gameCanvas.requestFullscreen) gameCanvas.requestFullscreen()
  else if(gameCanvas.webkitRequestFullScreen) gameCanvas.webkitRequestFullScreen()
  else if(gameCanvas.mozRequestFullScreen) gameCanvas.mozRequestFullScreen()
})

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
  const hexApothem = Math.sqrt(hexRadius ** 2 - (hexRadius / 2) ** 2)
*/


const hexRadius = 100
const hexApothem = Math.sqrt(hexRadius ** 2 - (hexRadius / 2) ** 2)

let drawLoop = false
let board

setInterval(() => {
  if(drawLoop) {
    if(board) {
      canvasFunctions.draw()
    }
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

  // for(const elem of canvasElems) {
  //   if(elem.render) {
  //     elem.render()
  //   }
  //   if(elem.delete) {
  //     canvasElems.splice(canvasElems.indexOf(elem), 1)
  //   }
  // }


  let y = hexRadius
  for (let i in board) {
    const row = board[i]

    const rowWidth = (row.length - 1) * hexApothem
    const xCenter = canvasWidth / 2 - rowWidth
    let x = xCenter

    for (let space of row) {
      if (space) {
        const xOffset = i % 2 !== 0 ? hexApothem : 0
        canvasFunctions.drawHex(x + xOffset, y, space.resource, space.number)
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

canvasFunctions.drawHex = (x, y, resource, number) => {
  const angle = 2 * Math.PI / 6

  ctx.beginPath()
  for (var i = 0; i < 6; i++) { // thieved from https://eperezcosano.github.io/hex-grid/
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
  ctx.stroke()
  ctx.closePath()

  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.arc(x, y, hexRadius / 3, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.closePath()

  ctx.fillStyle = "#000"
  ctx.font = `bold ${hexRadius / 4}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(number.toString(), x, y)
}