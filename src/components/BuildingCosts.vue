<template>
  <a href="#" @click="toggle()">Building Costs</a>
  <Sidebar ref="sidebar">
    <h2>Building Costs</h2>
    <img src="https://scotscoop.com/wp-content/uploads/2020/06/IMG_2214-380x475.jpg" alt="building costs">
  </Sidebar>
</template>

<script>
import Sidebar from "./ui/Sidebar.vue"

export default {
  components: {
    Sidebar,
  },
  methods: {
    toggle() {
      this.$refs.sidebar.open = !this.$refs.sidebar.open
    },
  },
}
</script>