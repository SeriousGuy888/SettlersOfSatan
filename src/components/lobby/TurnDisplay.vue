<template>
  <div id="turn-data-display" v-if="state.game">
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
import { useStore } from "vuex"
import { useSound } from "@vueuse/sound"
import fifteenSecondsLeft from "../../sounds/fifteen_seconds_left.wav"

export default {
  data() {
    return {
      state: useStore().state,
      remainingTime: 666,
      actionNames: {
        roll_dice: "Roll Dice",
        discard: "Discarding...",
        build: "Build & Trade"
      },
    }
  },
  mounted() {
    setInterval(this.updateRemainingTime, 1000)
  },
  setup() {
    return {
      fifteenSecondsLeft: useSound(fifteenSecondsLeft, { volume: useStore().state.prefs.volume / 100 }),
    }
  },
  methods: {
    updateRemainingTime() {
      if(!this.state.game) return
      this.remainingTime = Math.round((this.state.game.turnCountdownTo - Date.now()) / 1000)
      
      if(this.state.game.currentAction === "build" && this.remainingTime === 95) {
        this.fifteenSecondsLeft.play()
      }
    },
  },
  computed: {
    timerHeader() {
      if(this.state.game.ended) return "Game Over"
      this.updateRemainingTime()
      return this.actionNames[this.state.game.currentAction]
    },
  },
}
</script>

<style scoped>
  #turn-data-display {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
  }
  #turn-data-display > div {
    flex: 1 0 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    border: 3px solid var(--theme-game-display-1);
    background-color: var(--theme-game-display-2);
    padding: 0.5em 0.25em;
    border-radius: 3px;
  }
  #turn-data-display > div > * {
    display: flex;
    justify-content: center;
    margin: 0;
    padding: 0;
  }
</style>