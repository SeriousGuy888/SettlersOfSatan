const canvasClasses = {}

let devSettings = {
  displayAxis: null,
  hexCoords: false,
}
holding = holding // NOSONAR

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

const selectionTargetDims = {
  width: hexRadius / 6 * 2,
  height: hexRadius / 6 * 2,
}




const drawSelectCircle = (xPos, yPos, self) => {
  ctx.fillStyle = "#08f8"
  ctx.beginPath()
  ctx.arc(xPos, yPos, self.getDimensions().width / 2, 0, 2 * Math.PI)
  ctx.fill()
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
  constructor(xPos, yPos, data) {
    super()

    const { coords, resource, number, robber, invisible, harbour, glowing } = data

    this.xPos = xPos
    this.yPos = yPos
    this.coords = coords
    this.resource = resource
    this.number = number
    this.robber = robber
    this.invisible = invisible
    this.harbour = harbour
    this.glowing = glowing
  }

  render() {
    const { xPos, yPos, resource, number, harbour, glowing } = this

    ctx.lineWidth = 1
    ctx.strokeStyle = "#000"

    if(harbour) {
      ctx.fillStyle = "#666"

      ctx.beginPath()
      // ctx.arc(xPos, yPos, hexRadius / 4, 0, 2 * Math.PI)
      ctx.fillText(`${harbour.deal.amount} ${harbour.deal.resource}`, xPos, yPos)
      ctx.closePath()
      ctx.fill()
    }

    if(this.invisible) return

    const angle = 2 * Math.PI / 6
    ctx.beginPath()
    for(let i = 0; i < 6; i++) { // thieved from https://eperezcosano.github.io/hex-grid/
      ctx.lineTo(
        xPos + hexRadius * Math.cos(angle * i - angle / 2),
        yPos + hexRadius * Math.sin(angle * i - angle / 2)
      )
    }
  
    const resourceColours = {
      "mud": "#b35d00",
      "forest": "#00630d",
      "mountain": "#4d4b51",
      "farm": "#fef177",
      "pasture": "#94ff8f",
      "desert": "#a39d5d"
    }
  

    const axisCols = ["#239123", "#23c123"]
    switch(devSettings.displayAxis) {
      case "x":
        ctx.fillStyle = this.coords.x % 2 === 0 ? axisCols[0] : axisCols[1]
        break
      case "y":
        ctx.fillStyle = this.coords.y % 2 === 0 ? axisCols[0] : axisCols[1]
        break
      default:
        ctx.fillStyle = resourceColours[resource]
        break
    }

    ctx.closePath()
    ctx.stroke()
    ctx.fill()
  
    if(this.robber) {
      let robberWidth = hexRadius / 1.5
      let robberHeight = hexRadius / 1.5
      canvasFunctions.drawRobber(xPos - robberWidth / 2, yPos - robberHeight / 2, robberWidth, robberHeight)
    }
    else if(number) { // do not display the hex's number if the hex has the robber
      ctx.fillStyle = "#fff"

      ctx.beginPath()
      ctx.arc(xPos, yPos, hexRadius / 3, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      ctx.fillStyle = number === 8 || number === 6 ? "#f00" : "#000" 
      ctx.font = `bold ${hexRadius / 4}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      if(devSettings.hexCoords) ctx.fillText(`${this.coords.x},${this.coords.y}`, xPos, yPos)
      else ctx.fillText(number.toString(), xPos, yPos)


      if(currentGameData && currentGameData.turn === currentGameData.me?.id && currentGameData.robbing) {
        drawSelectCircle(xPos, yPos, this)
      }
    }
  }

  getDimensions() {
    return {
      width: hexApothem * 1.5,
      height: hexApothem * 1.5,
    }
  }

  onClick() {
    if(!this.isHovered(true)) return
    console.log(`Clicked on hex ${JSON.stringify(this.coords)}`)

    if(currentGameData.turn === currentGameData.me.id && currentGameData.robbing && !this.robber) {
      socket.emit("perform_game_action", {
        action: "move_robber",
        coords: this.coords,
      }, (err, data) => {
        if(err) notifyUser(err)
      })
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


    if(this.data.harbour) {
      const harbourCoords = this.data.harbour
      const harbourHex = boardHexes.filter(hex => hex.coords.x === harbourCoords.x && hex.coords.y === harbourCoords.y)[0]

      const fromPos = [this.xPos, this.yPos]
      const toPos = [harbourHex.xPos + (this.xPos - harbourHex.xPos) / 3.5, harbourHex.yPos + (this.yPos - harbourHex.yPos) / 3.5]

      ctx.beginPath()
      ctx.moveTo(...fromPos.map(e => Math.round(e)))
      ctx.lineTo(...toPos.map(e => Math.round(e)))
      ctx.lineWidth = 15
      ctx.strokeStyle = "#b87a1d"
      ctx.stroke()
      ctx.closePath()
    }

    if(this.data.building) {
      const { playerId, type } = this.data.building
      const colour = canvasFunctions.getPlayer(playerId)?.colour
      const { width: w, height: h } = this.getDimensions()
      canvasFunctions.drawPiece(type, colour, this.xPos - w / 2, this.yPos - h / 2, w, h)
    }
    
    
    if(!this.data.allowPlacement) return

    if(holding === "settlement") {
      if(!this.data.allowPlacement) return
      if(this.data.building) return

      drawSelectCircle(xPos, yPos, this)
    }
    if(holding === "city") {
      if(!this.data.building) return
      if(this.data.building.playerId !== currentGameData.me.id) return
      if(this.data.building.type !== "settlement") return

      drawSelectCircle(xPos, yPos, this)
    }
  }
  
  getDimensions() {
    return selectionTargetDims
  }

  onClick() {
    if(!this.isHovered(true)) return

    console.log(`Clicked on vertex ${JSON.stringify(this.data.coords)} while holding ${holding}`)

    if(!this.data.allowPlacement) return
    if(!["settlement", "city"].includes(holding)) return

    if(holding === "city" && this.data.building?.type !== "settlement") return

    socket.emit("perform_game_action", {
      action: "place_" + holding,
      coords: this.data.coords,
    }, (err, data) => {
      if(err) notifyUser(err)
    })
    
    
    if(holding === "settlement" && currentGameData.turnCycle <= 2) holding = "road"
    else setHolding(null)
  }
}

canvasClasses.Edge = class extends canvasClasses.Hoverable {
  constructor(coordsArr, data) {
    super()
    
    this.coordsArr = coordsArr
    this.data = data
  }

  render() {
    const { coordsArr } = this

    const getVertex = coords => {
      return boardVertexes.filter(vert => {
        const vCoords = vert.data.coords
        return vCoords.x === coords.x && vCoords.y === coords.y && vCoords.v === coords.v
      })[0]
    }

    const vertA = getVertex(coordsArr[0])
    const vertB = getVertex(coordsArr[1])
    if(!vertA || !vertB) return

    this.xPos = (vertA.xPos + vertB.xPos) / 2
    this.yPos = (vertA.yPos + vertB.yPos) / 2

    if(this.data.road) {
      const road = this.data.road
      const colour = canvasFunctions.getPlayer(road).colour

      ctx.beginPath()
      ctx.moveTo(vertA.xPos, vertA.yPos)
      ctx.lineTo(vertB.xPos, vertB.yPos)

      ctx.lineWidth = 14
      ctx.strokeStyle = "#fff"
      ctx.stroke()
      ctx.lineWidth = 10
      ctx.strokeStyle = colour
      ctx.stroke()
      ctx.closePath()
    }

    if(holding === "road") {
      if(this.data.road) return
      if(!this.data.allowPlacement) return

      ctx.fillStyle = "#08f8"
      ctx.beginPath()
      ctx.arc(this.xPos, this.yPos, this.getDimensions().width / 2, 0, 2 * Math.PI)
      ctx.fill()

    }
  }
  
  getDimensions() {
    return selectionTargetDims
  }

  onClick() {
    if(!this.data.allowPlacement) return
    if(!this.isHovered(true)) return
    if(this.data.road) return
    if(holding !== "road") return

    console.log(`Clicked on edge ${JSON.stringify(this.coordsArr)}`)

    socket.emit("perform_game_action", {
      action: "place_road",
      coordsArr: this.data.coordsArr,
    }, (err, data) => {
      if(err) notifyUser(err)
    })

    setHolding(null)
  }
}