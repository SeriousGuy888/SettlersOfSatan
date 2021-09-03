<template>
  <Title />
  <Login />
  <JoinLobby v-if="loginState.loggedIn && !lobbyState.code" />
  <Lobby v-if="loginState.loggedIn && lobbyState.code" ref="lobby" :printToChat="printToChat" />
  <Modal ref="modal" title="Alert">
    {{ modal.message }}
    <template v-slot:buttons>
      <button @click="reload()">Reload</button>
    </template>
  </Modal>
</template>

<script>
import Title from "./components/Title.vue"
import Login from "./components/Login.vue"
import JoinLobby from "./components/JoinLobby.vue"
import Lobby from "./components/lobby/Lobby.vue"
import Modal from "./components/ui/Modal.vue"

export default {
  name: "App",
  components: {
    Title,
    Login,
    JoinLobby,
    Lobby,
    Modal,
  },
  data() {
    return {
      loginState: {
        loggedIn: false,
        name: "",
      },
      userIsHost: false,
      lobbyState: {},
      modal: {
        message: "",
        reloadButton: false,
      },
    }
  },
  methods: {
    printToChat(lines) {
      this.$refs?.lobby?.$refs?.chat?.print(lines)
    },
    showModal(msg, reloadButton) {
      this.modal.message = msg
      this.modal.reloadButton = !!reloadButton
      this.$refs.modal.visible = true
    },
    reload() {
      window.location.reload()
    },
  },
  mounted() {
    const state = this.$store.state

    socket.on("kicked_from_lobby", data => {
      state.lobby = null
      this.lobbyState = {}
      if(data.notification) {
        this.showModal(data.notification)
      }
    })
    socket.on("lobby_update", data => state.lobby = data)
    socket.on("host_change", data => {
      if(data.lostHost) this.userIsHost = false
      if(data.gainedHost) this.userIsHost = true
    })
    socket.on("game_started_update", data => {
      if(!data.started) {
        delete state.game
      }
    })
    socket.on("game_update", data => {
      if(state.lobby.inGame) {
        state.game = data
      }
    })
    socket.on("player_update", data => {
      if(state.lobby.inGame) {
        state.playerPrev = state.player
        state.player = data
      }
    })
    socket.on("receive_chat", data => this.printToChat(data.lines))

    socket.on("disconnect", () => {
      this.showModal("You were disconnected from game server! Reload to reconnect.", true)
    })
  },
}
</script>