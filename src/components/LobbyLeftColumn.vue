<template>
  <div v-if="game" id="left-column">
    <LobbyLeftColumnTurnDisplay :game="game" :player="player" />
    <ResourceCardDisplay :game="game" :player="player" />
    <Collapsible title="Trade Menu" :startOpen="true">
      <TradePanel :game="game" :player="player" />
    </Collapsible>

    <br>
    
    <Collapsible title="Development Cards">
      <div id="development-card-list">
        <DevelopmentCard
          v-for="card in player.inventory.developmentCards"
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
  props: ["game", "player"],
  components: {
    Collapsible,
    DevelopmentCard,
    LobbyLeftColumnTurnDisplay,
    ResourceCardDisplay,
    TradePanel,
  },
  data() {
    return {

    }
  },
}
</script>