<template>
  <div>
    <div ref="map" style="width: 100vw; height: 100vh;"></div>
  </div>
</template>

<script>
export default {
    name: 'Map',
    data() {
        return {
            platform: {},
        }
    },
    created() {
        this.platform = new H.service.Platform({
        'apikey': 'diFAbX23cnWvysem7HyKRyrUUtV2Lpwymc-MhMF8H0Y'
        });
    },
    mounted() {
        let defaultLayers = this.platform.createDefaultLayers();
        var map = new H.Map(
            this.$refs.map,
            defaultLayers.vector.normal.map,
            {
            zoom: 10,
            center: { lat: 52.5, lng: 13.4 }
            });

    }
}
</script>

<style>

</style>