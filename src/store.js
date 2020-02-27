import {DEFAULT_TOLERANCE, isLocationOnEdge} from './utils';
import { point, distance, polygon, area } from '@turf/turf'
const store = {
    state: {
        platform: {},
        map: {},
        group: {},
        ui: {},
        coords: [],
        apikey: 'diFAbX23cnWvysem7HyKRyrUUtV2Lpwymc-MhMF8H0Y',
        position: {coord: { lat: 21.1458, lng: 79.0882 }, accuracy: null, marker: ''},
        error: '',
        turfPoints: [],
        area: null,
        showResult: false
        
    },

  positionSvg : '<svg width="24" height="24" ' +
  'xmlns="http://www.w3.org/2000/svg">' +
  '<rect stroke="white" fill="#1b468d" x="1" y="1" width="22" ' +
  'height="22" /><text x="12" y="18" font-size="12pt" ' +
  'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
  'fill="white">C</text></svg>',

    createPlatform() {
        this.state.platform = new H.service.Platform({
            'apikey': this.state.apikey
        });
    },
    getCircleAccuracy() {
        if(this.state.position.accuracy != null)
        this.state.map.addObject(new H.map.Circle(
            // The central point of the circle
            this.state.position.coord,
            // The radius of the circle in meters
            this.state.position.accuracy,
            {
              style: {
                strokeColor: 'rgba(55, 85, 170, 0.6)', // Color of the perimeter
                lineWidth: 2,
              }
            }
          ));
    },
    setCenter(pos){
        this.state.position.coord.lat = pos.coords.latitude;
        this.state.position.coord.lng = pos.coords.longitude;
        this.state.position.accuracy = pos.coords.accuracy;
        this.state.map.center = this.state.position.coord;
        this.state.map.setCenter(this.state.position.coord);
        this.state.map.removeObject(this.state.position.marker);
    },
    getPosition(){
        if(!("geolocation" in navigator)) {
            this.state.errorStr = 'Geolocation is not available.';
            return;
        }
    
        this.state.gettingLocation = true;
        // get position
        navigator.geolocation.getCurrentPosition(pos => {
        this.state.gettingLocation = false;
        this.setCenter(pos);
        this.setLocationMarker();
        this.getCircleAccuracy();
        }, err => {
        this.state.gettingLocation = false;
        this.state.errorStr = err.message;
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        })
    },
    setLocationMarker() {
        let icon = new H.map.Icon(this.positionSvg);
        this.state.position.marker = new H.map.Marker(this.state.position.coord, {icon: icon});
        this.state.map.addObject(this.state.position.marker);

    },
    createMap(elem) {
        let defaultLayers = this.state.platform.createDefaultLayers();
        this.state.map = new H.Map(
            elem,
            defaultLayers.vector.normal.map,
            {
            zoom: 15,
            center: this.state.position.coord
            });
        //add interactions and marker events
        this.state.ui = H.ui.UI.createDefault(this.state.map, defaultLayers);

        var mapSettings = this.state.ui.getControl('mapsettings');
        var zoom = this.state.ui.getControl('zoom');
        var scalebar = this.state.ui.getControl('scalebar');

        mapSettings.setAlignment('top-left');
        zoom.setAlignment('top-left');
        scalebar.setAlignment('top-left');

        this.setupMapEvents();
        this.setLocationMarker()
        //add a polygon group
        this.state.group = new H.map.Group();
        this.state.map.addObject(this.state.group);
    },
    dropMarker: function(evt) {
        //convert viewport cordinates to geocordinates
        let coord = this.state.map.screenToGeo(evt.currentPointer.viewportX,
        evt.currentPointer.viewportY);
        let ptArr = Object.values(coord);
        let pt = this.createPoint(ptArr);
        if(pt) {
            this.addMarker(coord);
        }
    },
    addMarker(coord){
        let marker = new H.map.Marker(coord, { volatility: true });
        marker.draggable = true;
        this.state.coords.push(coord);
        this.state.group.addObject(marker);
    },
    calculateArea() {
        let  coords = [[...this.state.turfPoints]];
        var points = polygon(coords);
        this.state.area = area(points);
    },
    createPoint(ptArr){
        let pt = point(ptArr);
        if(this.state.turfPoints.length < 2) {
            this.state.turfPoints.push(ptArr);
            return true;
        } 
        else {
            let result = distance(pt, point(this.state.turfPoints[0]))*1000; //in metres
            if(result > 10){
                this.state.turfPoints.push(ptArr);
                return true;
            } else{
                this.state.turfPoints.push(this.state.turfPoints[0]);
                this.addPolygonToMap();
                return false;
            }
        }

    },
    addPolygonToMap() {
        var lineString = new H.geo.LineString();
        let points = [...this.state.coords, this.state.coords[0]]
        points.map(item => lineString.pushPoint(item));
        this.state.group.removeAll();
        try {
            this.state.group.addObject(new H.map.Polyline(
                lineString, { style: { lineWidth: 4 }}
            ));
            this.calculateArea();
        } catch(err) {
            this.error = err.message;
        }
    },
    setupMapEvents() {
        var mapEvents = new H.mapevents.MapEvents(this.state.map);
        this.state.map.addEventListener('tap', evt => this.dropMarker(evt));
        var behavior = new H.mapevents.Behavior(mapEvents);
        //map always occuies full screen
        window.addEventListener('resize', () => this.state.map.getViewPort().resize());

        this.state.map.addEventListener('dragstart', (ev) => {
            var target = ev.target,
                pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
              var targetPosition = this.state.map.geoToScreen(target.getGeometry());
              target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
              behavior.disable();
            }
        }, false);

        this.state.map.addEventListener('dragend', (ev) => {
            var target = ev.target;
            if (target instanceof H.map.Marker) {
              behavior.enable();
            }
        }, false);

        this.state.map.addEventListener('drag', (ev) => {
            var target = ev.target,
                pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
              target.setGeometry(this.state.map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
            }
        }, false);
    }
};

export default store;