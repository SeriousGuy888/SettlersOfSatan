<template>
  <div id="trade-panel">
    <div v-if="tradingAllowed" id="trade-interface">
      <p id="trade-offerer-name">{{ state.game.players[state.game.turn].name }}</p>
      <br>
      <select v-model="tradeMode" :disabled="['discard', 'year_of_plenty', 'monopoly'].includes(tradeMode)">
        <option value="humans">Humans</option>
        <option value="stockpile">Bank</option>
        <option value="discard" class="hidden-option">Discard</option>
        <option value="year_of_plenty" class="hidden-option">Year of Plenty</option>
        <option value="monopoly" class="hidden-option">Monopoly</option>
      </select>

      <TradePanelInputs
        @updateAmounts="updateAmounts('offerer', $event)"
        v-if="!['year_of_plenty', 'monopoly'].includes(tradeMode)"
        :tradeMode="tradeMode"
        tradeParty="offerer"
      /><div v-else>
        <p v-if="this.tradeMode === 'year_of_plenty'">Take two cards of your choice from the bank.</p>
        <p v-if="this.tradeMode === 'monopoly'">Choose a resource. Every other player must give you any of that resource they have.</p>
      </div>
      <div class="trade-icon">
        <img :src="getTradeIcon()" alt="trade">
      </div>
      <TradePanelInputs
        @updateAmounts="updateAmounts('taker', $event)"
        v-if="this.tradeMode !== 'discard'"
        :tradeMode="tradeMode"
        :rightSide="true"
        tradeParty="taker"
      /><div v-else>
        <p v-if="this.tradeMode === 'discard'">A seven was rolled while you had more than seven resource cards. Please discard half your resource cards.</p>
      </div>
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
        <button
          v-else-if="tradeMode === 'year_of_plenty'"
          :disabled="this.state.game?.yearOfPlenty !== totalSelectedTaker"
          @click="makeTrade('year_of_plenty')"
        >
          Take {{ this.state.game?.yearOfPlenty }} cards ({{ totalSelectedTaker }} selected)
        </button>
        <button
          v-else-if="tradeMode === 'monopoly'"
          :disabled="totalSelectedTaker !== 1"
          @click="makeTrade('monopoly')"
        >
          Monopolise
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
      switch(this.tradeMode) {
        case "discard":
          return `/images/icons/discard.svg`
        case "year_of_plenty":
          return `/images/development_cards/year_of_plenty.png`
        default:
          return `/images/icons/trade.svg`
      }
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
        idempotency: this.state.game.trade.idempotency,
      }, () => {})
    },
  },
  computed: {
    requiredDiscardCount() {
      if(!this.state.game) return 0
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
    totalSelectedTaker() {
      return Object.values(this.amounts.taker).reduce((acc, cur) => acc + cur)
    },
  },
  mounted() {
    setInterval(() => {
      // yucky code D:
      if(this.requiredDiscardCount) {
        this.tradeMode = "discard"
      } else if (this.state.game?.yearOfPlenty) {
        this.tradeMode = "year_of_plenty"
      } else if (this.state.game?.monopoly) {
        this.tradeMode = "monopoly"
      } else {
        if(["discard", "year_of_plenty"].includes(this.tradeMode)) {
          this.tradeMode = "humans"
        }
      }
    }, 1000)
  },
}
</script>

<style scoped>
#trade-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.25em;
  border-radius: 0 0 5px 5px;

  height: max-content;
  padding: 0.25em;
}
#trade-panel > * {
  margin: 0;
}
#trade-interface {
  display: grid;
  grid: 1fr / 2fr 0.75fr 2fr;
  text-align: center;
}
#trade-interface > div.trade-icon {
  max-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}
#trade-interface > div.trade-icon > img {
  width: 100%;
}

.hidden-option { display: none; }
</style>