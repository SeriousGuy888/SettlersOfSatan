<template>
  <p>
    Lobby Code: <code>{{ state.lobby.code }}</code><br>
    Join Link: <a :href="link" target="_blank">{{ link }}</a>
  </p>
</template>

<script>
export default {
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