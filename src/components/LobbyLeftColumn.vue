<template>
  <div v-if="game" id="left-column">
    <LobbyLeftColumnTurnDisplay :game="game" :player="player" />

    <div id="game-controls" class="button-group">
      <button class="game-control-button" id="settlement-button">
        <img src="@/images/game_controls/settlement.svg" alt="Settlement">
      </button>
      <button class="game-control-button" id="city-button">
        <img src="@/images/game_controls/city.svg" alt="Settlement">
      </button>
      <button class="game-control-button" id="road-button">
        <img src="@/images/game_controls/road.svg" alt="Settlement">
      </button>
      <button class="game-control-button" id="development-card-button">
        <img src="@/images/game_controls/development_card.svg" alt="Development Card">
      </button>
    </div>
    <p id="inv-list">Settlements: 2, Roads: 2, Cities: 0</p>
    
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