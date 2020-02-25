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
            map: {},
            ui: {}
        }
    },
    created() {
        this.platform = new H.service.Platform({
        'apikey': 'diFAbX23cnWvysem7HyKRyrUUtV2Lpwymc-MhMF8H0Y'
        });
    },
    mounted() {
        let defaultLayers = this.platform.createDefaultLayers();
        this.map = new H.Map(
            this.$refs.map,
            defaultLayers.vector.normal.map,
            {
            zoom: 12,
            center: { lat: 21.1458, lng: 79.0882 }
            });
        this.ui = H.ui.UI.createDefault(this.map, defaultLayers);

        var mapSettings = this.ui.getControl('mapsettings');
        var zoom = this.ui.getControl('zoom');
        var scalebar = this.ui.getControl('scalebar');

        mapSettings.setAlignment('top-left');
        zoom.setAlignment('top-left');
        scalebar.setAlignment('top-left');

        var mapEvents = new H.mapevents.MapEvents(this.map);
        this.map.addEventListener('tap', function(evt) {
            // Log 'tap' and 'mouse' events:
            console.log(evt.type, evt.currentPointer.type); 
        });
        var behavior = new H.mapevents.Behavior(mapEvents);

        // var bubble = new H.ui.InfoBubble({ lat: 21.1458, lng: 79.0882 }, {
        //     content: '<b>Hello World!</b>'
        // });

        // this.ui.addBubble(bubble);




    }
}
</script>

<style>

</style>