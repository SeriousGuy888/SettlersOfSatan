<template>
  <button @click="toggle" class="collapsible" :class="{ 'collapsible-active': open }">{{ title }}</button>
  <slot v-if="open"></slot>
</template>

<script>
export default {
  props: {
    title: String,
    startOpen: Boolean, 
  },
  data() {
    return {
      open: false
    }
  },
  methods: {
    toggle() {
      this.open = !this.open
    }
  },
  mounted() {
    this.open = this.startOpen
  },
}
</script>

<style>
/* stolen from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_collapsible_symbol lol */
.collapsible {
  border-radius: 5px;
  cursor: pointer;
  padding: 0.2em 1em;
  width: 100%;
  outline: none;
  font-size: 1.1em;
  text-align: left;
  border: 3px solid var(--theme-game-display-1);
  background-color: var(--theme-game-display-2);
  margin-top: 0.5em;
  display: flex;
  justify-content: space-between;
}
.collapsible-active,
.collapsible:hover {
  background-color: var(--theme-game-display-1);
}
.collapsible::after {
  content: "\25BC";
}
.collapsible-active::after { content: "\25B2"; }
.collapsible-active { border-radius: 5px 5px 0 0; }
</style>