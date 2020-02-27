<template>
  <div>
    <div  class="row">
        <button  :disabled="!showCalculate" @click="confirm()">Calculate</button>
        <button @click="reset()">Reset</button>
    </div>
    <div v-show="!state.showResult" ref="map" style="width: 100vw; height: 100vh;"></div>
    <Result v-show="state.showResult"  />

  </div>

</template>

<script>
    import store from '../store';
    import Result from './Result';
    export default {
        name: 'Map',
        data() {
            return {
                state: store.state,
            }
        },
        components: {
            Result
        },
        created() {
            store.createPlatform();
            console.log(process.env.VUE_APP_APIKEY);
        },
        computed:{
            showCalculate: function() {
                return this.state.turfPoints.length > 2 && this.state.turfPoints[0] == this.state.turfPoints[this.state.turfPoints.length -1];
            }
        },
        mounted() {
            store.createMap(this.$refs.map);
            store.getPosition();
        },
        methods: {
            confirm(){
                this.state.showResult = confirm('Have you entered all the points');
            },

            reset() {
                let result = confirm('Are you sure?');
                if(result) {
                    console.log(result);
                    this.state.coords = [];
                    this.state.turfPoints = [];
                    this.state.group.removeAll();
                    this.state.showResult = false;
                    this.state.area = null;
                }
                
            }
        }
    }
</script>

<style>

</style>