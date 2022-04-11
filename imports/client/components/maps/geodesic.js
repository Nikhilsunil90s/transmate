/* eslint-disable prefer-template */
/* eslint-disable func-names */
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

const Coord = function(lon, lat) {
  this.lon = lon;
  this.lat = lat;
  this.x = D2R * lon;
  this.y = D2R * lat;
};

Coord.prototype.view = function view() {
  return String(this.lon).slice(0, 4) + "," + String(this.lat).slice(0, 4);
};

Coord.prototype.antipode = function antipode() {
  const antiLat = -1 * this.lat;
  const antiLon = this.lon < 0 ? 180 + this.lon : (180 - this.lon) * -1;
  return new Coord(antiLon, antiLat);
};

const LineString = function linsestring() {
  this.coords = [];
  this.length = 0;
};

LineString.prototype.move_to = function moveTo(coord) {
  this.length += 1;
  this.coords.push(coord);
};

const Arc = function arc(properties) {
  this.properties = properties || {};
  this.geometries = [];
};

Arc.prototype.json = function() {
  if (this.geometries.length <= 0) {
    return {
      geometry: { type: "LineString", coordinates: null },
      type: "Feature",
      properties: this.properties
    };
  }
  if (this.geometries.length === 1) {
    return {
      geometry: { type: "LineString", coordinates: this.geometries[0].coords },
      type: "Feature",
      properties: this.properties
    };
  }
  const multiline = [];
  for (let i = 0; i < this.geometries.length; i += 1) {
    multiline.push(this.geometries[i].coords);
  }
  return {
    geometry: { type: "MultiLineString", coordinates: multiline },
    type: "Feature",
    properties: this.properties
  };
};

Arc.prototype.strip = function() {
  const { H } = window;
  const s = H.geo.Strip ? new H.geo.Strip() : new H.geo.LineString();
  for (let i = 0; i < this.geometries.length; i += 1) {
    if (this.geometries[i].coords.lenght !== 0) {
      const { coords } = this.geometries[i];
      for (let j = 0; j < coords.length; j += 1) {
        const p = new H.geo.Point(coords[j][1], coords[j][0]);
        s.pushPoint(p);
      }
    }
  }
  return s;
};

// TODO - output proper multilinestring
Arc.prototype.wkt = function() {
  let wktString = "";
  let wkt = "LINESTRING(";
  const collect = function(c) {
    wkt += c[0] + " " + c[1] + ",";
  };
  for (let i = 0; i < this.geometries.length; i += 1) {
    if (this.geometries[i].coords.length === 0) {
      return "LINESTRING(empty)";
    }
    const { coords } = this.geometries[i];
    coords.forEach(collect);
    wktString += wkt.substring(0, wkt.length - 1) + ")";
  }
  return wktString;
};

//
//  http://en.wikipedia.org/wiki/Great-circle_distance
//

const GreatCircle = function(start, end, properties) {
  if (!start || start.x === undefined || start.y === undefined) {
    throw new Error(
      "GreatCircle constructor expects two args: start and end objects with x and y properties"
    );
  }
  if (!end || end.x === undefined || end.y === undefined) {
    throw new Error(
      "GreatCircle constructor expects two args: start and end objects with x and y properties"
    );
  }
  this.start = new Coord(start.x, start.y);
  this.end = new Coord(end.x, end.y);
  this.properties = properties || {};

  const w = this.start.x - this.end.x;
  const h = this.start.y - this.end.y;
  const z =
    Math.sin(h / 2.0) ** 2 +
    Math.cos(this.start.y) * Math.cos(this.end.y) * Math.sin(w / 2.0) ** 2;
  this.g = 2.0 * Math.asin(Math.sqrt(z));

  if (this.g === Math.PI) {
    throw new Error(
      "it appears " +
        start.view() +
        " and " +
        end.view() +
        " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite"
    );
  } else if (Number.isNaN(this.g)) {
    throw new Error(
      "could not calculate great circle between " + start + " and " + end
    );
  }
};

//
// http://williams.best.vwh.net/avform.htm#Intermediate
//
GreatCircle.prototype.interpolate = function(f) {
  const A = Math.sin((1 - f) * this.g) / Math.sin(this.g);
  const B = Math.sin(f * this.g) / Math.sin(this.g);
  const x =
    A * Math.cos(this.start.y) * Math.cos(this.start.x) +
    B * Math.cos(this.end.y) * Math.cos(this.end.x);
  const y =
    A * Math.cos(this.start.y) * Math.sin(this.start.x) +
    B * Math.cos(this.end.y) * Math.sin(this.end.x);
  const z = A * Math.sin(this.start.y) + B * Math.sin(this.end.y);
  const lat = R2D * Math.atan2(z, Math.sqrt(x ** 2 + y ** 2));
  const lon = R2D * Math.atan2(y, x);
  return [lon, lat];
};

