<template></template>

<script>
import { useStore } from "vuex"
import { useSound } from "@vueuse/sound"

export default {
  setup() {
    const store = useStore()
    if(!store.state.prefs.volume) store.state.prefs.volume = 50

    const volume = Number(store.state.prefs.volume) / 100
    const soundOpts = { volume }

    const dir = "../sounds/"

    return {
      sounds: {
        buy_development_card: useSound(require(`${dir}buy_development_card.wav`), soundOpts),
        fifteen_seconds_left: useSound(require(`${dir}fifteen_seconds_left.wav`), soundOpts),
        lost: useSound(require(`${dir}lost.wav`), soundOpts),
        place: useSound(require(`${dir}place.wav`), soundOpts),
        win_hot: useSound(require(`${dir}win_hot.wav`), soundOpts),
        win_wava: useSound(require(`${dir}win_wava.wav`), soundOpts),
        your_turn: useSound(require(`${dir}your_turn.mp3`), soundOpts),
      },
    }
  },
  mounted() {
    socket.on("play_sound", data => {
      const soundName = data.sound
      if(this.sounds[soundName].play) {
        this.sounds[soundName].play()
        console.log(`Played sound ${soundName}`)
      } else {
        console.log(`Sound ${soundName} does not exist.`)
      }
    })
  },
}
</script>