<template>
  <div id="resource-cards">
    <div
      v-for="resource in resourceNames"
      :key="resource"
      class="resource-card"
      id="resource-bricks"
    >
      <img :src="getResourceIcon(resource)" :alt="resource">
      <h3 class="resource">{{ player ? player.resources[resource] : 0 }} [{{ game ? game.stockpile[resource] : 0 }}]</h3>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    player: Object,
    game: Object,
  },
  data() {
    return {
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