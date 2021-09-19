<template>
  <div id="lobby-player-list-container">
    <div class="player-list-title">
      <h3>Players ({{ state.lobby.playerCount }}/{{ state.lobby.maxPlayerCount }})</h3>
      <p v-if="state.lobby.spectatorCount">
        <img src="/images/icons/spectate.svg" alt="" class="icon-1em">
        {{ state.lobby.spectatorCount }} {{ state.lobby.spectatorCount === 1 ? "person is" : "people are" }} spectating this lobby.
      </p>
    </div>

    <div id="lobby-player-list">

      <div v-for="member in state.lobby.members" :key="member" class="list-entry" :style="`border: 5px solid ${member.colour}`">
        <div class="list-entry-title">
          <HostIcon v-if="member.host" />
          <h4>{{ member.name }}</h4>
          <span @click="toggleModal(true, member)" class="player-list-modal-button">⋮</span>
        </div>
        <div v-if="state.game" class="list-entry-line">
          <button v-if="shouldShowButton(member.playerId, 'trade')" @click="confirmTrade(member.playerId)">Trade</button>
          <button v-if="shouldShowButton(member.playerId, 'rob')" @click="rob(member.playerId)">Rob</button>
        </div>
        <div v-if="state.game" class="list-entry-line">
          <div title="Victory Points">
            <p>{{ memberToPlayer(member).points }}</p>
            <img class="icon-1em" src="/images/icons/victory_point.svg" alt="VP">
          </div>
          <div title="The number of resource cards this player has">
            <p>{{ memberToPlayer(member).resourceCardCount }}</p>
            <img class="icon-1em" src="/images/icons/resource_cards.svg" alt="Resource Cards">
          </div>
          <div title="The length of this player's longest road.">
            <p>{{ memberToPlayer(member).longestRoadLength }}</p>
            <img v-if="state.game.specialCards.longestRoad === member.playerId" class="icon-1em" src="/images/icons/longest_road.svg" alt="Longest Road">
            <img v-else class="icon-1em" src="/images/icons/road_length.svg" alt="Road Length">
          </div>
          <div title="Number of knight cards this player has played">
            <p>{{ memberToPlayer(member).knightsPlayed }}</p>
            <img v-if="state.game.specialCards.largestArmy === member.playerId" class="icon-1em" src="/images/icons/largest_army.svg" alt="Largest Army">
            <img v-else class="icon-1em" src="/images/icons/knights_played.svg" alt="Knights Played">
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
            v-if="state.isHost && !playerListModal.data.host"
            class="red-button">
            Kick
          </button>
          <button
            @click="kickPlayer(playerListModal.data.playerId, true)"
            v-if="state.playerId !== playerListModal.data.playerId && state.lobby.members.map(m => m.playerId).includes(state.playerId)">
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
    memberToPlayer(user) {
      return this.state.game.players[user.playerId]
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

.player-list-title {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.5rem;
}
.player-list-title > * {
  margin: 0;
}
.player-list-title > p {
  font-size: 0.8rem;
  font-style: italic;
}
</style>