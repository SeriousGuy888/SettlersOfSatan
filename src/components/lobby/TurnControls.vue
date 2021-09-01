<template>
  <div id="turn-controls">
    <button
      @click="onClick()"
      :disabled="state.game?.turn !== state.player?.id || state.game?.currentAction === 'discard'"
    >{{ buttonText }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.$store.state,
    }
  },
  methods: {
    onClick() {
      if(this.state.game.ended) {
        socket.emit("edit_lobby_setting", {
          backToLobby: true
        })
      }
      else {
        const action = this.state.game.currentAction === "roll_dice" ? "roll_dice" : "end_turn"
        socket.emit("perform_game_action", { action }, console.log)
      }
    }
  },
  computed: {
    buttonText() {
      if(this.state?.game?.turn !== this.state?.player?.id) return "It is not your turn..."
      switch(this.state.game.currentAction) {
        case "roll_dice":
          return "Roll Dice"
        case "discard":
          return "Players are discarding..."
        default:
          return "End Turn"
      }
    }
  }
}
</script>