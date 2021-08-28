<template>
  <div id="turn-data-display">
    <div>
      <h4 id="turn-player-header">{{ state.game.ended ? "Winner" : "Turn" }}</h4>
      <p id="turn-player">{{ state.game.players[state.game.ended ? state.game.winner : state.game.turn].name }}</p>
    </div>
    <div :class="{ 'attention-pls': remainingTime <= 15 }">
      <h4 id="turn-timer-header">{{ timerHeader }}</h4>
      <p id="turn-timer">{{ state.game.ended ? "Take your screenshots!" : remainingTime }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.$store.state,
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
      this.remainingTime = Math.round((this.state.game.turnCountdownTo - Date.now()) / 1000)
    }, 1000)
  },
  computed: {
    timerHeader() {
      if(this.state.game.ended) return "Game Over"
      return this.actionNames[this.state.game.currentAction]
    },
  },
}
</script>