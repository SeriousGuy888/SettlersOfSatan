<template>
  <div id="game-controls" class="button-group">
    <button
      class="game-control-button"
      :class="{ active: holding === 'settlement' }" 
      :disabled="!state.player.enableControls.settlement"
      @click="setHolding('settlement')"
    >
      <img src="@/images/game_controls/settlement.svg" alt="Settlement">
    </button>
    <button
      class="game-control-button"
      :class="{ active: holding === 'city' }"
      :disabled="!state.player.enableControls.city"
      @click="setHolding('city')"
    >
      <img src="@/images/game_controls/city.svg" alt="City">
    </button>
    <button
      class="game-control-button"
      :class="{ active: holding === 'road' }"
      :disabled="!state.player.enableControls.road"
      @click="setHolding('road')"
    >
      <img src="@/images/game_controls/road.svg" alt="Road">
    </button>
    <button
      class="game-control-button"
      :disabled="!state.player.enableControls.developmentCard"
      @click="buyDevelopmentCard()"
    >
      <img src="@/images/game_controls/development_card.svg" alt="Development Card">
    </button>
  </div>
  <p id="inv-list">Settlements: 2, Roads: 2, Cities: 0</p>
</template>

<script>
export default {
  props: {
    holding: String,
  },
  data() {
    return {
      state: this.$store.state,
    }
  },
  methods: {
    setHolding(holding) {
      if(!holding || holding === this.holding) holding = ""
      this.$emit("setHolding", holding)
    },
    buyDevelopmentCard() {
      socket.emit("perform_game_action", {
        action: "buy_development_card"
      }, () => {})
    },
  },
  mounted() {
    socket.on("game_update", data => {
      if(data.turnTick) {
        if(this.state.game.turn === this.state.player.id && this.state.game.turnCycle <= 2) {
          this.setHolding("settlement")
        } else if(this.state.game.roadBuilding) {
          this.setHolding("road")
        } else {
          this.setHolding(null)
        }
      }
    })
  },
}
</script>