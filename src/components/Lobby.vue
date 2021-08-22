<template>
  <div class="single-line-layout">
    <h2>{{ this.$parent.lobby.name }}</h2>
    <button @click="leaveLobby()"><img class="icon-1em" alt="←" src="@/images/icons/leave.svg"> Leave Lobby</button>
  </div>
  <div class="flex-layout-grid">
    <LobbyLeftColumn :game="this.$parent.game" :player="this.$parent.player" />

    <div id="center-column" class="flex-layout-grid-grow-2">
      <div v-if="!this.$parent.game">
        <p>
          Lobby Code: <code>{{ this.$parent.lobby.code }}</code>
          <br>
        </p>
        
        <h3>Lobby Settings</h3>
        <div class="lobby-settings-panel">
          <button @click="editLobbySetting({ started: true })" :disabled="!this.$parent.userIsHost">Start Game</button>
        </div>

        <ColourChooser :printToChat="printToChat" />
      </div>
      <LobbyCenterColumn :game="this.$parent.game" :player="this.$parent.player" v-else />
    </div>

    <div id="right-column">
      <LobbyTurnControls v-if="this.$parent.game" :game="this.$parent.game" :player="this.$parent.player" />

      <Chat ref="chat" />
      <PlayerList :lobby="this.$parent.lobby" :lobbyState="this.$parent.lobbyState" :game="this.$parent.game" :userIsHost="this.$parent.userIsHost" />
    </div>
  </div>
</template>

<script>
import Chat from "./Chat.vue"
import ColourChooser from "./ColourChooser.vue"
import LobbyCenterColumn from "./LobbyCenterColumn.vue"
import LobbyLeftColumn from "./LobbyLeftColumn.vue"
import LobbyTurnControls from "./LobbyTurnControls.vue"
import PlayerList from "./PlayerList.vue"

export default {
  props: ["printToChat"],
  components: {
    Chat,
    ColourChooser,
    LobbyCenterColumn,
    LobbyLeftColumn,
    LobbyTurnControls,
    PlayerList,
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