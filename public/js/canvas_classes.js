const canvasClasses = {}

canvasClasses.Text = class {
  constructor(text, x, y) {
    this.text = text
    this.x = x
    this.y = y
  }

  render() {
    ctx.fillStyle = "#000"
    ctx.font = "18px sans-serif"
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

    ctx.fillStyle = this.isHovered() ? "#94a9ff" : "#3b61ff"
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