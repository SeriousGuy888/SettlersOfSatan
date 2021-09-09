<template>
  <canvas
    @mousemove="onMouseMove"
    @click="onClick"
    ref="canvas"
    id="game-canvas"
  >
    your browser doesnt want to display the canvas D:
  </canvas>
</template>

<script>
import Hex from "./classes/Hex.js"
import Vertex from "./classes/Vertex.js"
import Edge from "./classes/Edge.js"

export default {
  props: {
    holding: String,
  },
  data() {
    return {
      state: this.$store.state,
      canvas: null,
      ctx: null,
      mousePos: {},
      board: {
        hexes: [],
        vertexes: [],
        edges: [],
      },
      hexRadius: 85,
    }
  },
  computed: {
    drawLoop() {
      return !!this.state.game
    },
    hexApothem() {
      return Math.sqrt(
        this.hexRadius * this.hexRadius -
        (this.hexRadius / 2) * (this.hexRadius / 2)
      )
    },
  },
  mounted() {
    this.canvas = this.$refs.canvas
    this.canvas.width = 1000
    this.canvas.height = 1000
    this.ctx = this.canvas.getContext("2d")

    setInterval(() => {
      if(this.drawLoop) this.draw()
    }, 1000 / 10)
  },
  methods: {
    onClick() {
      if(!this.state.game || !this.state.player) return

      Object.values(this.board).forEach(arr => {
        arr.forEach(elem => {
          if(elem.isHovered && elem.isHovered(this.mousePos)) {
            if(elem.click) elem.click()
          }
        })
      })
    },
    draw() {
      if(!this.state.game || !this.state.player) return

      const { ctx } = this

      this.refresh()
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      const renderElems = (arr) => arr.forEach(e => { if(e.render) e.render() })
      renderElems(this.board.hexes)
      renderElems(this.board.edges)
      renderElems(this.board.vertexes)
    },
    refresh() {
      const { hexes, vertexes, edges } = this.state.game.board
      const { board, hexRadius, hexApothem } = this

      Object.values(board).forEach(arr => arr.splice(0, arr.length))

      const startY = hexRadius
      const yOffsetPerRow = hexRadius * 2 - hexRadius / 2
      if(hexes) {
        let y = startY
        for(let i in hexes) {
          const row = hexes[i]
      
          const rowWidth = (row.length - 1) * hexApothem
          const xCenter = this.canvas.width / 2 - rowWidth
          let x = xCenter
      
          for(const hex of row) {
            if(hex) {
              const xOffset = i % 2 !== 0 ? hexApothem : 0
              
              board.hexes.push(new Hex(this, Math.round(x + xOffset), Math.round(y), hex))
              
              const hexVertexes = vertexes.filter(e => e.coords.x === hex.coords.x && e.coords.y === hex.coords.y)

              if(hexVertexes) {
                for(let vertex of hexVertexes) {
                  if(!vertex) continue

                  board.vertexes.push(
                    new Vertex(this, Math.round(x + xOffset), Math.round(y + (vertex.coords.v === "north" ? -hexRadius : hexRadius)), vertex)
                  )
                }
              }
            }

            x += hexApothem * 2
          }
          y += yOffsetPerRow
        }
      }
      if(edges) {
        for(let edge of edges) {
          this.board.edges.push(new Edge(this, edge.coordsArr, edge))
        }
      }
    },
    getDist(x1, y1, x2, y2) {
      return Math.sqrt((x2-x1)**2 + (y2-y1)**2)
    },
    drawSelectCircle(xPos, yPos, radius) {
      const { ctx } = this
      ctx.fillStyle = "#08f8"
      ctx.beginPath()
      ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI)
      ctx.fill()
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
      const { ctx } = this
      let robberImg = new Image()
      robberImg.src = "/images/robber.png"
      ctx.drawImage(robberImg, x, y, w, h)
    },
    onMouseMove(e) {
      var rect = this.canvas.getBoundingClientRect()
      const widthRatio = rect.width / this.canvas.width
      const heightRatio = rect.height / this.canvas.width
      this.mousePos.x = Math.round(e.offsetX / widthRatio)
      this.mousePos.y = Math.round(e.offsetY / heightRatio)
    },
    setHolding(holding) {
      if(!holding || holding === this.holding) holding = ""
      this.$emit("setHolding", holding)
    },
  },
}
</script>