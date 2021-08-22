<template>
  <div class="card-header">
    <h2 class="card-header">{{ card.type }}</h2>
    <img :src="getIcon" alt="card icon" class="card-icon">
  </div>
  <p>{{ card.victoryPoint ? cardDescriptions["victory point"] : cardDescriptions[card.type] }}</p>
  <button
    @click="useCard"
    id="use-card-button"
    style="flex: 1 0 0; height: 2rem;"
  >Use</button>
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
        return require(`@/images/development_cards/knight_${developmentCard.knightType}.png`)
      }
      return require(`@/images/development_cards/${developmentCard.type.replaceAll(" ", "_")}.png`)
    },
    useCard() {
      socket.emit("perform_game_action", {
        action: "use_development_card",
        card: this.card,
      })
    },
  },
}
</script>