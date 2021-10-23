<template>
  <div class="title-container">
    <div class="title-container-top">
      <img src="/images/logo/logo.svg?data" alt="logo" id="home-title-logo">
      <h1 class="page-title"><span class="title-satan">Satan</span></h1>
    </div>
    <div class="title-container-links">
      <a href="/about" target="_blank">About This Project / Contributors</a>
      <a href="/stats" target="_blank">Server Stats</a>
      <BuildingCosts />
      <span id="dark-theme-toggle"></span>
      <PreferencesPanel />
    </div>
  </div>
</template>

<script>
import BuildingCosts from "./BuildingCosts.vue"
import PreferencesPanel from "./PreferencesPanel.vue"

export default {
  components: {
    PreferencesPanel,
    BuildingCosts,
  },
}
</script>

<style scoped>
#home-title-logo {
  height: calc(var(--title-height) * 1.2);
}
.title-satan:hover {
  font-size: 0;
}
.title-satan:hover::after {
  content: "/səˈtæn/";
  font-family: 'Times New Roman', Times, serif;
  font-size: calc(var(--title-height) * 0.9);
}
</style>