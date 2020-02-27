<template>
  <div>
    <div ref="map" style="width: 100vw; height: 100vh;"></div>
  </div>
</template>

<script>
    import store from '../store';
    export default {
        name: 'Map',
        data() {
            return {
                state: store.state,
            }
        },
        created() {
            store.createPlatform();
        },
        computed:{
            showCalculate: function() {
                return this.state.turfPoints[0] == this.state.turfPoints[this.state.turfPoints.length -1];
            }
        },
        mounted() {
            store.createMap(this.$refs.map);
            store.getPosition();
        },
        methods: {
            confirm(){

            },

            reset: function() {
                this.state.coords = [];
            }
        }
    }
</script>

<style>

</style>