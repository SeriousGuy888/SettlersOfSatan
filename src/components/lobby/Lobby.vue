<template>
  <div class="single-line-layout">
    <h2>{{ state.lobby.name }}</h2>
    <button @click="leaveLobby()"><img class="icon-1em" alt="←" src="/images/icons/leave.svg"> Leave Lobby</button>
  </div>
  <div class="flex-layout-grid">
    <LeftColumn v-if="state.game"/>

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
      <CenterColumn v-else />
    </div>

    <div id="right-column">
      <TurnControls v-if="state.game" />
      <Chat ref="chat" />
      <PlayerList :lobbyState="this.$parent.lobbyState" :userIsHost="this.$parent.userIsHost" />
    </div>
  </div>
</template>

<script>
import Chat from "./Chat.vue"
import ColourChooser from "./ColourChooser.vue"
import CenterColumn from "./CenterColumn.vue"
import LeftColumn from "./LeftColumn.vue"
import TurnControls from "./TurnControls.vue"
import PlayerList from "./PlayerList.vue"

export default {
  props: ["printToChat"],
  components: {
    ColourChooser,
    CenterColumn,
    Chat,
    LeftColumn,
    TurnControls,
    PlayerList,
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
          if(err) alert(err)
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
        if(err) alert(err)
      })
    }
  },
}
</script>