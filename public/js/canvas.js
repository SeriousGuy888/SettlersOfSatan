// const { Socket } = require("socket.io")

const gameCanvas = document.querySelector("#game-canvas")
/**
 * @type {RenderingContext} ctx
 */
const ctx = gameCanvas.getContext("2d")
const canvasWidth = 1000
const canvasHeight = 1000
const canvasElems = []

const boardHexes = []
const boardVertexes = []
const boardEdges = []

var robberImgSrc = "/images/robber.png"

let mousePos = { x: 0, y: 0 }

// const canvasFullscreenButton = document.querySelector("#canvas-fullscreen")
// canvasFullscreenButton.addEventListener("click", () => {
//   if(gameCanvas.requestFullscreen) gameCanvas.requestFullscreen()
//   else if(gameCanvas.webkitRequestFullScreen) gameCanvas.webkitRequestFullScreen()
//   else if(gameCanvas.mozRequestFullScreen) gameCanvas.mozRequestFullScreen()
// })

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


const hexRadius = 90
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

  canvasFunctions.refreshBoard()

  drawLoop = true
}
canvasFunctions.stop = () => {
  canvasElems.splice(0, canvasElems.length)
  drawLoop = false
}


canvasFunctions.refreshBoard = () => {
  let board = currentGameData.board
  let vertexes = currentGameData.vertexes
  let edges = currentGameData.edges
  
  boardHexes.splice(0, boardHexes.length)
  boardVertexes.splice(0, boardVertexes.length)
  boardEdges.splice(0, boardEdges.length)

  const startY = hexRadius / 2
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

          boardHexes.push(new canvasClasses.Hex(Math.round(x + xOffset), Math.round(y), hex))
          
          const hexVertexes = vertexes.filter(e => e.coords.x === hex.coords.x && e.coords.y === hex.coords.y)

          if(hexVertexes) {
            for(let vertex of hexVertexes) {
              if(!vertex) continue

              boardVertexes.push(
                new canvasClasses.Vertex(
                  x + xOffset,
                  y + (vertex.coords.v === "north" ? -hexRadius : hexRadius),
                  vertex
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
  if(edges) {
    for(let edge of edges) {
      boardEdges.push(new canvasClasses.Edge(edge.coordsArr, edge))
    }
  }

  if(currentGameData.robbing && currentGameData.turn === currentGameData.me.id) {
    robberImgSrc = "/images/glowing_robber.png"
    let buildings = []

    let hexesAdjacentToBuildings = []
    console.log(vertexes)
    for(vertex of currentGameData.vertexes) {
      if(vertex.building){
        for(adjacentHex of vertex.adjacentHexes){
          
        }
      }
    }
  }
  else {
    robberImgSrc = "/images/robber.png"
  }
}



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

  for(const e of boardHexes)      e.render()
  for(const e of boardEdges)      e.render()
  for(const e of boardVertexes)   e.render()
}

canvasFunctions.background = (colour) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.beginPath()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = colour || "#0000"
  ctx.fill()
}

canvasFunctions.drawPiece = (piece, colour, x, y, w, h) => {
  ctx.fillStyle = colour
  ctx.lineWidth = 3
  ctx.strokeStyle = "#fff"

  if(piece == "settlement") {
    ctx.beginPath()
    ctx.moveTo(x + w / 2, y)
    ctx.lineTo(x, y + h / 2)
    ctx.lineTo(x + w, y + h / 2)
    ctx.closePath()
    ctx.moveTo(x + w, y + h / 2)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x, y + h / 2)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
  }

  else if(piece == "city") {
    ctx.beginPath()
    ctx.moveTo(x, y + h)
    ctx.moveTo(x, y + h / 2)
    ctx.lineTo(x + w / 2, y + h / 2)
    ctx.lineTo(x + w / 2, y + h * 0.25)
    ctx.lineTo(x + w * 0.75, y)
    ctx.lineTo(x + w, y + h * 0.25)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
  }

  else if(piece == "road") {
    ctx.beginPath()
    ctx.fillRect(x, y, 32, 32/3)
    ctx.fill()
    ctx.stroke()
  }
}

// socket.on("move_robber", (data, callback) => {
  // canvasFunctions.changeRobberAppearance(true)
// })

canvasFunctions.drawRobber = (x, y, w, h) => {
  let robberImg = new Image()
  robberImg.src = robberImgSrc
  ctx.drawImage(robberImg, x, y, w, h);
}

canvasFunctions.changeRobberAppearance = (robbing) => {
  if(robbing && currentGameData.turn === currentGameData.me.id) {
    robberImgSrc = "/images/glowing_robber.png"
  }
  else {
    robberImgSrc = "/images/robber.png"
  }
}

canvasFunctions.getPlayer = (playerId) => {
  return currentGameData.players[playerId] || null
}



gameCanvas.addEventListener("click", e => {
  for(const elem of canvasElems)    if(elem.onClick) elem.onClick()
  for(const elem of boardHexes)     if(elem.onClick) elem.onClick()
  for(const elem of boardEdges)     if(elem.onClick) elem.onClick()
  for(const elem of boardVertexes)  if(elem.onClick) elem.onClick()
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