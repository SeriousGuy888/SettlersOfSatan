<template>
  <h2 style="margin-bottom: 0.1em;">{{ state.lobby.name }}</h2>
  <div class="lobby-buttons">
    <LobbyInfoDisplay />
    <button @click="leaveLobby()"><img class="icon-1em" alt="←" src="/images/icons/leave.svg"> Leave Lobby</button>
  </div>

  <div class="flex-layout-grid">
    <LeftColumn v-if="state.game"/>

    <div id="center-column" class="flex-layout-grid-grow-2">
      <div v-if="!state.game">
        <ColourChooser />
      </div>
      <CenterColumn v-else />
    </div>

    <div id="right-column">
      <TurnControls />
      <Chat ref="chat" />
      <PlayerList />
    </div>
  </div>
</template>

<script>
import Chat from "./Chat.vue"
import ColourChooser from "./ColourChooser.vue"
import CenterColumn from "./CenterColumn.vue"
import LeftColumn from "./LeftColumn.vue"
import LobbyInfoDisplay from "./LobbyInfoDisplay.vue"
import TurnControls from "./TurnControls.vue"
import PlayerList from "./PlayerList.vue"

export default {
  props: ["printToChat"],
  components: {
    ColourChooser,
    CenterColumn,
    Chat,
    LeftColumn,
    LobbyInfoDisplay,
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
            this.state.playerId = null
            this.state.lobby = null
            this.state.game = null
          }
        })
      }
    },
  },
}
</script>

<style scoped>
.lobby-buttons {
  display: flex;
  gap: 0.2em;
  margin-top: 0.1em;
  margin-bottom: 0.2em;
}
</style>