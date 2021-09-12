class Hex {
  constructor(that, xPos, yPos, data) {
    this.that = that
    this.xPos = xPos
    this.yPos = yPos
    Object.assign(this, data)
  }
  render() {
    const { xPos, yPos, resource, number, harbour, that } = this
    const { ctx, drawSelectCircle, state, hexRadius, drawRobber } = that
    const { game, player } = state

    ctx.lineWidth = 1
    ctx.strokeStyle = "#000"

    if(harbour) {
      ctx.beginPath()
      ctx.fillStyle = "#ddd"
      ctx.strokeStyle = "#000"
      ctx.arc(xPos, yPos, Math.round(hexRadius / 2), 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
      
      
      let resourceImg = new Image()
      resourceImg.src = `/images/resource_cards/${harbour.deal.resource}.png`
      const imgWidth = Math.round(hexRadius / 1.5)
      const imgOffset = Math.round(imgWidth / 2.5)
      ctx.drawImage(resourceImg, xPos - imgOffset, yPos - imgOffset, imgWidth, imgWidth)

      ctx.beginPath()
      ctx.fillStyle = "#000"
      ctx.fillText(`${harbour.deal.amount}`, xPos - imgOffset, yPos - imgOffset)
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
  

    ctx.fillStyle = resourceColours[resource]

    ctx.closePath()
    ctx.stroke()
    ctx.fill()
  
    if(this.robber) {
      let robberWidth = hexRadius / 1.5
      let robberHeight = hexRadius / 1.5
      drawRobber(xPos - robberWidth / 2, yPos - robberHeight / 2, robberWidth, robberHeight)
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

      // if(devSettings.hexCoords) ctx.fillText(`${this.coords.x},${this.coords.y}`, xPos, yPos)
      // else
      ctx.fillText(number.toString(), xPos, yPos)
    }

    if(player && game.turn === player.id && game.robbing && !this.robber) {
      drawSelectCircle(xPos, yPos, hexRadius * 0.75)
    }
  }

  isHovered(mousePos) {
    let { xPos, yPos } = this
    const { hexApothem } = this.that
    const width = hexApothem * 1.5
    const height = hexApothem * 1.5

    xPos -= width / 2
    yPos -= height / 2
    
    return (
      mousePos.x >= xPos &&
      mousePos.y >= yPos &&
      mousePos.x <= xPos + width &&
      mousePos.y <= yPos + height
    )
  }

  click() {
    const { state } = this.that

    console.log(`Clicked on hex ${JSON.stringify(this.coords)}`)
    if(state.player && state.game.turn === state.player.id && state.game.robbing && !this.robber && !this.invisible) {
      socket.emit("perform_game_action", {
        action: "move_robber",
        coords: this.coords,
      }, () => {})
    }
  }
}

module.exports = Hex