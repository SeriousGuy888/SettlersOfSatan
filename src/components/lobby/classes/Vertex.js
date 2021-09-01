class Vertex {
  constructor(that, xPos, yPos, data) {
    this.that = that
    this.xPos = xPos
    this.yPos = yPos
    Object.assign(this, data)
    this.radius = this.that.hexRadius / 6
  }

  render() {
    const { that, xPos, yPos, radius } = this
    const { ctx, holding, drawSelectCircle, drawPiece, state } = that

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
      const colour = state.game.players[playerId]?.colour
      drawPiece(type, colour, this.xPos - radius, this.yPos - radius, radius * 2, radius * 2)
    }
    
    
    if(!this.allowPlacement) return

    if(holding === "settlement") {
      if(this.building) return
      drawSelectCircle(xPos, yPos, radius)
    }
    if(holding === "city") {
      if(!this.building) return
      if(this.building.playerId !== state.player.id) return
      if(this.building.type !== "settlement") return
      drawSelectCircle(xPos, yPos, radius)
    }
  }

  isHovered(mousePos) {
    const { that, xPos, yPos, radius } = this
    return that.getDist(mousePos.x, mousePos.y, xPos, yPos) <= radius
  }

  click() {
    const { that } = this
    const { holding, setHolding, state } = that

    console.log(`Clicked on vertex ${JSON.stringify(this.coords)} while holding ${holding}`)

    if(!this.allowPlacement) return
    if(!["settlement", "city"].includes(holding)) return
    if(holding === "city" && this.building?.type !== "settlement") return

    socket.emit("perform_game_action", {
      action: `place_${holding}`,
      coords: this.coords,
    }, () => {})
    
    
    if(holding === "settlement" && state.game.turnCycle <= 2) {
      setHolding("road")
    } else {
      setHolding(null)
    }
  }
}

module.exports = Vertex