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
          :disabled="state.game.trade.offer || (singleSelectionMode && total > 0 && !amounts[resource])"
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
    tradeParty: String,
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
    singleSelectionMode() {
      return ["stockpile", "monopoly"].includes(this.tradeMode)
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
      if(this.singleSelectionMode && Object.values(this.amounts).filter(e => e > 0).length > 1) {
        this.wipe()
      }
      if(this.tradeMode === "monopoly") {
        for(let i in this.amounts) {
          if(this.amounts[i] > 1) this.amounts[i] = 1
        }
      }

      if(this.state.game && this.state.game.trade.offer) {
        this.amounts = this.state.game.trade.offer[this.tradeParty]
      }
    }, 1000)
  },
}
</script>

<style scoped>
.trade-column {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.trade-amount-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 3px;
}
.trade-amount-div > img {
  width: 2.5em;
}
.trade-amount-div > input {
  background-color: #0000;
  width: 33%;
  text-align: center;
  border: 2px solid #47f;
  border-radius: 5px;
  transition: 500ms;
  font-size: 1.2em;
}
.trade-amount-div > input:disabled {
  border: 2px solid transparent;
  color: var(--theme-text);
}
.trade-amount-div-right > img { order: 2; }
</style>