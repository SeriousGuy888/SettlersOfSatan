<template>
  <div id="resource-cards">
    <div
      v-for="resource in resourceNames"
      :key="resource"
      class="resource-card"
      :class="{
        'green-pulse': shouldPulse(resource, true),
        'red-pulse': shouldPulse(resource, false),
      }"
    >
      <img :src="getResourceIcon(resource)" :alt="resource">
      <h3 :title="`You have this many ${resource} cards.`">{{ getResourcePlayerAmt(resource) }}</h3>
      <p :title="`The bank has this many ${resource} cards.`">{{ state.game ? state.game.stockpile[resource] : 0 }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.$store.state,
      resourceNames: [
        "bricks",
        "lumber",
        "wool",
        "wheat",
        "ore",
      ],
    }
  },
  methods: {
    getResourceIcon(resource) {
      return `/images/resource_cards/${resource}.png`
    },
    getResourcePlayerAmt(resource) {
      if(!this.state.player) return 0
      return this.state.player.resources[resource]
    },
    shouldPulse(resource, green) {
      if(!this.state.player || !this.state.playerPrev) return false

      const curr = this.state.player.resources[resource]
      const prev = this.state.playerPrev.resources[resource]
      if(green) return (curr > prev)
      else return (curr < prev)
    }
  },
}
</script>

<style scoped>
#resource-cards {
  display: grid;
  gap: 3px;
  grid: 1fr 1fr 1fr / 1fr 1fr;
  margin-top: 1em;
}
.resource-card {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  border-radius: 5px;
  text-align: center;
  align-items: center;
  margin: 0.1em;
}
.resource-card.green-pulse { animation: green-pulse 1s; }
.resource-card.red-pulse { animation: red-pulse 1s; }
.resource-card > img {
  width: 2.5em;
  height: 2.5em;
  padding: 0.2em;
}
.resource-card > .trade-amount-selection-div {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}
.resource-card > .trade-amount-selection-div > .trade-amount-input {
  width: 2em;
  height: 2em;
  background-color: #0000;
  border: 3px solid #bb9662;
  border-radius: 5px;
  padding: 0;
  text-align: center;
  font-size: 1em;
}
.resource-card > .resource {
  text-align: right;
}
</style>