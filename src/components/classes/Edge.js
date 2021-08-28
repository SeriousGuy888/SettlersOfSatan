class Edge {
  constructor(that, coordsArr, data) {
    this.that = that    
    this.coordsArr = coordsArr
    Object.assign(this, that)
  }

  render() {
    const { coordsArr, that } = this

    const getVertex = coords => {
      return that.board.vertexes.filter(vert => {
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
      const road = this.road
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

    // if(holding === "road") {
    //   if(this.road) return
    //   if(!this.allowPlacement) return

    //   ctx.fillStyle = "#08f8"
    //   ctx.beginPath()
    //   ctx.arc(this.xPos, this.yPos, this.getDimensions().width / 2, 0, 2 * Math.PI)
    //   ctx.fill()

    // }
  }
  
  getDimensions() {
    return selectionTargetDims
  }

  // onClick() {
  //   if(!this.allowPlacement) return
  //   if(!this.isHovered(true)) return
  //   if(this.road) return
  //   if(holding !== "road") return

  //   console.log(`Clicked on edge ${JSON.stringify(this.coordsArr)}`)

  //   socket.emit("perform_game_action", {
  //     action: "place_road",
  //     coordsArr: this.coordsArr,
  //   }, (err, data) => {
  //     if(err) notifyUser(err)
  //   })

  //   if(currentGameData.roadBuilding < 2) setHolding(null)
  // }
}

module.exports = Edge