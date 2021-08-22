<template>
  <div class="trade-column">
    <div
      v-for="resource in resources"
      :key="resource"
      id="trade-taker-inputs"
      class="trade-column"
    >
      <div
        class="trade-amount-div"
        :class="{ 'trade-amount-div-right': rightSide }"
      >
        <img :src="getResourceIcon(resource)" :alt="resource">
        <input v-model="amounts[resource]" @change="updateAmounts()" type="number" min="0">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rightSide: Boolean,
  },
  data() {
    return {
      resources: [
        "bricks",
        "lumber",
        "wool",
        "wheat",
        "ore",
      ],
      amounts: {}
    }
  },
  methods: {
    getResourceIcon(resource) {
      return require(`@/images/resource_cards/${resource}.png`)
    },
    updateAmounts() {
      this.$emit("updateAmounts", this.amounts)
    },
  },
}
</script>