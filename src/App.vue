<template>
  <div>
    <Title />
    <Login />
    <JoinLobby v-if="loginState.loggedIn && !lobbyState.code" />
  </div>
</template>

<script>
import Title from "./components/Title.vue"
import Login from "./components/Login.vue"
import JoinLobby from "./components/JoinLobby.vue"

export default {
  name: "App",
  components: {
    Title,
    Login,
    JoinLobby,
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