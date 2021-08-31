<template>
  <div id="trade-panel">
    <div v-if="tradingAllowed" id="trade-interface">
      <p id="trade-offerer-name">{{ state.game.players[state.game.turn].name }}</p>
      <br>
      <select v-model="tradeMode" :disabled="tradeMode === 'discard'">
        <option value="humans">Humans</option>
        <option value="stockpile">Bank</option>
        <option value="discard" style="display: none;">Discard</option>
      </select>

      <TradePanelInputs
        @updateAmounts="updateAmounts('offerer', $event)"
        :tradeMode="tradeMode"
      />
      <div class="trade-icon">
        <img :src="getTradeIcon()" alt="trade">
      </div>
      <TradePanelInputs
        @updateAmounts="updateAmounts('taker', $event)"
        v-if="this.tradeMode !== 'discard'"
        :tradeMode="tradeMode"
        :rightSide="true"
      />
    </div>

    <div v-if="tradingAllowed">
      <div v-if="state.game && state.player && (state.game.turn === state.player.id || requiredDiscardCount)">
        <button v-if="state.game.trade.offer" @click="cancelTradeOffer()">Cancel Trade Offer</button>
        <button v-else-if="tradeMode === 'humans'" @click="makeTrade('offer_trade')">Propose Trade</button>
        <button v-else-if="tradeMode === 'stockpile'" @click="makeTrade('harbour_trade')">Trade With Harbour</button>
        <button
          v-else-if="tradeMode === 'discard'"
          :disabled="requiredDiscardCount !== totalSelectedOfferer"
          @click="makeTrade('discard_cards')"
        >
          Discard {{ requiredDiscardCount }} cards ({{ totalSelectedOfferer }} selected)
        </button>
      </div>
      <div v-else>
        <button v-if="state.game.trade.offer" @click="acceptTrade()">Accept Trade</button>
        <p v-else>No trade offer right now...</p>
      </div>
    </div>
    <p v-else>{{ state.game.turnCycle > 2 ? "Roll dice before trading..." : "Trading is not allowed right now..." }}</p>

    <p v-if="tradingAllowed && state.game.trade.offer">You can click the trade buttons in the playerlist to finalise a trade.</p>
  </div>
</template>

<script>
import TradePanelInputs from "./TradePanelInputs.vue"

export default {
  components: {
    TradePanelInputs,
  },
  data() {
    return {
      state: this.$store.state,
      tradeMode: "humans",
      amounts: {
        offerer: {},
        taker: {},
      },
    }
  },
  methods: {
    getTradeIcon() {
      if(this.tradeMode === "discard") {
        return require(`@/images/icons/discard.svg`)
      }
      return require(`@/images/icons/trade.svg`)
    },
    updateAmounts(column, newData) {
      this.amounts[column] = newData
    },
    cancelTradeOffer() {
      socket.emit("perform_game_action", { action: "cancel_trade" }, () => {})
    },
    makeTrade(action) {
      socket.emit("perform_game_action", {
        action,
        offer: this.amounts,
      }, () => {})
    },
    acceptTrade() {
      socket.emit("perform_game_action", {
        action: "accept_trade",
        idempotency: state.game.trade.idempotency,
      }, () => {})
    },
  },
  computed: {
    requiredDiscardCount() {
      return this.state.game.discardingPlayers[this.state.player.id]
    },
    tradingAllowed() {
      return (
        this.state.game && this.state.player &&
        this.state.game.currentAction !== "roll_dice" &&
        this.state.game.turnCycle > 2 &&
        (
          this.state.game.turn === this.state.player.id ||
          this.state.game.trade.offer ||
          this.requiredDiscardCount
        )
      )
    },
    totalSelectedOfferer() {
      return Object.values(this.amounts.offerer).reduce((acc, cur) => acc + cur)
    },
  },
  mounted() {
    setInterval(() => {
      if(this.requiredDiscardCount) {
        this.tradeMode = "discard"
      } else {
        if(this.tradeMode === "discard") {
          this.tradeMode = "humans"
        }
      }
    }, 1000)
  },
}
</script>