<template>
  <div id="resource-cards">
    <div
      v-for="resource in resourceNames"
      :key="resource"
      class="resource-card"
      id="resource-bricks"
    >
      <img :src="getResourceIcon(resource)" :alt="resource">
      <h3 class="resource">
        {{ state.player ? state.player.resources[resource] : 0 }} [{{ state.game ? state.game.stockpile[resource] : 0 }}]
      </h3>
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
      ]
    }
  },
  methods: {
    getResourceIcon(resource) {
      return require(`@/images/resource_cards/${resource}.png`)
    }
  },
}
</script>