<template>
  <div>
    <CenterColumnControls v-if="state.player" :holding="holding" @setHolding="holding = $event" />
    <CenterColumnCanvas :holding="holding" @setHolding="holding = $event" />
  </div>
</template>

<script>
import CenterColumnCanvas from "./CenterColumnCanvas.vue"
import CenterColumnControls from "./CenterColumnControls.vue"

export default {
  components: {
    CenterColumnCanvas,
    CenterColumnControls,
  },
  data() {
    return {
      state: this.$store.state,
      holding: "",
    }
  },
}
</script>