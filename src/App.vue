<template>
  <div>
    <Title />
    <Login />
    {{ JSON.stringify(lobbyState) }}
    <JoinLobby v-if="loginState.loggedIn && !lobbyState.code" />
    <Lobby v-if="lobbyState.code" />
  </div>
</template>

<script>
import Title from "./components/Title.vue"
import Login from "./components/Login.vue"
import JoinLobby from "./components/JoinLobby.vue"
import Lobby from "./components/Lobby.vue"

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
      lobbyState: {},
    }
  },
}
</script>