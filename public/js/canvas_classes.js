const canvasClasses = {}

canvasClasses.BaseElem = class {
  constructor() {
    this.spawnTimestamp = Date.now()
    this.delete = false
  }
}
canvasClasses.Text = class extends canvasClasses.BaseElem {
  constructor(text, x, y) {
    super()
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
canvasClasses.Button = class extends canvasClasses.BaseElem {
  constructor(label, x, y) {
    super()
    this.label = label
    this.x = x
    this.y = y
  }

  getLabel() {
    return this.label
  }

  getX() {
    return this.x
  }

  getY() {
    return this.y
  }
}