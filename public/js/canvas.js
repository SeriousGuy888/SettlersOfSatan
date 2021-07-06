const gameCanvas = document.querySelector("#game-canvas")
/**
 * @type {RenderingContext} ctx
 */
const ctx = gameCanvas.getContext("2d")
const canvasWidth = 1920
const canvasHeight = 1080
const canvasElems = []

const boardHexes = []
const boardVertexes = []
const unplacedPieces = []

let mousePos = { x: 0, y: 0 }

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

let placeMode = false

setInterval(() => {
  if(!drawLoop) return


  canvasFunctions.draw()
}, 1000 / 24)

const canvasFunctions = {}

canvasFunctions.setup = () => {
  gameCanvas.width = canvasWidth
  gameCanvas.height = canvasHeight

  canvasFunctions.setupInventory()
  canvasFunctions.refreshBoard()

  drawLoop = true
}
canvasFunctions.stop = () => {
  canvasElems.splice(0, canvasElems.length)
  drawLoop = false
}


canvasFunctions.refreshBoard = () => {
  let board = currentGameData.board
  
  boardHexes.splice(0, boardHexes.length)
  boardVertexes.splice(0, boardVertexes.length)

  const startY = hexRadius
  const yOffsetPerRow = hexRadius * 2 - hexRadius / 2
  if(board) {
    let y = startY
    for(let i in board) {
      const row = board[i]
  
      const rowWidth = (row.length - 1) * hexApothem
      const xCenter = canvasWidth / 2 - rowWidth
      let x = xCenter
  
      for(const hex of row) {
        if(hex) {
          const xOffset = i % 2 !== 0 ? hexApothem : 0

          if(!hex.invisible) {
            boardHexes.push(new canvasClasses.Hex(x + xOffset, y, hex.coords, hex.resource, hex.number))
          }
          
          if(hex.vertexes) {
            for(let v in hex.vertexes) {
              if(!hex.vertexes[v]) continue

              boardVertexes.push(
                new canvasClasses.Vertex(
                  x + xOffset,
                  y + (v === "north" ? -hexRadius : hexRadius),
                  hex.vertexes[v]
                )
              )
            }
          }
        }

        x += hexApothem * 2
      }
      y += yOffsetPerRow
    }
  }
}



canvasFunctions.draw = () => {
  canvasFunctions.background()



  canvasFunctions.drawInventory()

  for(const elem of canvasElems) {
    if(elem.render) {
      elem.render()
    }
    if(elem.delete) {
      canvasElems.splice(canvasElems.indexOf(elem), 1)
    }
  }

  for(const e of boardHexes) e.render()
  for(const e of boardVertexes) e.render()
  for(const e of unplacedPieces) e.render()
}

canvasFunctions.background = (colour) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.beginPath()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = colour || "#dedede"
  ctx.fill()
}

canvasFunctions.setupInventory = () => {
  const inventory = currentGameData?.players[playerId]?.inventory
  // i hate web programming so much
  // i guess we are having one place button for everything
  canvasElems.push(new canvasClasses.Button("Place Item", 50, 220, () => {
    placeMode = true
    // alert(JSON.stringify(currentGameData.settlementGrid))
    // socket.emit("send_game_update", {}, (err, data) => {
      
    // })
  }))
  
  
  
}
canvasFunctions.drawInventory = () => {
  const inventory = currentGameData?.players[playerId]?.inventory
  if(!inventory) return

  const x = 50
  const y = 50

  // ctx.fillStyle = "#efef90"

  // ctx.beginPath()
  // ctx.rect(x, y, w, h)
  // ctx.fill()

  ctx.fillStyle = "#000"
  ctx.font = `32px sans-serif`
  ctx.textAlign = "left"
  ctx.textBaseline = "top"

  ctx.fillText(`Settlements: `, x, y)
  unplacedPieces.splice(0, unplacedPieces.length)
  let settlementsY = 90
  let settlementsX = 50
  for(let i = 0; i < inventory.settlements; i++) {
    const colour = currentGameData?.players[playerId].colour
    unplacedPieces.push(new canvasClasses.UnplacedPiece("settlement", colour, settlementsX, settlementsY))
    settlementsX += 40
  }

  ctx.fillStyle = "#000"
  ctx.fillText(`Cities: ${inventory.cities}`, x, y + 80)
  ctx.fillStyle = "#000"
  ctx.fillText(`Roads: ${inventory.roads}`, x, y + 120)
}

canvasFunctions.unplacedSettlement = (x, y, colour) => {
  ctx.fillStyle = colour
  ctx.beginPath();
  ctx.moveTo(x + 16, y);
  ctx.lineTo(x, y + 16);
  ctx.lineTo(x + 32, y + 16);
  ctx.closePath();
  ctx.fill()
  ctx.beginPath();
  ctx.moveTo(x + 32, y + 16);
  ctx.lineTo(x + 32, y + 32);
  ctx.lineTo(x, y + 32);
  ctx.lineTo(x, y + 16);
  ctx.closePath();
  ctx.fill();
}

gameCanvas.addEventListener("click", e => {
  for(const elem of canvasElems) {
    if(elem.onClick) elem.onClick()
  }

  for(const elem of boardHexes) {
    if(elem.onClick) elem.onClick()
  }

  for(const elem of boardVertexes) {
    if(elem.onClick) elem.onClick()
  }

  for(const elem of unplacedPieces){
    if(elem.onClick) elem.onClick()
  }
})
gameCanvas.addEventListener("mousemove", e => mousePos = canvasFunctions.getMousePos(e))
canvasFunctions.getMousePos = (e) => {
  var rect = gameCanvas.getBoundingClientRect()

  const widthRatio = rect.width / canvasWidth
  const heightRatio = rect.height / canvasHeight

  return {
    x: (e.clientX - rect.left) / widthRatio,
    y: (e.clientY - rect.top) / heightRatio,
  }
}