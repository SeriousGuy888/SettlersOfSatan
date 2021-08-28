<template>
  <div>
    <LobbyCenterColumnControls :game="game" :player="player" />
    <LobbyCenterColumnCanvas :game="game" :player="player" />
  </div>
</template>

<script>
import LobbyCenterColumnCanvas from "./LobbyCenterColumnCanvas.vue"
import LobbyCenterColumnControls from "./LobbyCenterColumnControls.vue"

export default {
  props: {
    game: Object,
    player: Object,
  },
  components: {
    LobbyCenterColumnCanvas,
    LobbyCenterColumnControls,
  },
}
</script>