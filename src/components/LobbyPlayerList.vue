<template>
  <div id="lobby-player-list-container">
    <h3>Players {{ state.lobby.playerCount }}/{{ state.lobby.maxPlayerCount }}</h3>
    <div id="lobby-player-list">

      <div v-for="loopUser in state.lobby.users" :key="loopUser" class="list-entry" :style="`border: 3px solid ${loopUser.colour}`">
        <div class="list-entry-title">
          <img v-if="loopUser.host" src="@/images/icons/host.svg" title="Lobby Host" alt="Lobby Host" class="icon-1em">
          
          <h4>{{ loopUser.name }}</h4>
          <span @click="toggleModal(true, loopUser)" class="player-list-modal-button">⋮</span>
        </div>
        <div v-if="state.game" class="list-entry-line">
          <div title="Victory Points">
            <p>{{ state.game.players[loopUser.playerId].points }}</p>
            <img class="icon-1em" src="@/images/icons/victory_point.svg" alt="VP">
          </div>
          <div title="The number of resource cards this player has">
            <p>{{ state.game.players[loopUser.playerId].resourceCardCount }}</p>
            <img class="icon-1em" src="@/images/icons/resource_cards.svg" alt="Resource Cards">
          </div>
        </div>
      </div>


      <div v-if="playerListModal.show" class="modal">
        <div class="modal-content">
          <span @click="toggleModal(false)" class="modal-close">&times;</span>
          <h3 class="modal-title">{{ playerListModal.data.name }}</h3>
          <div class="modal-buttons">
            <button
              @click="kickPlayer(playerListModal.data.playerId, false)"
              v-if="userIsHost && !playerListModal.data.host"
              class="red-button">
              Kick
            </button>
            <button
              @click="kickPlayer(playerListModal.data.playerId, true)"
              v-if="lobbyState.playerId !== playerListModal.data.playerId">
              Votekick
            </button>
            <button @click="copyPlayerId($event, playerListModal.data.playerId)">Copy Player ID</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    lobbyState: Object,
    userIsHost: Boolean,
  },
  data() {
    return {
      state: this.$store.state,
      playerListModal: {
        show: false,
        data: null
      },
    }
  },
  methods: {
    toggleModal(active, data) {
      this.playerListModal.show = active
      this.playerListModal.data = data
    },
    copyPlayerId(e, id) {
      navigator.clipboard.writeText(id).then(() => {
        e.target.textContent = "Copied!"
        setTimeout(() => {
          e.target.textContent = "Copy Player ID"
        }, 3000)
      })
    },
    kickPlayer(playerId, votekick) {
      if(confirm(`${votekick ? "Votekick" : "Kick"} this player?`)) {
        socket.emit(votekick ? "votekick_player" : "kick_player", {
          playerId
        }, (err, data) => {
          if(err) notifyUser(err)
        })
      }
    },
  },
}
</script>