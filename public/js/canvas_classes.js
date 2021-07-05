const canvasClasses = {}

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
canvasClasses.Button = class {
  constructor(label, x, y, func) {
    this.label = label
    this.x = x
    this.y = y
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

  isHovered() {
    const { x, y } = this
    const { width, height } = this.getDimensions()

    return (
      mousePos.x >= x &&
      mousePos.y >= y &&
      mousePos.x <= x + width &&
      mousePos.y <= y + height
    )
  }

  render() {
    const fontSize = this.getFontSize()
    ctx.font = `${fontSize}px sans-serif`

    const { label, x, y } = this
    const { width, height } = this.getDimensions()

    const buttonPadding = this.getPadding()

    ctx.fillStyle = this.isHovered() ? "#94a9ff" : "#617fff"
    ctx.fillRect(x, y, width, height)

    ctx.fillStyle = "#000"
    ctx.fillText(label, x + buttonPadding / 2, y + buttonPadding / 2)
  }

  onClick() {
    if(this.isHovered() && this.func) {
      this.func()
    }
  }
}
canvasClasses.Hex = class {
  constructor(x, y, resource, number) {
    this.x = x
    this.y = y
    this.resource = resource
    this.number = number
  }

  render() {
    const angle = 2 * Math.PI / 6
    const { x, y, resource, number } = this

    ctx.beginPath()
    for(let i = 0; i < 6; i++) { // thieved from https://eperezcosano.github.io/hex-grid/
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
  
    if(number !== "robber") {
      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.arc(x, y, hexRadius / 3, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  
    if(number) {
      ctx.fillStyle = "#000"
      ctx.font = `bold ${hexRadius / 4}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(number.toString(), x, y)
    }
  }
}
canvasClasses.Vertex = class {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  render() {
    const { x, y } = this

    
    ctx.fillStyle = "#f00"
    ctx.beginPath()
    ctx.arc(x, y, hexRadius / 5, 0, 2 * Math.PI)
    ctx.fill()
  }
}