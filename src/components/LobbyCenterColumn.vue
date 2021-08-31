<template>
  <div>
    <LobbyCenterColumnControls :holding="holding" @setHolding="holding = $event" />
    <LobbyCenterColumnCanvas :holding="holding" @setHolding="holding = $event" />
  </div>
</template>

<script>
import LobbyCenterColumnCanvas from "./LobbyCenterColumnCanvas.vue"
import LobbyCenterColumnControls from "./LobbyCenterColumnControls.vue"

export default {
  components: {
    LobbyCenterColumnCanvas,
    LobbyCenterColumnControls,
  },
  data() {
    return {
      holding: "",
    }
  },
}
</script>