<script setup>
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import Navigation from './components/Navigation.vue'
import { createRouter, createWebHistory } from 'vue-router'
import router from './router'
</script>

<template>
  <navigation />
  <router-view />
</template>

<style scoped>

</style>

<script>
export default {
  data: () => ({
    tab: null,
  }),
}
</script>