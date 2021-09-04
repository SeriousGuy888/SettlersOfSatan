class Edge {
  constructor(that, coordsArr, data) {
    this.that = that    
    this.coordsArr = coordsArr
    Object.assign(this, data)
    this.radius = this.that.hexRadius / 6
  }

  render() {
    const { coordsArr, that, radius } = this
    const { board, ctx, drawSelectCircle, holding, state } = that

    const getVertex = coords => {
      return board.vertexes.filter(vert => {
        const vCoords = vert.coords
        return vCoords.x === coords.x && vCoords.y === coords.y && vCoords.v === coords.v
      })[0]
    }

    const vertA = getVertex(coordsArr[0])
    const vertB = getVertex(coordsArr[1])
    if(!vertA || !vertB) return
    this.xPos = (vertA.xPos + vertB.xPos) / 2
    this.yPos = (vertA.yPos + vertB.yPos) / 2

    if(this.road) {
      const roadOwner = this.road
      const colour = state.game.players[roadOwner].colour

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
      if(this.road) return
      if(!this.allowPlacement) return
      drawSelectCircle(this.xPos, this.yPos, radius)
    }
  }

  isHovered(mousePos) {
    const { that, xPos, yPos, radius } = this
    return that.getDist(mousePos.x, mousePos.y, xPos, yPos) <= radius
  }

  click() {
    const { that } = this
    const { holding, setHolding, state } = that

    if(!this.allowPlacement) return
    if(this.road) return
    if(holding !== "road") return

    console.log(`Clicked on edge ${JSON.stringify(this.coordsArr)}`)
    socket.emit("perform_game_action", {
      action: "place_road",
      coordsArr: this.coordsArr,
    }, () => {})

    setHolding(null)
  }
}

module.exports = Edge