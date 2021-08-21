<template>
  <div>
    <Title />
    <Login />
  </div>
</template>

<script>
import Title from "./components/Title.vue"
import Login from "./components/Login.vue"

export default {
  name: "App",
  components: {
    Title,
    Login,
  },
  data() {
    return {
      loginState: {
        loggedIn: false,
        name: "",
      },
    }
  },
}
</script>