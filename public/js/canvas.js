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

canvasFunctions.drawHexagon = (x, y) => { // thieved from https://eperezcosano.github.io/hex-grid/
  const angle = 2 * Math.PI / 6
  const r = 50

  ctx.beginPath()
  for (var i = 0; i < 6; i++) {
    ctx.lineTo(x + r * Math.cos(angle * i), y + r * Math.sin(angle * i))
  }
  ctx.closePath()
  ctx.stroke()
}

canvasFunctions.updateGame = () => {
  socket.emit("get_lobby_game", {}, (err, data) => {
    if(err) notifyUser(err)
    else {
      console.log(data)
    }
  })
}