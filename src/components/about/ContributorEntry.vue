<template>
  <div class="human">
    <a class="gh-link" :href="githubLink" target="_blank" v-if="contributor.github">
      <img :src="githubPfp" alt="github pfp">
    </a>
    <p v-else>
      no github link D:
    </p>
    <h3 class="contributor-title">{{ contributor.name }}</h3>
  </div>
  
  <div class="list">
    <p class="contribution" v-for="contribution in contributor.contributions" :key="contribution">
      {{ contributionLang.english[contribution] || contribution }}
    </p>
  </div>

  <div class="contribution-percentage">
    {{ contributor.percent }}%
  </div>
</template>

<script>
export default {
  props: {
    contributor: Object,
  },
  data() {
    return {
      contributionLang: {
        "english": {
          "web_design": "Web Design",
          "vue": "Vue Rewrite",
          "dark_theme": "Dark Theme CSS",
          "back_end": "Server Backend",
          "art": "Art",
          "participation": "Emotional Support",
          "catan": "Knowing the Rules of Catan",
          "sounds": "Sound Effects",
          "background": "Stealing the Background Image",
          "distract_liam": "Distracting Liam",
          "jakob_criticism": "Criticism of Billzo's Web Design",
          "going_missing": "Disappearing for a Long Time"
        },
        "billzonian": {
          "web_design": "Web Designment",
          "vue": "Vue Retypement",
          "dark_theme": "Night Theme CSS",
          "back_end": "Serveur Bakkend",
          "art": "Vandalism",
          "participation": "Sentimental Assistion",
          "catan": "Kogging How tu Catan·ise",
          "sounds": "Sound Effekts",
          "background": "Thieving c Bakkground Image",
          "distract_liam": "Distrakting Liam",
          "jakob_criticism": "Bullying Billzo Their Web Designment",
          "going_missing": "Exiting for Many Suns"
        }
      }
    }
  },
  computed: {
    githubLink() {
      return `https://github.com/${this.contributor.github}`
    },
    githubPfp() {
      return `${this.githubLink}.png`
    },
  },
}
</script>

<style scoped>
h3 {
  margin: 0.1em;
  font-size: 1.4em;
}
.gh-link::after {
  background-image: none;
  width: 0;
}
.gh-link img {
  width: 6em;
  border: 3px solid var(--theme-game-display-1);
  border-radius: 50%;
}

.human {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  width: 8em;
  height: 100%;
}

.list {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 1em;
  width: 100%;
  justify-content: center;
  text-align: right;
}
.list .contribution {
  margin: 0;
  height: min-content;
}


.contribution-percentage {
  position: absolute;
  width: 2rem;
  height: 2rem;
  top: -1.75rem;
  left: -1.75rem;

  box-shadow: 5px 5px #0005;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  cursor: default;
  user-select: none;
  font-size: 1.2em;
  word-wrap: normal;

  border-radius: 50%;
  padding: 1em;
  border: 3px solid var(--theme-game-display-1);
  background-color: var(--theme-game-display-2);
}
.contribution-percentage::before {
  content: "approx.";
  font-size: 0.6em;
}
</style>