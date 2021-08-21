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
        <button @click="editLobbySetting({ started: true })" :disabled="!this.$parent.userIsHost">Start Game</button>
      </div>

      <ColourChooser />
    </div>
    <div id="right-column">
      <div id="turn-controls" style="display: none;">
        <button id="end-turn-dice-button">End Turn</button>
      </div>

      <Chat ref="chat" />
      <PlayerList :lobby="this.$parent.lobby" :lobbyState="this.$parent.lobbyState" :userIsHost="this.$parent.userIsHost" />
    </div>
  </div>
</template>

<script>
import ColourChooser from "./ColourChooser.vue"
import PlayerList from "./PlayerList.vue"
import Chat from "./Chat.vue"

export default {
  components: {
    ColourChooser,
    PlayerList,
    Chat,
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
    },
    editLobbySetting(changes) {
      socket.emit("edit_lobby_setting", changes, (err, data) => {
        if(err) notifyUser(err)
      })
    }
  },
}
</script>