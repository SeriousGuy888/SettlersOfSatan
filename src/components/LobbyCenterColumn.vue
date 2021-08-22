<template>
  <div>
    <div id="turn-data-display">
      <div>
        <h4 id="turn-player-header">{{ game.ended ? "Winner" : "Turn" }}</h4>
        <p id="turn-player">{{ game.players[game.ended ? game.winner : game.turn].name }}</p>
      </div>
      <div :class="{ 'attention-pls': remainingTime <= 15 }">
        <h4 id="turn-timer-header">{{ timerHeader }}</h4>
        <p id="turn-timer">{{ game.ended ? "Take your screenshots!" : remainingTime }}</p>
      </div>
    </div>
    <LobbyCenterColumnCanvas :game="game" :player="player" />
  </div>
</template>

<script>
import LobbyCenterColumnCanvas from "./LobbyCenterColumnCanvas.vue"

export default {
  props: {
    game: Object,
    player: Object,
  },
  components: {
    LobbyCenterColumnCanvas
  },
  data() {
    return {
      remainingTime: 666,
      actionNames: {
        roll_dice: "Roll Dice",
        discard: "Discarding...",
        build: "Build & Trade"
      },
    }
  },
  mounted() {
    setInterval(() => {
      this.remainingTime = Math.round((this.game.turnCountdownTo - Date.now()) / 1000)
    }, 1000)
  },
  computed: {
    timerHeader() {
      if(this.game.ended) return "Game Over"
      return this.actionNames[this.game.currentAction]
    },
  },
}
</script>