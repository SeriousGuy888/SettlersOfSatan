<template>
  <div id="turn-controls">
    <button
      @click="onClick()"
      :disabled="buttonDisabled"
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
        if(confirm("This will put everyone back in the queueing screen. (Some people might still want to take screenshots.)\nAre you sure?")) {
          socket.emit("edit_lobby_setting", {
            backToLobby: true
          }, (err, data) => {
            if(err) alert(err)
          })
        }
      }
      else {
        const action = this.state.game.currentAction === "roll_dice" ? "roll_dice" : "end_turn"
        socket.emit("perform_game_action", { action }, console.log)
      }
    }
  },
  computed: {
    buttonText() {
      if(!this.state?.game) return "aaaaaaaaaaaaaaaaaaaaaa"
      if(this.state.game.ended)
        return "Back to Lobby"
      if(this.state.game.turn !== this.state?.player?.id)
        return "It is not your turn..."
      
      switch(this.state.game.currentAction) {
        case "roll_dice":
          return "Roll Dice"
        case "discard":
          return "Players are discarding..."
        default:
          return "End Turn"
      }
    },
    buttonDisabled() {
      if(!this.state.game) return true
      if(this.state.game.ended) return false
      return this.state.game.turn !== this.state.player?.id || this.state.game.currentAction === 'discard'
    },
  }
}
</script>