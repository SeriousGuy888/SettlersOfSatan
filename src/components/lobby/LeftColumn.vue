<template>
  <div id="left-column">
    <TurnDisplay />
    <ResourceCardsDisplay />
    <Collapsible title="Trade Menu" :startOpen="true">
      <TradePanel />
    </Collapsible>

    <br>
    
    <Collapsible title="Development Cards">
      <div id="development-card-list">
        <DevelopmentCard
          v-for="card in state.player.inventory.developmentCards"
          :key="card"
          :card="card"
          class="card"
        >
        </DevelopmentCard>
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