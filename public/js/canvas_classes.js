const canvasClasses = {}

var holding = null

const lighterShades = {
  "violet": "#ff93ff",
  "indigo": "#5c1193",
  "red": "#ff2222",
  "orange": "#ffb611",
  "green": "#008000",
  "blue": "#0000ff",
  "brown": "#a52a2a",
  "darkcyan": "#008b8b"
}

canvasClasses.Hoverable = class {
  isHovered(centeredPos) {
    let { xPos, yPos } = this
    const { width, height } = this.getDimensions()

    if(centeredPos) {
      xPos -= width / 2
      yPos -= height / 2
    }

    return (
      mousePos.x >= xPos &&
      mousePos.y >= yPos &&
      mousePos.x <= xPos + width &&
      mousePos.y <= yPos + height
    )
  }
}

canvasClasses.Text = class {
  constructor(text, x, y, font, colour, alignment, baseline) {
    this.text = text
    this.x = x
    this.y = y
    this.font = font
    this.colour = colour
    this.alignment = alignment
    this.baseline = baseline
  }

  render() {
    ctx.fillStyle =     this.colour     || "#000"
    ctx.font =          this.font       || "18px sans-serif"
    ctx.textAlign =     this.alignment  || "left"
    ctx.textBaseline =  this.baseline   || "top"
    ctx.fillText(this.text, this.x, this.y)
  }
}
canvasClasses.Button = class extends canvasClasses.Hoverable {
  constructor(label, xPos, yPos, func) {
    super()

    this.label = label
    this.xPos = xPos
    this.yPos = yPos
    this.func = func
  }

  getFontSize() { return 24 }
  getPadding() { return 20 }

  getDimensions() {
    const padding = this.getPadding()
    const width = ctx.measureText(this.label).width
    const height = this.getFontSize()

    return {
      width: width + padding,
      height: height + padding
    }
  }

  render() {
    const fontSize = this.getFontSize()
    ctx.font = `${fontSize}px sans-serif`

    const { label, xPos, yPos } = this
    const { width, height } = this.getDimensions()

    const buttonPadding = this.getPadding()

    ctx.fillStyle = this.isHovered() ? "#94a9ff" : "#617fff"
    ctx.fillRect(xPos, yPos, width, height)

    ctx.fillStyle = "#000"
    ctx.fillText(label, xPos + buttonPadding / 2, yPos + buttonPadding / 2)
  }

  onClick() {
    if(this.isHovered() && this.func) {
      this.func()
    }
  }
}
canvasClasses.Hex = class extends canvasClasses.Hoverable {
  constructor(xPos, yPos, coords, resource, number) {
    super()

    this.xPos = xPos
    this.yPos = yPos
    this.coords = coords
    this.resource = resource
    this.number = number
  }

  render() {
    const angle = 2 * Math.PI / 6
    const { xPos, yPos, resource, number } = this

    ctx.beginPath()
    for(let i = 0; i < 6; i++) { // thieved from https://eperezcosano.github.io/hex-grid/
      ctx.lineTo(
        xPos + hexRadius * Math.cos(angle * i - angle / 2),
        yPos + hexRadius * Math.sin(angle * i - angle / 2)
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
  
    if(number !== "robber") {
      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.arc(xPos, yPos, hexRadius / 3, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  
    if(number) {
      ctx.fillStyle = "#000"
      ctx.font = `bold ${hexRadius / 4}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(number.toString(), xPos, yPos)
      // ctx.fillText(JSON.stringify(this.coords), xPos, yPos)
    }
  }
}
canvasClasses.Vertex = class extends canvasClasses.Hoverable {
  constructor(xPos, yPos, data) {
    super()
    
    this.xPos = xPos
    this.yPos = yPos
    this.data = data
  }

  render() {
    const { xPos, yPos } = this

    ctx.fillStyle = "#08f"
    if(!holding && !this.data.building) {
      return
    }
    if(this.data.building) {
      const { colour } = canvasFunctions.getPlayer(this.data.building.playerId)
      ctx.fillStyle = colour
    }

    ctx.beginPath()
    ctx.arc(xPos, yPos, this.getDimensions().width / 2, 0, 2 * Math.PI)
    ctx.fill()
  }
  
  getDimensions() {
    return {
      width: hexRadius / 5 * 2,
      height: hexRadius / 5 * 2,
    }
  }

  onClick() {
    if(!this.isHovered(true)) return
    if(!holding) return
    console.log(holding)
    socket.emit("perform_game_action", {
      action: "place_" + holding,
      coords: this.data.coords,
    }, (err, data) => {
      if(err) notifyUser(err)
    })

    holding = null
    
  }
}

canvasClasses.UnplacedPiece = class extends canvasClasses.Hoverable {
  constructor (piece, colour, x, y) {

    super()

    this.piece = piece
    this.colour = colour
    this.xPos = x
    this.yPos = y
  }

  render() {
    const { width: w, height: h } = this.getDimensions()
    canvasFunctions.drawPiece(this.piece, this.colour, this.xPos, this.yPos, w, h)
  }

  getDimensions() {
    return {
      width: 32,
      height: 32
    }
  }

  onClick() {
    if(!this.isHovered()) return

    if(holding === this.piece) holding = null
    else holding = this.piece
    
    this.colour = lighterShades[this.colour]
    console.log("yoooooooooooooo")
  }
}