//
// Generate points along the great circle
//
GreatCircle.prototype.arc = function(npoints, options) {
  const firstPass = [];
  if (!npoints || npoints <= 2) {
    firstPass.push([this.start.lon, this.start.lat]);
    firstPass.push([this.end.lon, this.end.lat]);
  } else {
    const delta = 1.0 / (npoints - 1);
    for (let i = 0; i < npoints; i += 1) {
      const step = delta * i;
      const pair = this.interpolate(step);
      firstPass.push(pair);
    }
  }

  // partial port of dateline handling from:
  //  gdal/ogr/ogrgeometryfactory.cpp
  //
  //  TODO - does not handle all wrapping scenarios yet
  //
  let bHasBigDiff = false;
  let dfMaxSmallDiffLong = 0;

  // from http://www.gdal.org/ogr2ogr.html
  // -datelineoffset:
  // (starting with GDAL 1.10) offset from dateline in degrees (default long. = +/- 10deg, geometries within 170deg to -170deg will be splited)
  const dfDateLineOffset = options && options.offset ? options.offset : 10;
  const dfLeftBorderX = 180 - dfDateLineOffset;
  const dfRightBorderX = -180 + dfDateLineOffset;
  const dfDiffSpace = 360 - dfDateLineOffset;

  // https://github.com/OSGeo/gdal/blob/7bfb9c452a59aac958bff0c8386b891edf8154ca/gdal/ogr/ogrgeometryfactory.cpp#L2342
  for (let j = 1; j < firstPass.length; j += 1) {
    const dfPrevX = firstPass[j - 1][0];
    const dfX = firstPass[j][0];
    const dfDiffLong = Math.abs(dfX - dfPrevX);
    if (
      dfDiffLong > dfDiffSpace &&
      ((dfX > dfLeftBorderX && dfPrevX < dfRightBorderX) ||
        (dfPrevX > dfLeftBorderX && dfX < dfRightBorderX))
    ) {
      bHasBigDiff = true;
    } else if (dfDiffLong > dfMaxSmallDiffLong) {
      dfMaxSmallDiffLong = dfDiffLong;
    }
  }

  const poMulti = [];
  if (bHasBigDiff && dfMaxSmallDiffLong < dfDateLineOffset) {
    let poNewLS = [];
    poMulti.push(poNewLS);
    for (let k = 0; k < firstPass.length; k += 1) {
      const dfX0 = parseFloat(firstPass[k][0]);
      if (k > 0 && Math.abs(dfX0 - firstPass[k - 1][0]) > dfDiffSpace) {
        let dfX1 = parseFloat(firstPass[k - 1][0]);
        let dfY1 = parseFloat(firstPass[k - 1][1]);
        let dfX2 = parseFloat(firstPass[k][0]);
        let dfY2 = parseFloat(firstPass[k][1]);
        if (
          dfX1 > -180 &&
          dfX1 < dfRightBorderX &&
          dfX2 === 180 &&
          k + 1 < firstPass.length &&
          firstPass[k - 1][0] > -180 &&
          firstPass[k - 1][0] < dfRightBorderX
        ) {
          poNewLS.push([-180, firstPass[k][1]]);
          k += 1;
          poNewLS.push([firstPass[k][0], firstPass[k][1]]);
        } else if (
          dfX1 > dfLeftBorderX &&
          dfX1 < 180 &&
          dfX2 === -180 &&
          k + 1 < firstPass.length &&
          firstPass[k - 1][0] > dfLeftBorderX &&
          firstPass[k - 1][0] < 180
        ) {
          poNewLS.push([180, firstPass[k][1]]);
          k += 1;
          poNewLS.push([firstPass[k][0], firstPass[k][1]]);
        }

        if (dfX1 < dfRightBorderX && dfX2 > dfLeftBorderX) {
          // swap dfX1, dfX2
          const tmpX = dfX1;
          dfX1 = dfX2;
          dfX2 = tmpX;

          // swap dfY1, dfY2
          const tmpY = dfY1;
          dfY1 = dfY2;
          dfY2 = tmpY;
        }
        if (dfX1 > dfLeftBorderX && dfX2 < dfRightBorderX) {
          dfX2 += 360;
        }

        if (dfX1 <= 180 && dfX2 >= 180 && dfX1 < dfX2) {
          const dfRatio = (180 - dfX1) / (dfX2 - dfX1);
          const dfY = dfRatio * dfY2 + (1 - dfRatio) * dfY1;
          poNewLS.push([firstPass[k - 1][0] > dfLeftBorderX ? 180 : -180, dfY]);
          poNewLS = [];
          poNewLS.push([firstPass[k - 1][0] > dfLeftBorderX ? -180 : 180, dfY]);
          poMulti.push(poNewLS);
        } else {
          poNewLS = [];
          poMulti.push(poNewLS);
        }
        poNewLS.push([dfX0, firstPass[k][1]]);
      } else {
        poNewLS.push([firstPass[k][0], firstPass[k][1]]);
      }
    }
  } else {
    // add normally
    const poNewLS0 = [];
    poMulti.push(poNewLS0);
    for (let l = 0; l < firstPass.length; l += 1) {
      poNewLS0.push([firstPass[l][0], firstPass[l][1]]);
    }
  }

  const arc = new Arc(this.properties);
  for (let m = 0; m < poMulti.length; m += 1) {
    const line = new LineString();
    arc.geometries.push(line);
    const points = poMulti[m];
    for (let j0 = 0; j0 < points.length; j0 += 1) {
      line.move_to(points[j0]);
    }
  }
  return arc;
};

export { Arc, Coord, GreatCircle };
