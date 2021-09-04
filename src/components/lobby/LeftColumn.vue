<template>
  <div id="left-column">
    <TurnDisplay />
    <ResourceCardsDisplay />
    <Collapsible :title="`Trade ${state.game.trade.offer ? '(Active Offer)' : ''}`" :startOpen="true">
      <TradePanel />
    </Collapsible>

    <br>
    
    <Collapsible v-if="state.player" :title="`Development Cards (${state.player.inventory.developmentCards.length})`">
      <div id="development-card-list">
        <DevelopmentCard
          v-for="card in state.player.inventory.developmentCards"
          :key="card"
          :card="card"
        />
      </div>
    </Collapsible>
  </div>
</template>

<script>
import Collapsible from "../ui/Collapsible.vue"
import DevelopmentCard from "./DevelopmentCard.vue"
import TurnDisplay from "./TurnDisplay.vue"
import ResourceCardsDisplay from "./ResourceCardsDisplay.vue"
import TradePanel from "./TradePanel.vue"

export default {
  components: {
    Collapsible,
    DevelopmentCard,
    TurnDisplay,
    ResourceCardsDisplay,
    TradePanel,
  },
  data() {
    return {
      state: this.$store.state,
    }
  },
}
</script>