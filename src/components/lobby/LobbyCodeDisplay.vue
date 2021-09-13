<template>
  <button @click="this.$refs.sidebar.toggle()">Lobby Info</button>
  <Sidebar ref="sidebar">
    <h2>Lobby Info</h2>
    <p>Lobby Code: <code>{{ state.lobby.code }}</code></p>
    <p>
      <a :href="getLink(false)" target="_blank">Lobby Join Link</a><br>
      <a :href="getLink(true)" target="_blank">Spectate Link</a>
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
  methods: {
    getLink(spectatorLink) {
      const { protocol, host, pathname } = window.location
      const joinData = {
        lobby: this.state.lobby.code,
        spectate: spectatorLink,
      }

      return `${protocol}//${host}${pathname}#${JSON.stringify(joinData)}`
    }
  }
}
</script>