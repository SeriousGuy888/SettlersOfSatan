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
  if(drawLoop) {
    canvasFunctions.draw()
  }
}, 1000 / 60)

const canvasFunctions = {}

canvasFunctions.setup = () => {
  gameCanvas.width = canvasWidth
  gameCanvas.height = canvasHeight

  canvasFunctions.setupInventory()
  
  let board = currentGameData.board
  
  const startY = hexRadius
  const yOffsetPerRow = hexRadius * 2 - hexRadius / 2
  if(board) {
    let y = startY
    for(let i in board) {
      const row = board[i]
  
      const rowWidth = (row.length - 1) * hexApothem
      const xCenter = canvasWidth / 2 - rowWidth
      let x = xCenter
  
      for(let j in row) {
        const hex = row[j]
        if(hex) {
          const xOffset = i % 2 !== 0 ? hexApothem : 0

          // j is the x coord and i is the y coord lol
          boardHexes.push(
            new canvasClasses.Hex(
              x + xOffset, y,
              [parseInt(j), parseInt(i)],
              hex.resource,
              hex.number
            )
          )

          
          if(hex.vertexes) {
            for(let vertPos in hex.vertexes) {
              boardVertexes.push(
                new canvasClasses.Vertex(
                  x + xOffset, y + (vertPos === "north" ? -hexRadius : hexRadius)
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

  drawLoop = true
}
canvasFunctions.stop = () => {
  canvasElems.splice(0, canvasElems.length)
  drawLoop = false
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
}

canvasFunctions.background = (colour) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.beginPath()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = colour || "#dedede"
  ctx.fill()
}

canvasFunctions.drawHex = (x, y, resource, number) => {
}

canvasFunctions.setupInventory = () => {
  // i hate web programming so much
  // i guess we are having one place button for everything
  canvasElems.push(new canvasClasses.Button("Place Item", 50, 180, () => {
    placeMode = true
    // alert(JSON.stringify(currentGameData.settlementGrid))
    // socket.emit("send_game_update", {}, (err, data) => {
      
    // })
  }))
}
canvasFunctions.drawInventory = () => {
  const inventory = currentGameData.players[playerId].inventory
  if(!inventory) return

  const x = 50
  const y = 50
  const w = 300
  const h = 500

  // ctx.fillStyle = "#efef90"

  // ctx.beginPath()
  // ctx.rect(x, y, w, h)
  // ctx.fill()

  ctx.fillStyle = "#000"
  ctx.font = `32px sans-serif`
  ctx.textAlign = "left"
  ctx.textBaseline = "top"

  ctx.fillText(`Settlements: ${inventory.settlements}`, x, y)
  ctx.fillText(`Cities: ${inventory.cities}`, x, y + 40)
  ctx.fillText(`Roads: ${inventory.roads}`, x, y + 80)
}

gameCanvas.addEventListener("click", e => {
  for(const elem of canvasElems) {
    if(elem.onClick) {
      elem.onClick()
    }
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