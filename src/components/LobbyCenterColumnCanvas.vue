<template>
  <canvas
    ref="canvas"
    @click="onClick"
    @mousemove="onMouseMove"
  >
    your browser doesnt want to display the canvas D:
  </canvas>
</template>

<script>
export default {
  props: {
    game: Object,
    player: Object,
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      mousePos: {},
      drawLoop: false,
      elems: {
        hexes: [],
        vertexes: [],
        edges: [],
      },
      hexRadius: 90,
      hexApothem: Math.sqrt(this.hexRadius ** 2 - (this.hexRadius / 2) ** 2),
      robberImgSrc: null,
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext("2d")
  },
  methods: {
    setup() {
      this.canvas.width = 1000
      this.canvas.height = 1000
      this.refreshBoard()
      this.drawLoop = true
    },
    draw() {
      this.background()

      for(const arr of this.elems) {
        for(const elem of arr) {
          if(elem.render) elem.render()
        }
      }
    },
    background(colour) {
      this.ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      this.ctx.beginPath()
      this.ctx.rect(0, 0, canvasWidth, canvasHeight)
      this.ctx.fillStyle = colour || "#0000"
      this.ctx.fill()
    },
    refreshBoard() {
      const { hexes, vertexes, edges } = this.game.board
      this.elems.forEach(arr => arr.splice(0, arr.length)) // clear elem arrays

      const startY = this.hexRadius / 2
      const yOffsetPerRow = this.hexRadius * 2 - this.hexRadius / 2
      if(hexes) {
        let y = startY
        for(let i in hexes) {
          const row = hexes[i]
      
          const rowWidth = (row.length - 1) * this.hexApothem
          const xCenter = this.canvas.width / 2 - rowWidth
          let x = xCenter
      
          for(const hex of row) {
            if(hex) {
              const xOffset = i % 2 !== 0 ? this.hexApothem : 0

              this.elems.hexes.push(new canvasClasses.Hex(Math.round(x + xOffset), Math.round(y), hex))

              const hexVertexes = vertexes.filter(e => e.coords.x === hex.coords.x && e.coords.y === hex.coords.y)
              if(hexVertexes) {
                for(let vertex of hexVertexes) {
                  if(!vertex) continue

                  this.board.vertexes.push(
                    new canvasClasses.Vertex(
                      x + xOffset,
                      y + (vertex.coords.v === "north" ? -this.hexRadius : this.hexRadius),
                      vertex
                    )
                  )
                }
              }
            }

            x += this.hexApothem * 2
          }
          y += yOffsetPerRow
        }
      }
      if(edges) {
        for(let edge of edges) {
          this.board.edges.push(new canvasClasses.Edge(edge.coordsArr, edge))
        }
      }

      if(currentGameData.robbing && currentGameData.turn === currentGameData.me.id)
        this.robberImgSrc = "/images/glowing_robber.png"
      else
        this.robberImgSrc = "/images/robber.png"
    },
    drawPiece(piece, colour, x, y, w, h) {
      const { ctx } = this

      ctx.fillStyle = colour || "#666"
      ctx.lineWidth = 3
      ctx.strokeStyle = "#fff"

      if(piece == "settlement") {
        ctx.beginPath()
        ctx.moveTo(x + w / 2, y)
        ctx.lineTo(x, y + h / 2)
        ctx.lineTo(x + w, y + h / 2)
        ctx.closePath()
        ctx.moveTo(x + w, y + h / 2)
        ctx.lineTo(x + w, y + h)
        ctx.lineTo(x, y + h)
        ctx.lineTo(x, y + h / 2)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
      }

      else if(piece == "city") {
        ctx.beginPath()
        ctx.moveTo(x, y + h)
        ctx.moveTo(x, y + h / 2)
        ctx.lineTo(x + w / 2, y + h / 2)
        ctx.lineTo(x + w / 2, y + h * 0.25)
        ctx.lineTo(x + w * 0.75, y)
        ctx.lineTo(x + w, y + h * 0.25)
        ctx.lineTo(x + w, y + h)
        ctx.lineTo(x, y + h)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
      }

      else if(piece == "road") {
        ctx.beginPath()
        ctx.fillRect(x, y, 32, 32/3)
        ctx.fill()
        ctx.stroke()
      }
    },
    drawRobber(x, y, w, h) {
      let robberImg = new Image()
      robberImg.src = this.robberImgSrc
      this.ctx.drawImage(robberImg, x, y, w, h)
    },
    onClick() {
      for(const arr of this.elems) {
        for(const elem of arr) {
          if(elem.onClick) elem.onClick()
        }
      }
    },
    onMouseMove(e) {
      this.mousePos.x = e.offsetX
      this.mousePos.y = e.offsetY
    }
  },
}
</script>