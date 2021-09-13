<template>
  <button @click="this.$refs.sidebar.toggle()">Lobby Info</button>
  <Sidebar ref="sidebar">
    <h2>Lobby Info</h2>
    <p>Lobby Code: <code>{{ state.lobby.code }}</code><br></p>
    <p>
      Join Link: <a :href="link" target="_blank">{{ link }}</a>
    </p>
  </Sidebar>
</template>

<script>
import Sidebar from "../ui/Sidebar.vue"

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      state: this.$store.state,
    }
  },
  computed: {
    link() {
      const { protocol, host, pathname } = window.location
      return `${protocol}//${host}${pathname}#lobby=${this.state.lobby.code}`
    }
  }
}
</script>