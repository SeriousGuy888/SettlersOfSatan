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
import winHot from "../../sounds/win_hot.wav"
import winWava from "../../sounds/win_wava.wav"
import itsYourTurn from "../../sounds/your_turn.mp3"

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
      winSoundPlayed: false,
    }
  },
  mounted() {
    setInterval(this.updateRemainingTime, 1000)
    socket.on("game_update", data => {
      if(data.turnTick && this.state.game.turn === this.state.player.id) {
        this.itsYourTurn.play()
      }
    })
  },
  setup() {
    const volume = useStore().state.prefs.volume / 100
    return {
      fifteenSecondsLeft: useSound(fifteenSecondsLeft, { volume }),
      winHot: useSound(winHot, { volume }),
      winWava: useSound(winWava, { volume }),
      itsYourTurn: useSound(itsYourTurn, { volume }),
    }
  },
  methods: {
    updateRemainingTime() {
      if(!this.state.game) return
      this.remainingTime = Math.round((this.state.game.turnCountdownTo - Date.now()) / 1000)
      
      if(this.state.game.ended) {
        if(this.state.game.winner === this.state.player.id) {
          if(!this.winSoundPlayed) {
            if(Math.floor(Math.random() * 9) === 0) {
              this.winHot.play()
            } else {
              this.winWava.play()
            }
            this.winSoundPlayed = true
          }
        }
      } else if(this.state.game.currentAction === "build" && this.remainingTime === 15) {
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