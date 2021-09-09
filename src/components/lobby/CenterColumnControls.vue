<template>
  <div id="game-controls" class="button-group" v-if="state.player">
    <button
      :class="{ active: holding === 'settlement' }" 
      :disabled="shouldDisable('settlement')"
      @click="setHolding('settlement')"
    >
      <img src="/images/game_controls/settlement.svg" alt="Settlement">
      <p>{{ state.player.inventory.settlements }}</p>
    </button>
    <button
      :class="{ active: holding === 'city' }"
      :disabled="shouldDisable('city')"
      @click="setHolding('city')"
    >
      <img src="/images/game_controls/city.svg" alt="City">
      <p>{{ state.player.inventory.cities }}</p>
    </button>
    <button
      :class="{ active: holding === 'road' }"
      :disabled="shouldDisable('road')"
      @click="setHolding('road')"
    >
      <img src="/images/game_controls/road.svg" alt="Road">
      <p>{{ state.player.inventory.roads }}</p>
    </button>
    <button
      :disabled="shouldDisable('developmentCard')"
      @click="buyDevelopmentCard()"
    >
      <img src="/images/game_controls/development_card.svg" alt="Development Card">
    </button>
  </div>
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
    shouldDisable(buttonName) {
      return (
        (!this.state.player.enableControls[buttonName]) ||
        this.state.game.currentAction !== "build" ||
        this.state.game.turn !== this.state.player.id
      )
    },
  },
  mounted() {
    socket.on("game_update", data => {
      if(data.turnTick) {
        if(data.turn === this.state.player.id && data.turnCycle <= 2) {
          this.setHolding("settlement")
        } else {
          this.setHolding(null)
        }
      }
      if(data.roadBuilding) {
        this.setHolding("road")
      }
    })
  },
}
</script>

<style scoped>
#game-controls {
  display: flex;
  align-content: flex-start;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 3px;
  padding: 0 0.5em;
}
#game-controls > button {
  display: flex;
  flex: 1 0 0;
  height: 4em;
  padding: 1em;
  align-items: center;
  justify-content: space-evenly;
}
#game-controls > button.active {
  border: 2px solid var(--theme-select-1);
  background-color: var(--theme-select-2);
}
#game-controls > button > img {
  height: 2em;
  width: 2em;
}
#game-controls > button > p {
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  width: 1.65em;
  line-height: 1.65em;
  border: 2px solid var(--theme-text);
  border-radius: 50%;
}
</style>