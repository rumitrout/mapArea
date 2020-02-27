<template>
  <div id="app">
    <div v-if="state.error">
      {{state.error}}
    </div>
    <div v-if="state.gettingLocation">
      <i>Getting your location...</i>
    </div>
    <Map />
  </div>
</template>

<script>
import Map from './components/Map.vue'
import store from './store';

export default {
  name: 'App',
  components: {
    Map
  },
  data() {
    return {
        state: store.state
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
