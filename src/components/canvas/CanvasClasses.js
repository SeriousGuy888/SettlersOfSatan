exports.ctx = null
exports.mousePos = null
exports.game = null
exports.player = null
exports.elems = null
exports.hexRadius = 90
exports.hexApothem = Math.sqrt(exports.hexRadius ** 2 - (exports.hexRadius / 2) ** 2)

exports.Hoverable = class {
  isHovered(centeredPos) {
    let { xPos, yPos } = this
    const { width, height } = this.getDimensions()

    if(centeredPos) {
      xPos -= width / 2
      yPos -= height / 2
    }

    return (
      exports.mousePos.x >= xPos &&
      exports.mousePos.y >= yPos &&
      exports.mousePos.x <= xPos + width &&
      exports.mousePos.y <= yPos + height
    )
  }
}

exports.Hex = class extends this.Hoverable {
  constructor(xPos, yPos, data) {
    super()

    const { coords, resource, number, robber, invisible, harbour } = data

    this.xPos = xPos
    this.yPos = yPos
    this.coords = coords
    this.resource = resource
    this.number = number
    this.robber = robber
    this.invisible = invisible
    this.harbour = harbour
  }

  render() {
    const ctx = exports.ctx
    const { xPos, yPos, resource, number, harbour } = this

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
        xPos + exports.hexRadius * Math.cos(angle * i - angle / 2),
        yPos + exports.hexRadius * Math.sin(angle * i - angle / 2)
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
  

    // const axisCols = ["#239123", "#23c123"]
    // switch(devSettings.displayAxis) {
    //   case "x":
    //     ctx.fillStyle = this.coords.x % 2 === 0 ? axisCols[0] : axisCols[1]
    //     break
    //   case "y":
    //     ctx.fillStyle = this.coords.y % 2 === 0 ? axisCols[0] : axisCols[1]
    //     break
    //   default:
        ctx.fillStyle = resourceColours[resource]
    //     break
    // }

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
    }

    if(exports.game && exports.game.turn === exports.player?.id && exports.game.robbing && !this.robber) {
      drawSelectCircle(xPos, yPos, this)
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

    if(exports.game.turn === exports.player.id && exports.game.robbing && !this.robber && !this.invisible) {
      socket.emit("perform_game_action", {
        action: "move_robber",
        coords: this.coords,
      }, (err, data) => {
        if(err) notifyUser(err)
      })
    }
  }
}

exports.Vertex = class extends this.Hoverable {
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
      console.log(exports.elems.hexes)
      const harbourHex = exports.elems.hexes.filter(hex => hex.coords.x === harbourCoords.x && hex.coords.y === harbourCoords.y)[0]

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
      if(this.data.building.playerId !== exports.player.id) return
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
    
    
    if(holding === "settlement" && exports.game.turnCycle <= 2) holding = "road"
    else setHolding(null)
  }
}

exports.Edge = class extends this.Hoverable {
  constructor(coordsArr, data) {
    super()
    
    this.coordsArr = coordsArr
    this.data = data
  }

  render() {
    const { coordsArr } = this

    const getVertex = coords => {
      return exports.elems.vertexes.filter(vert => {
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

    if(exports.game.roadBuilding < 2) setHolding(null)
  }
}