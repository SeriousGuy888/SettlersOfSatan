<template>
  <div>
    <LobbyCenterColumnCanvas :game="game" :player="player" />
  </div>
</template>

<script>
import LobbyCenterColumnCanvas from "./LobbyCenterColumnCanvas.vue"

export default {
  props: {
    game: Object,
    player: Object,
  },
  components: {
    LobbyCenterColumnCanvas
  },
}
</script>