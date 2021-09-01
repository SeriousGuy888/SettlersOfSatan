<template>
  <div>
    <Title />
    <Login />
    <JoinLobby v-if="loginState.loggedIn && !lobbyState.code" />
    <Lobby v-if="loginState.loggedIn && lobbyState.code" ref="lobby" :printToChat="printToChat" />
  </div>
</template>

<script>
import Title from "./components/Title.vue"
import Login from "./components/Login.vue"
import JoinLobby from "./components/JoinLobby.vue"
import Lobby from "./components/lobby/Lobby.vue"

export default {
  name: "App",
  components: {
    Title,
    Login,
    JoinLobby,
    Lobby,
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
    }
  },
  methods: {
    printToChat(lines) {
      this.$refs?.lobby?.$refs?.chat?.print(lines)
    },
  },
  mounted() {
    const state = this.$store.state

    socket.on("kicked_from_lobby", data => {
      state.lobby = null
      this.lobbyState = {}
      if(data.notification) {
        alert(data.notification)
      }
    })

    socket.on("lobby_update", data => state.lobby = data)
    socket.on("host_change", data => {
      if(data.lostHost) this.userIsHost = false
      if(data.gainedHost) this.userIsHost = true
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
  },
}
</script>