<template>
  <div class="trade-column">
    <div
      v-for="resource in Object.keys(amounts)"
      :key="resource"
      id="trade-taker-inputs"
      class="trade-column"
    >
      <div
        class="trade-amount-div"
        :class="{ 'trade-amount-div-right': rightSide }"
      >
        <img :src="getResourceIcon(resource)" :alt="resource">
        <input
          v-model="amounts[resource]"
          @change="updateAmounts()"
          :disabled="state.game.trade.offer || (tradeMode === 'stockpile' && total > 0 && !amounts[resource])"
          type="number"
          min="0"
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rightSide: Boolean,
    tradeMode: String,
  },
  data() {
    return {
      state: this.$store.state,
      amounts: {
        "bricks": 0,
        "lumber": 0,
        "wool": 0,
        "wheat": 0,
        "ore": 0,
      }
    }
  },
  computed: {
    total() {
      return Object.values(this.amounts).reduce((acc, cur) => acc + cur)
    },
  },
  methods: {
    getResourceIcon(resource) {
      return `/images/resource_cards/${resource}.png`
    },
    updateAmounts() {
      this.$emit("updateAmounts", this.amounts)
    },
    wipe() {
      for(let i in this.amounts) {
        this.amounts[i] = 0
      }
    },
  },
  mounted() {
    this.updateAmounts()
    setInterval(() => {
      if(this.tradeMode === "stockpile" && Object.values(this.amounts).filter(e => e > 0).length > 1) {
        this.wipe()
      }
    }, 1000)
  },
}
</script>