# Map Area Calculator
This is the second task of the final round for the interview with wotr.

Specifications
1. User can search a location. By default, map shows users current location (blue) with boundary circle
showing precision/accuracy of the location detected (like in Google Maps).
2. User can draw a polygon by clicking on points on the map. After first point, from the second point, as
soon as it is plotted, a line is drawn between first and second point, and so on. A polygon is said to be
completed with a closed shape. Last point is same as first point.
3. Upon closing the polygon, user is asked to confirm. On the next screen, the lat-long of each point of
polygon and total area is shown.
4. To have a cancel button to reset polygon making.

Reasoning:
1.I had to pick an api for the maps the main contenders were leaflet, google maps and here.
of these google maps was my first preference but it required an active billing account which I did not have so I chose here api.
2.After I dropped markers it was difficult to calculate the area as here does not have any in built api for area in polygon.
3.I wasted som time trying to port the code for calculating area and distance from the maps api. But I did not understand the methematics of goegraphic calculations.
4. turf.js is generally used with leaflet but i found it was suitable for my requirements. all the calculations(area and distance) are done by turf.
5.To close the polygon I have assumed an error range of 10mt (if the user clicks within 10 mts from the first point the polygon is closed.)

Future Planings: 
1.instead of asking permission on start add a locate me button.
2. also add a search bar to search location if user is not present
3. add options to convert measurements(acres, hectares).
4. reduce the loading time .

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
