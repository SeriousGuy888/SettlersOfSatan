<template>
  <div class="single-line-layout">
    <h2>{{ this.$parent.lobby.name }}</h2>
    <button @click="leaveLobby()"><img class="icon-1em" alt="←" src="@/images/icons/leave.svg"> Leave Lobby</button>
  </div>
  <div class="flex-layout-grid">
    <div v-if="game" id="left-column">
    </div>
    <div id="lobby-waiting" class="flex-layout-grid-grow-2">
      <p>
        Lobby Code: <code>{{ this.$parent.lobby.code }}</code>
        <br>
      </p>
      
      <h3>Lobby Settings</h3>
      <div class="lobby-settings-panel">
        <button @click="editLobbySetting(this, { started: true })" :disabled="!userIsHost">Start Game</button>
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
            <img src="@/images/icons/check.svg" alt="Send" class="icon-1em">
          </button>
        </div>
      </div>
      <PlayerList :lobby="this.$parent.lobby" :lobbyState="this.$parent.lobbyState" :userIsHost="this.$parent.userIsHost" />
    </div>
  </div>
</template>

<script>
import PlayerList from "./PlayerList.vue"

export default {
  components: {
    PlayerList
  },
  methods: {
    leaveLobby() {
      if(confirm("Are you sure you want to leave the lobby?")) {
        socket.emit("leave_lobby", {}, (err, data) => {
          if(err) notifyUser(err)
          else {
            this.$parent.lobbyState = data
            this.$parent.lobby = null
            this.$parent.game = null
          }
        })
      }
    }
  }
}
</script>