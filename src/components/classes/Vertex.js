class Vertex {
  constructor(that, xPos, yPos, data) {
    this.that = that
    this.xPos = xPos
    this.yPos = yPos
    Object.assign(this, data)
  }

  render() {
    const { that, xPos, yPos } = this
    const { ctx } = that

    if(this.harbour) {
      const harbourCoords = this.harbour
      const harbourHex = that.board.hexes.filter(hex => hex.coords.x === harbourCoords.x && hex.coords.y === harbourCoords.y)[0]

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

    if(this.building) {
      const { playerId, type } = this.building
      const colour = canvasFunctions.getPlayer(playerId)?.colour
      const { width: w, height: h } = this.getDimensions()
      canvasFunctions.drawPiece(type, colour, this.xPos - w / 2, this.yPos - h / 2, w, h)
    }
    
    
    if(!this.allowPlacement) return

    // if(holding === "settlement") {
    //   if(!this.allowPlacement) return
    //   if(this.building) return

    //   drawSelectCircle(xPos, yPos, this)
    // }
    // if(holding === "city") {
    //   if(!this.building) return
    //   if(this.building.playerId !== currentGameData.me.id) return
    //   if(this.building.type !== "settlement") return

    //   drawSelectCircle(xPos, yPos, this)
    // }
  }
  
  // getDimensions() {
  //   return selectionTargetDims
  // }

  // onClick() {
  //   if(!this.isHovered(true)) return

  //   console.log(`Clicked on vertex ${JSON.stringify(this.data.coords)} while holding ${holding}`)

  //   if(!this.allowPlacement) return
  //   if(!["settlement", "city"].includes(holding)) return

  //   if(holding === "city" && this.building?.type !== "settlement") return

  //   socket.emit("perform_game_action", {
  //     action: "place_" + holding,
  //     coords: this.coords,
  //   }, (err, data) => {
  //     if(err) notifyUser(err)
  //   })
    
    
  //   if(holding === "settlement" && currentGameData.turnCycle <= 2) holding = "road"
  //   else setHolding(null)
  // }
}

module.exports = Vertex