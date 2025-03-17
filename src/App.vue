<script setup>
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import Navigation from './components/Navigation.vue'
import { createRouter, createWebHistory } from 'vue-router'
import router from './router'
</script>

<template>
  <div class="all">
    <navigation class="nav"/>
    <router-view class="view"/>
  </div>
</template>

<style scoped>
.all {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.view {
  flex: 1;
}

</style>

<script>
export default {
  data: () => ({
    tab: null,
  }),
}
</script>