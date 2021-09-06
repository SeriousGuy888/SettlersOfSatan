<template>
  <div class="title-container">
    <div class="title-container-top">
      <img src="/images/logo/logo.svg?data" alt="logo" id="home-title-logo">
      <h1 class="page-title"><span class="title-satan">Satan</span></h1>
    </div>
    <div class="title-container-links">
      <a href="/contributors" target="_blank">Contributors</a>
      <a href="/stats" target="_blank">Server Stats</a>
      <a href="https://scotscoop.com/wp-content/uploads/2020/06/IMG_2214-380x475.jpg" target="_blank">Building Costs</a>
    <span id="dark-theme-toggle"></span>
      <PreferencesPanel />
    </div>
  </div>
</template>

<script>
import PreferencesPanel from "./PreferencesPanel.vue"

export default {
  components: {
    PreferencesPanel,
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