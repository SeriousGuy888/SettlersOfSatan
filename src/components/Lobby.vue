// broken
<template>
  <div>
    <div class="single-line-layout">
      <h2>{{ lobby.name }}</h2>
      <button @click="leaveLobby(this)"><img class="icon-1em" alt="←" src="/images/icons/leave.svg"> Leave Lobby</button>
    </div>
    <div class="flex-layout-grid">
      <div v-if="game" id="left-column">
        <div id="game-controls" class="button-group">
          <button class="game-control-button" id="settlement-button">
            <img src="/images/game_controls/settlement.svg" alt="Settlement">
          </button>
          <button class="game-control-button" id="city-button">
            <img src="/images/game_controls/city.svg" alt="Settlement">
          </button>
          <button class="game-control-button" id="road-button">
            <img src="/images/game_controls/road.svg" alt="Settlement">
          </button>
          <button class="game-control-button" id="development-card-button">
            <img src="/images/game_controls/development_card.svg" alt="Development Card">
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
              <img id="trade-img" src="/images/icons/trade.svg" alt="trade">
              <img id="discard-img" src="/images/icons/discard.svg" alt="discard" style="display: none;">
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

      <div id="lobby-waiting" class="flex-layout-grid-grow-2">
        <p>
          Lobby Code: <code>{{ lobby.code }}</code>
          <br>
          <!-- <a href="">{{ `${window.location.protocol}//${window.location.hostname}${window.location.port && ":" + window.location.port}#lobby=${lobby.code}` }}</a> -->
        </p>
        
        <h3>Lobby Settings</h3>
        <div class="lobby-settings-panel">
          <button @click="editLobbySetting(this, { started: true })" :disabled="!userIsHost">Start Game</button>
        </div>
      </div>

      <div id="colour-choose-container">
        <h3 id="choose-colour">Choose a Colour</h3>
        <div id="colour-buttons-container" class="honeycomb">
          <div class="honeycomb-row">
            <div class="hexanone"></div>
            <div class="hexagon"><div class="hexagon-content">a</div></div>
            <div class="hexanone"></div>
          </div>
          <div class="honeycomb-row">
            <div class="hexagon"><div class="hexagon-content">a</div></div>
            <div class="hexagon"><div class="hexagon-content">a</div></div>
            <div class="hexagon"><div class="hexagon-content">a</div></div>
          </div>
          <div class="honeycomb-row">
            <div class="hexagon"><div class="hexagon-content">a</div></div>
            <div class="hexagon"><div class="hexagon-content">a</div></div>
            <div class="hexagon"><div class="hexagon-content">a</div></div>
          </div>
        </div>
        <p>
          if any of these colour names look wrong its not our fault its the
          css standard's fault because we were too lazy to implement our own
          colour naming system lol
        </p>
      </div>
    </div>
    <div id="lobby-playing" class="flex-layout-grid-grow-2" style="display: none;">
      <div id="turn-data-display">
        <div>
          <h4 id="turn-player-header">Turn</h4>
          <span id="turn-player">Mustacho</span>
        </div>
        <div>
          <h4 id="turn-timer-header">Timer</h4>
          <span id="turn-timer">sdgfjlg</span>
        </div>
      </div>
      <p id="game-status-message"></p>
      <canvas id="game-canvas">Oeuf</canvas>
    </div>
    <div id="right-column">
      <div id="turn-controls" style="display: none;">
        <button id="end-turn-dice-button">End Turn</button>
      </div>

      <div id="lobby-chat-container">
        <h3>Chat</h3>
        <div id="lobby-chat-messages"></div>
        <div class="single-line-input">
          <input id="lobby-chat-input" placeholder="Send a message">
          <button id="lobby-chat-send-button">
            <img src="/images/icons/check.svg" alt="Send" class="icon-1em">
          </button>
        </div>
      </div>
      <div id="lobby-player-list-container">
        <h3>Players {{ lobby.playerCount }}/{{ lobby.maxPlayerCount }}</h3>
        <div id="lobby-player-list">
          <div v-for="loopUser in lobby.users" :key="loopUser" class="list-entry">
            <div class="list-entry-title">
              <img v-if="loopUser.host" src="/images/icons/host.svg" title="Lobby Host" alt="Lobby Host" class="icon-1em">
              <h4>{{ loopUser.name }}</h4>
              <p>{{ loopUser.colour }}</p>
              <span @click="toggleModal(this, true, loopUser)" class="player-list-modal-button">⋮</span>
            </div>
            <div v-if="game" class="list-entry-line">
              <div title="Victory Points">
                <p>{{ game.players[loopUser.playerId].points }}</p>
                <img class="icon-1em" src="/images/icons/victory_point.svg" alt="VP">
              </div>
              <div title="The number of resource cards this player has">
                <p>{{ game.players[loopUser.playerId].resourceCardCount }}</p>
                <img class="icon-1em" src="/images/icons/resource_cards.svg" alt="Resource Cards">
            </div>
          </div>
        </div>

        <div v-if="playerListModal.show" class="modal">
          <div class="modal-content">
            <span @click="toggleModal(this, false)" class="modal-close">&times;</span>
            <h3 class="modal-title">{{ playerListModal.data.name }}</h3>
            <div class="modal-buttons" :set="{ playerId } = lobbyState">
              <button
                @click="kickPlayer(this, playerListModal.data.playerId, false)"
                v-if="userIsHost && !playerListModal.data.host"
                class="red-button">
                Kick
              </button>
              <button
                @click="kickPlayer(this, playerListModal.data.playerId, true)"
                v-if="playerId !== playerListModal.data.playerId">
                Votekick
              </button>
              <button @click="navigator.clipboard.writeText(playerListModal.data.playerId)">Copy Player ID</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>