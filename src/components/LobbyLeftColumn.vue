<template>
  <div id="left-column">
    <LobbyLeftColumnTurnDisplay />
    <ResourceCardDisplay />
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
import Collapsible from "./Collapsible.vue"
import DevelopmentCard from "./DevelopmentCard.vue"
import LobbyLeftColumnTurnDisplay from "./LobbyLeftColumnTurnDisplay.vue"
import ResourceCardDisplay from "./ResourceCardDisplay.vue"
import TradePanel from "./TradePanel.vue"

export default {
  components: {
    Collapsible,
    DevelopmentCard,
    LobbyLeftColumnTurnDisplay,
    ResourceCardDisplay,
    TradePanel,
  },
  data() {
    return {
      state: this.$store.state,
    }
  },
}
</script>