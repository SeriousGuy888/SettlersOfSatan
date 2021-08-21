<template>
  <div>
    <h3>Choose a Colour</h3>
    <p>i was too lazy to make the hexagon colour selector work with the vue rewrite lol -billzo</p>
    <div class="flex-layout-grid">
      <button
        v-for="colour in colourChoices"
        :key="colour"
        @click="chooseColour(colour)"
        :style="`background-color: ${colour}`"
      >{{ colour.toUpperCase() }}</button>
    </div>
    <!-- <div ref="buttonContainer" class="honeycomb">
      <div class="honeycomb-row">
        <div class="hexanone"></div>
        <div class="hexagon"><div class="hexagon-content"></div></div>
        <div class="hexanone"></div>
      </div>
      <div class="honeycomb-row">
        <div class="hexagon"><div class="hexagon-content"></div></div>
        <div class="hexagon"><div class="hexagon-content"></div></div>
        <div class="hexagon"><div class="hexagon-content"></div></div>
      </div>
      <div class="honeycomb-row">
        <div class="hexagon"><div class="hexagon-content"></div></div>
        <div class="hexagon"><div class="hexagon-content"></div></div>
        <div class="hexagon"><div class="hexagon-content"></div></div>
      </div>
    </div> -->
    <p>
      if any of these colour names look wrong its not our fault its the
      css standard's fault because we were too lazy to implement our own
      colour naming system lol
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      colourChoices: [],
      colourHexagonButtons: null,
    }
  },
  methods: {
    chooseColour(colour) {  
      socket.emit("select_colour", { colour }, (err, data) => {
        if(err) notifyUser(err)
      })
    },
  },
  mounted() {
    socket.emit("get_colour_choices", {}, (err, data) => {
      this.colourChoices = data.colourChoices
    })
    
    
    // this.colourHexagonButtons = this.$refs.buttonContainer.querySelectorAll(".hexagon")
    // for(let i = 0; i < this.colourChoices.length; i++) {
    //   const colour = this.colourChoices[i]
    //   const colourButton = this.colourHexagonButtons[i]
    //   const colourButtonText = colourButton.querySelector(".hexagon-content")

    //   // colourButton.classList.remove("active", "disabled")
    //   colourButton.id = `colour-button-${colour}`
    //   colourButton.style.backgroundColor = colour
    //   colourButtonText.textContent = colour.toUpperCase()
    
    //   colourButton.onclick = () => {
    //     // if(colourButton.classList.contains("active")) {
    //     //   printToChat([{ text: "You have already have that colour selected.", style: { colour: "red", italic: true } }])
    //     //   return
    //     // }
    //     // if(colourButton.classList.contains("disabled")) {
    //     //   printToChat([{ text: "Another player is using this colour.", style: { colour: "red", italic: true } }])
    //     //   return
    //     // }

    //     socket.emit("select_colour", { colour }, (err, data) => {
    //       if(err) notifyUser(err)
    //     })
    //   }
    // }
  },
}
</script>