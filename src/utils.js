export const name = 'square';
export const DEFAULT_TOLERANCE = 0.1;  // meters.
export const EARTH_RADIUS = 6371009; //metres IUG
const pi = Math.PI;


export function isLocationOnEdge(point, polygon, tolerance = DEFAULT_TOLERANCE, geodesic = true) {
    return isLocationOnEdgeOrPath(point, polygon, true, geodesic, tolerance);
}
// Returns hav(asin(x)).
export function havFromSin(x) {
    let x2 = x * x;
    return x2 / (1 + Math.sqrt(1 - x2)) * .5;
}

// Returns sin(arcHav(x) + arcHav(y)).
export function sinSumFromHav(x, y) {
    let a = Math.sqrt(x * (1 - x));
    let b = Math.sqrt(y * (1 - y));
    return 2 * (a + b - 2 * (a * y + b * x));
}
export function mercator(lat) {
    return Math.log(Math.tan(lat * 0.5 + pi/4));
}
export function inverseMercator(y) {
    return 2 * Math.atan(exp(y)) - M_PI / 2;
}
export function wrap(n, min, max) {
    return (n >= min && n < max) ? n : (mod(n - min, max - min) + min);
}

export function mod(x, m) {
    return ((x % m) + m) % m;
}

export function clamp( x, low, high) {
    return x < low ? low : (x > high ? high : x);
}


// Returns haversine(angle-in-radians).
// hav(x) == (1 - cos(x)) / 2 == sin(x / 2)^2.
export function hav(x) {
    let sinHalf = Math.sin(x * 0.5);
    return sinHalf * sinHalf;
}
export function deg2rad(degrees) {
    return degrees * (pi/180);
}
export function rad2deg(radians) {
    return radians*(180/pi);
}
export function sinFromHav(h) {
    return 2 * Math.sqrt(h * (1 - h));
}
export function isLocationOnEdgeOrPath(point, poly, closed, geodesic, toleranceEarth) {
    let size = poly.length;
    if (size == 0) {
        return false;
    }
    let tolerance = toleranceEarth / EARTH_RADIUS;
    let havTolerance = hav(tolerance);
    let lat3 = deg2rad(point['lat']);
    let lng3 = deg2rad(point['lng']);
    let prev = closed != null ? poly[size - 1] : 0;
    let lat1 = deg2rad(prev['lat']);
    let lng1 = deg2rad(prev['lng']);

    if (geodesic) {
        for(let val in poly) {
            let lat2 = deg2rad(val['lat']);
            let lng2 = deg2rad(val['lng']);
            if ( isOnSegmentGC(lat1, lng1, lat2, lng2, lat3, lng3, havTolerance)) {
                return true;
            }
            let lat1 = lat2;
            let lng1 = lng2;
        }
    } else {
        // We project the points to mercator space, where the Rhumb segment is a straight line,
        // and compute the geodesic distance between point3 and the closest point on the
        // segment. This method is an approximation, because it uses "closest" in mercator
        // space which is not "closest" on the sphere -- but the error is small because
        // "tolerance" is small.
        let minAcceptable = lat3 - tolerance;
        let maxAcceptable = lat3 + tolerance;
        let y1 = mercator(lat1);
        let y3 = mercator(lat3);
        let xTry = [];
        for(let val in poly) {
            let lat2 = deg2rad(val['lat']);
            let y2 = mercator(lat2);
            let lng2 = deg2rad(val['lng']);                
            if (Math.max(lat1, lat2) >= minAcceptable && Math.min(lat1, lat2) <= maxAcceptable) {
                // We offset longitudes by -lng1; the implicit x1 is 0.
                let x2 = wrap(lng2 - lng1, -pi, pi);
                let x3Base = wrap(lng3 - lng1, -pi, pi);
                xTry[0] = x3Base;
                // Also explore wrapping of x3Base around the world in both directions.
                xTry[1] = x3Base + 2 * pi;
                xTry[2] = x3Base - 2 * pi;
                
                for(x3 in xTry) {
                    let dy = y2 - y1;
                    let len2 = x2 * x2 + dy * dy;
                    let t = len2 <= 0 ? 0 : clamp((x3 * x2 + (y3 - y1) * dy) / len2, 0, 1);
                    let xClosest = t * x2;
                    let yClosest = y1 + t * dy;
                    let latClosest = inverseMercator(yClosest);
                    let havDist = havDistance(lat3, latClosest, x3 - xClosest);
                    if (havDist < havTolerance) {
                        return true;
                    }
                }
            }
            let lat1 = lat2;
            let lng1 = lng2;
            let y1 = y2;
        }
    }
    return false;
}  

export function isOnSegmentGC( lat1, lng1, lat2, lng2, lat3, lng3, havTolerance) {
        
    let havDist13 = havDistance(lat1, lat3, lng1 - lng3);
    if (havDist13 <= havTolerance) {
        return true;
    }
    let havDist23 = havDistance(lat2, lat3, lng2 - lng3);
    if (havDist23 <= havTolerance) {
        return true;
    }
    let sinBearing = sinDeltaBearing(lat1, lng1, lat2, lng2, lat3, lng3);
    let sinDist13 = sinFromHav(havDist13);
    let havCrossTrack = havFromSin(sinDist13 * sinBearing);
    if (havCrossTrack > havTolerance) {
        return false;
    }
    let havDist12 = havDistance(lat1, lat2, lng1 - lng2);
    let term = havDist12 + havCrossTrack * (1 - 2 * havDist12);
    if (havDist13 > term || havDist23 > term) {
        return false;
    }
    if (havDist12 < 0.74) {
        return true;
    }
    let cosCrossTrack = 1 - 2 * havCrossTrack;
    let havAlongTrack13 = (havDist13 - havCrossTrack) / cosCrossTrack;
    let havAlongTrack23 = (havDist23 - havCrossTrack) / cosCrossTrack;
    let sinSumAlongTrack = sinSumFromHav(havAlongTrack13, havAlongTrack23);
    return sinSumAlongTrack > 0;  // Compare with half-circle == PI using sign of sin().
}

export function havDistance(lat1, lat2, dLng) {
    return hav(lat1 - lat2) + hav(dLng) * Math.cos(lat1) * Math.cos(lat2);
}

export function sinDeltaBearing( lat1, lng1, lat2, lng2, lat3, lng3) {
        
    let sinLat1 = Math.sin(lat1);
    let cosLat2 = Math.cos(lat2);
    let cosLat3 = Math.cos(lat3);
    let lat31 = lat3 - lat1;
    let lng31 = lng3 - lng1;
    let lat21 = lat2 - lat1;
    let lng21 = lng2 - lng1;
    let a = Math.sin(lng31) * cosLat3;
    let c = Math.sin(lng21) * cosLat2;
    let b = Math.sin(lat31) + 2 * sinLat1 * cosLat3 * hav(lng31);
    let d = Math.sin(lat21) + 2 * sinLat1 * cosLat2 * hav(lng21);
    let denom = (a * a + b * b) * (c * c + d * d);
    return denom <= 0 ? 1 : (a * d - b * c) / Math.sqrt(denom);
} 