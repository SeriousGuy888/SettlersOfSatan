<template>
  <div id="turn-controls">
    <button
      @click="onClick()"
      :disabled="game?.turn !== player?.id || game?.currentAction === 'discard'"
    >{{ buttonText }}</button>
  </div>
</template>

<script>
export default {
  props: {
    game: Object,
    player: Object,
  },
  methods: {
    onClick() {
      if(this.game.ended) {
        socket.emit("edit_lobby_setting", {
          backToLobby: true
        })
      }
      else {
        const action = this.game.currentAction === "roll_dice" ? "roll_dice" : "end_turn"
        socket.emit("perform_game_action", { action }, console.log)
      }
    }
  },
  computed: {
    buttonText() {
      if(this?.game?.turn !== this?.player?.id) return "It is not your turn..."
      switch(this.game.currentAction) {
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