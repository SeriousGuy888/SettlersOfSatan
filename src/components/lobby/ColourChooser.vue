<template>
  <div>
    <h3>Choose a Colour</h3>
    <div class="button-grid">
      <button
        v-for="colour in colourChoices"
        :key="colour"
        @click="chooseColour(colour)"
        :style="`background-color: ${colour}`"
      >
        <p :class="{ 'colour-selected': colourIsSelected(colour) }">
          {{ colour.toUpperCase() }}
        </p>
      </button>
    </div>
    <p>
      do you know how hard it is to find nine colours that are different enough from each other and that look good on a catan board?
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      state: this.$store.state,
      colourChoices: [],
    }
  },
  methods: {
    chooseColour(colour) {  
      socket.emit("select_colour", { colour }, () => {})
    },
    colourIsSelected(colour) {
      return !!this.state.lobby.users.filter(e => e.colour === colour).length
    },
  },
  mounted() {
    socket.emit("get_colour_choices", {}, (err, data) => {
      this.colourChoices = data.colourChoices
    })
  },
}
</script>

<style scoped>
  .button-grid {
    display: grid;
    grid-template: 5rem 5rem 5rem / 5rem 5rem 5rem;
    gap: 0.5rem;
  }
  .button-grid button {
    border: none;
  }
  .button-grid button p {
    background: inherit;
    background-clip: text;
    color: transparent;
    filter: invert(1) grayscale(1) contrast(9);
    font-size: 0.9rem;
    font-weight: bold;
  }

  .colour-selected::after {
    font-size: 1.2rem;
    content: "✔";
    display: block;
  }
</style>