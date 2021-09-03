<template>
  <Title />
  <Login />
  <JoinLobby v-if="loginState.loggedIn && !lobbyState.code" />
  <Lobby v-if="loginState.loggedIn && lobbyState.code" ref="lobby" :printToChat="printToChat" />
  <Modal ref="modal" title="Alert">
    {{ modalMessage }}
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
      lobby: {},
      game: null,
      player: null,
      modalMessage: "",
    }
  },
  methods: {
    printToChat(lines) {
      this.$refs?.lobby?.$refs?.chat?.print(lines)
    },
    showModal(msg) {
      this.modalMessage = msg
      this.$refs.modal.visible = true
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
        state.player = data
      }
    })
    socket.on("receive_chat", data => this.printToChat(data.lines))

    socket.on("disconnect", () => {
      this.showModal("You were disconnected from game server! Reload to reconnect.")
    })
  },
}
</script>