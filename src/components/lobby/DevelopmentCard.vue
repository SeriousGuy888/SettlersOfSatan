<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-header">{{ card.type }}</h2>
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