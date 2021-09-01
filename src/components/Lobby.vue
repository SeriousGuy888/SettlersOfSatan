<template>
  <div class="single-line-layout">
    <h2>{{ state.lobby.name }}</h2>
    <button @click="leaveLobby()"><img class="icon-1em" alt="←" src="@/images/icons/leave.svg"> Leave Lobby</button>
  </div>
  <div class="flex-layout-grid">
    <LobbyLeftColumn v-if="state.game"/>

    <div id="center-column" class="flex-layout-grid-grow-2">
      <div v-if="!state.game">
        <p>
          Lobby Code: <code>{{ state.lobby.code }}</code>
          <br>
        </p>
        
        <h3>Lobby Settings</h3>
        <div class="lobby-settings-panel">
          <button @click="editLobbySetting({ started: true })" :disabled="!this.$parent.userIsHost">Start Game</button>
        </div>

        <ColourChooser :printToChat="printToChat" />
      </div>
      <LobbyCenterColumn v-else />
    </div>

    <div id="right-column">
      <LobbyTurnControls v-if="state.game" />
      <LobbyChat ref="chat" />
      <LobbyPlayerList :lobbyState="this.$parent.lobbyState" :userIsHost="this.$parent.userIsHost" />
    </div>
  </div>
</template>

<script>
import LobbyChat from "./LobbyChat.vue"
import ColourChooser from "./ColourChooser.vue"
import LobbyCenterColumn from "./LobbyCenterColumn.vue"
import LobbyLeftColumn from "./LobbyLeftColumn.vue"
import LobbyTurnControls from "./LobbyTurnControls.vue"
import LobbyPlayerList from "./LobbyPlayerList.vue"

export default {
  props: ["printToChat"],
  components: {
    ColourChooser,
    LobbyCenterColumn,
    LobbyChat,
    LobbyLeftColumn,
    LobbyTurnControls,
    LobbyPlayerList,
  },
  data() {
    return {
      state: this.$store.state,
    }
  },
  methods: {
    leaveLobby() {
      if(confirm("Are you sure you want to leave the lobby?")) {
        socket.emit("leave_lobby", {}, (err, data) => {
          if(err) notifyUser(err)
          else {
            this.$parent.lobbyState = data
            this.state.lobby = null
            this.state.game = null
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