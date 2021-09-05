<template>
  <div class="card" v-if="card.type">
    <div class="card-header">
      <h2>{{ card.type.toUpperCase() }}</h2>
      <img :src="getIcon()" alt="card icon" class="card-icon">
    </div>
    <div style="display: flex;">
      <p style="flex: 2 0 0;">{{ card.victoryPoint ? cardDescriptions["victory point"] : cardDescriptions[card.type] }}</p>
      <button
        @click="useCard()"
        id="use-card-button"
        style="flex: 1 0 0; height: 2rem;"
      >Use</button>
    </div>
  </div>
  <div class="card" v-else>
    <div class="card-header">
      <h2>Borken Card</h2>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    card: Object,
  },
  data() {
    return {
      cardDescriptions: {
        "knight": "Move the robber",
        "road building": "Place two free roads",
        "year of plenty": "Take two resources of your choice from the stockpile",
        "monopoly": "Steal all of a specified resource from players",
        "victory point": "Free victory point"
      }
    }
  },
  methods: {
    getIcon() {
      if(this.card.type === "knight") {
        return `/images/development_cards/knight_${this.card.knightType}.png`
      }
      return `/images/development_cards/${this.card.type.replaceAll(" ", "_")}.png`
    },
    useCard() {
      socket.emit("perform_game_action", {
        action: "use_development_card",
        card: this.card,
      }, () => {})
    },
  },
}
</script>

<style scoped>
  .card {
    height: max-content;
    padding: 0.25em 1.5em;
    border-radius: 16px;
    border: 3px solid var(--theme-game-display-1);
    background-color: var(--theme-game-display-2);
    display: flex;
    flex-direction: column;
    transition: .2s;
    margin: 0;
    position: relative;
    z-index: 1;
  }

  .card:hover ~.card { transform: translateY(0.2em); }
  .card:hover {
    transform: translateY(-0.4em);
    z-index: 2;
  }

  .card:not(:hover) #use-card-button { visibility: hidden; }
  .card:last-child #use-card-button { visibility: visible; }

  .card:not(:first-child) {
    margin-top: -3em;
  }

  .card .card-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.2em;
  }
  .card .card-header .card-icon {
    width: 4em;
    height: 4em;
  }
  .card p { font-size: 0.8em; }
  .card-header > h2 {
    font-size: 20px;
    margin: .25rem 0;
    text-decoration: none;
    color: inherit;
    border: 0;
    display: inline-block;
    cursor: pointer;
  }
</style>