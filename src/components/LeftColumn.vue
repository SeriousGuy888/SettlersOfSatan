<template>
  <div v-if="game" id="left-column">
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
    
    <div id="resource-cards"></div>
    
    <button class="collapsible collapsible-active">Trade Menu</button>
    <div id="trade-panel">
      <div id="trade-interface">
        <p id="trade-offerer-name">offerer name</p>
        <br>
        <select id="trade-taker-select">
          <option value="humans">Humans</option>
          <option value="stockpile">Bank</option>
          <option value="discard" style="display: none;">Discard</option>
        </select>

        <div id="trade-offerer-inputs" class="trade-column"></div>
        <div class="trade-icon">
          <img id="trade-img" src="@/images/icons/trade.svg" alt="trade">
          <img id="discard-img" src="@/images/icons/discard.svg" alt="discard" style="display: none;">
        </div>
        <div id="trade-taker-inputs" class="trade-column"></div>
      </div>
      <button id="trade-button">controlled with js</button>
      <p id="trade-takers">You can click the trade buttons in the playerlist to finalise a trade.</p>
    </div>

    <br>
    <button class="collapsible">Development Cards</button>
    <div id="development-card-list" style="display: none;">
      <div class="card">
        <div class="card-header">
          <h2 class="card-header">Quack!</h2>
          <img src="/images/resource_cards/bricks.png" alt="card icon" class="card-icon">
        </div>
        <p>Instant win</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["game", "player"],
  data() {
    return {

    }
  },
}
</script>