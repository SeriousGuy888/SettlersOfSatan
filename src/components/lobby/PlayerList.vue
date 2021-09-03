<template>
  <div id="lobby-player-list-container">
    <h3>Players ({{ state.lobby.playerCount }}/{{ state.lobby.maxPlayerCount }})</h3>
    <div id="lobby-player-list">

      <div v-for="loopUser in state.lobby.users" :key="loopUser" class="list-entry" :style="`border: 5px solid ${loopUser.colour}`">
        <div class="list-entry-title">
          <HostIcon v-if="loopUser.host" />
          <h4>{{ loopUser.name }}</h4>
          <span @click="toggleModal(true, loopUser)" class="player-list-modal-button">⋮</span>
        </div>
        <div v-if="state.game" class="list-entry-line">
          <button v-if="shouldShowButton(loopUser.playerId, 'trade')" @click="confirmTrade(loopUser.playerId)">Trade</button>
          <button v-if="shouldShowButton(loopUser.playerId, 'rob')" @click="rob(loopUser.playerId)">Rob</button>
        </div>
        <div v-if="state.game" class="list-entry-line">
          <div title="Victory Points">
            <p>{{ state.game.players[loopUser.playerId].points }}</p>
            <img class="icon-1em" src="/images/icons/victory_point.svg" alt="VP">
          </div>
          <div title="The number of resource cards this player has">
            <p>{{ state.game.players[loopUser.playerId].resourceCardCount }}</p>
            <img class="icon-1em" src="/images/icons/resource_cards.svg" alt="Resource Cards">
          </div>
        </div>
      </div>


      <Modal ref="modal" :title="playerListModal?.data?.name || 'playername here'">
        <div v-if="playerListModal.data.host">
          <HostIcon />
          Lobby Host
        </div>
        
        <template v-slot:buttons>
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
        </template>
      </Modal>
    </div>
  </div>
</template>

<script>
import Modal from "../ui/Modal.vue"
import HostIcon from "./HostIcon.vue"

export default {
  props: {
    lobbyState: Object,
    userIsHost: Boolean,
  },
  components: {
    Modal,
    HostIcon,
  },
  data() {
    return {
      state: this.$store.state,
      playerListModal: {
        data: null,
      },
    }
  },
  methods: {
    toggleModal(active, data) {
      this.$refs.modal.visible = active
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
        }, () => {})
      }
    },
    shouldShowButton(playerId, button) {
      if(!this.state.player || !this.state.game) return false
      if(this.state.game.turn !== this.state.player.id) return false

      if(button === "trade") {
        return (this.state.game.trade.offer && this.state.game.trade.takers.includes(playerId))
      } else if(button === "rob") {
        return (this.state.game.players[playerId].canBeRobbed)
      }
    },
    confirmTrade(playerId) {
      socket.emit("perform_game_action", {
        action: "confirm_trade",
        tradeWith: playerId,
      }, console.log)
    },
    rob(playerId) {
      socket.emit("perform_game_action", {
        action: "rob_player",
        robFrom: playerId,
      }, console.log)
    },
  },
}
</script>

<style scoped>
.player-list-modal-button {
  width: 1em;
  margin-left: auto;
  user-select: none;
  text-align: center;
}
.player-list-modal-button:hover {
  cursor: pointer;
}
</style>