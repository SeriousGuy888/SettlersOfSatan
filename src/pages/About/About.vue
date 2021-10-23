<template>
  <p>
    This project is a clone of Settlers of Catan.
    It was made in the summer of 2021 by Billzo and Liam.
    See above for a link to the GitHub repo for this project.
  </p>

  <h2>Contributors</h2>
  <div id="credits-container">
    <div class="contributor" v-for="contributor in contributorList" :key="contributor">
      <ContributorEntry :contributor="contributor" />
    </div>
  </div>
</template>

<script>
import ContributorEntry from "@/components/about/ContributorEntry.vue"

export default {
  name: "About",
  components: {
    ContributorEntry,
  },
  data() {
    return {
      contributorList: [
        {
          "name": "Billzo",
          "github": "SeriousGuy888",
          "percent": 82,
          "contributions": [
            "web_design",
            "vue",
            "dark_theme",
            "back_end",
            "art"
          ]
        },
        {
          "name": "Liam",
          "github": "RandumPerson314",
          "percent": 15,
          "contributions": [
            "web_design",
            "back_end",
            "catan",
            "background"
          ]
        },
        {
          "name": "Hoang",
          "github": "MarkieHoang",
          "percent": 5,
          "contributions": [
            "art",
            "sounds",
            "participation",
            "readme"
          ]
        },
        {
          "name": "Jakob",
          "percent": -2,
          "contributions": [
            "sounds",
            "distract_liam",
            "jakob_criticism",
            "going_missing"
          ]
        }
      ],
    }
  },
}
</script>

<style>
#credits-container {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-auto-rows: 1fr;
  gap: 2em;
  margin: 2em;
}

.contributor {
  position: relative;
  min-height: 12rem;
  border-radius: 5px;
  padding: 1em;
  border: 3px solid var(--theme-game-display-1);
  background-color: var(--theme-game-display-2);
  
  display: flex;
  flex-direction: row;
  gap: 2em;
}
</style>