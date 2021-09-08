<template></template>

<script>
import { useStore } from "vuex"
import { useSound } from "@vueuse/sound"

import fifteenSecondsLeft from "../sounds/fifteen_seconds_left.wav"
import winHot from "../sounds/win_hot.wav"
import winWava from "../sounds/win_wava.wav"
import yourTurn from "../sounds/your_turn.mp3"

export default {
  setup() {
    const store = useStore()
    store.state.prefs = JSON.parse(localStorage.getItem("prefs")) || {}
    if(!store.state.prefs.volume) store.state.prefs.volume = 50

    const volume = store.state.prefs.volume / 100
    
    return {
      fifteen_seconds_left: useSound(fifteenSecondsLeft, { volume }),
      win_hot: useSound(winHot, { volume }),
      win_wava: useSound(winWava, { volume }),
      your_turn: useSound(yourTurn, { volume }),
    }
  },
  mounted() {
    socket.on("play_sound", data => {
      const soundName = data.sound
      if(this[soundName].play) {
        this[soundName].play()
        console.log(`Played sound ${soundName}`)
      } else {
        console.log(`Sound ${soundName} does not exist.`)
      }
    })
  },
}
</script>