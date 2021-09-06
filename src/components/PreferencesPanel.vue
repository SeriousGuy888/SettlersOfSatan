<template>
  <span @click="toggle()" class="prefs-button">⚙️</span>
  <Sidebar ref="sidebar">
    <h2>Preferences</h2>
    <p>Volume: {{ state.prefs.volume }}%</p>
    <input type="range" min="0" max="100" v-model="state.prefs.volume">
  </Sidebar>
</template>

<script>
import Sidebar from "./ui/Sidebar.vue"

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      state: this.$store.state,
      saveButtonText: "Save",
    }
  },
  methods: {
    toggle() {
      this.$refs.sidebar.open = !this.$refs.sidebar.open
    },
    save() {
      localStorage.setItem("prefs", JSON.stringify(this.state.prefs))
    },
  },
  mounted() {
    this.state.prefs = JSON.parse(localStorage.getItem("prefs")) || {}
    setInterval(() => {
      if(this.$refs.sidebar.open) {
        this.save()
      }
    }, 3000)
  },
  watch: {
    "state.prefs": function() {
      this.state.prefs.volume = Number(this.state.prefs.volume) || 50
    },
  }
}
</script>

<style scoped>
.prefs-button {
  cursor: pointer;
  user-select: none;
}
</style>