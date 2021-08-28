<template>
  <div>
    <LobbyCenterColumnControls />
    <LobbyCenterColumnCanvas :game="game" :player="player" />
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
}
</script>