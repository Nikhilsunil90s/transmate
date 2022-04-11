import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";

import get from "lodash.get";

import { GreatCircle } from "./geodesic";

const debug = require("debug")("here:map");

const DEFAULT_MAX_ZOOM = 16;
const ARC_POINTS = 100;
const ARC_OFFSET = 20;
const DEFAULT_LINE_STYLE = {
  lineWidth: 4,
  strokeColor: "rgba(0, 128, 255, 0.7)"
};

function addMarker({ group, color, coords }) {
  if (!group) return;
  const { H } = window;
  const icon = new H.map.Icon(
    color === "green" ? "/images/marker-green.svg" : "/images/marker-blue.svg"
  );
  const marker = new H.map.Marker(coords, { icon });
  group.addObject(marker);
}

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route, group, style = DEFAULT_LINE_STYLE) {
  const { H } = window;
  const lineStrings = [];
  route.sections.forEach(section => {
    if (section && section.polyline) {
      // decode LineString from the flexible polyline
      const linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
      lineStrings.push(linestring);

      // Create a polyline to display the route:
      const polyline = new H.map.Polyline(linestring, { style });
      debug("route bounding box %o ", polyline.getBoundingBox());

      // Add the polyline to the map
      group.addObject(polyline);
    }
  });
  const multiLineString = new H.geo.MultiLineString(lineStrings);
  return multiLineString;
}

function calculateRouteFromAtoB(map, group, platform, from, to) {
  return new Promise((resolve, reject) => {
    const router = platform.getRoutingService(null, 8);
    const routes = group;
    const routeParams = {
      routingMode: "fast",
      transportMode: "truck",
      origin: `${from.lat},${from.lng}`,
      destination: `${to.lat},${to.lng}`,
      return: "polyline"
    };

    const onSuccess = result => {
      if (result.routes.length) {
        const multiLineString = addRouteShapeToMap(result.routes[0], routes);
        debug("resize window to show whole route!", multiLineString.getBoundingBox());

        // Set the map's viewport to make the whole route visible:

        map.getViewModel().setLookAtData({ bounds: multiLineString.getBoundingBox() });
        resolve(routes);
      } else {
        reject(new Error("road type, but no route found!"));
      }
    };
    const onError = error => error;

    router.calculateRoute(routeParams, onSuccess, onError);
  });
}

function buildPolyLine(from, to, style = DEFAULT_LINE_STYLE) {
  const { H } = window;
  debug("build polyline from %o to %o", from, to);
  const start = new H.geo.Point(from.lat, from.lng);
  const end = new H.geo.Point(to.lat, to.lng);
  debug("build polyline start %o end %o", start, end);

  const startC = { x: start.lng, y: start.lat };
  const endC = { x: end.lng, y: end.lat };
  const gc0 = new GreatCircle(startC, endC, {
    name: "line",
    color: "#ff7200"
  });
  debug("build polyline gc0 %o", gc0);
  if (!gc0 || gc0.g === 0) return null;
  const line0 = gc0.arc(ARC_POINTS, { offset: ARC_OFFSET });
  const strip = line0.strip();
  debug("build polyline strip %o", strip);
  return new H.map.Polyline(strip, { style });
}

function drawPolyLine(map, polyLine) {
  map.addObject(polyLine);
  map.getViewModel().setLookAtData({ bounds: polyLine.getBoundingBox() });
}

export class DisplayMapClass extends React.Component {
  constructor(props) {
    super(props);
    const { height = 280, markers = [], mapType = "truck", maxZoom, route } = props; // markers: {coords: {lat, lng}, color}
    this.height = height;
    this.mapType = mapType;
    this.maxZoom = maxZoom || DEFAULT_MAX_ZOOM;

    this.mapRef = React.createRef();
    this.state = {
      markers,
      mapType,
      route,
      map: null // The map instance to use during cleanup
    };
  }

  componentDidMount() {
    const { H } = window;
    if (!Meteor.settings.public.HERE_KEY) return console.error("missing here api key");
    const platform = new H.service.Platform({
      apikey: Meteor.settings.public.HERE_KEY
    });

    const defaultLayers = platform.createDefaultLayers();
    defaultLayers.vector.normal[this.mapType].setMax(this.maxZoom);

    const center = get(this.state, ["markers", 0, "coords"], { lat: 50, lng: 5 });

    // Create an instance of the map
    const map = new H.Map(this.mapRef.current, defaultLayers.vector.normal[this.mapType], {
      // This map is centered over Europe
      center,
      zoom: 4,
      padding: { top: 30, left: 30, bottom: 30, right: 30 },
      pixelRatio: window.devicePixelRatio || 1
    });

    // add a resize listener to make sure that the map occupies the whole container
    window.addEventListener("resize", () => map.getViewPort()?.resize());

    // coordinates in group:
    const group = new H.map.Group();
    (this.state.markers || []).forEach(stop => {
      addMarker({ group, ...stop });
    });

    map.addObject(group);
    map.getViewModel().setLookAtData({
      bounds: group.getBoundingBox()
    });

    if (this.state.markers?.length > 1) {
      const from = this.state.markers[0].coords;
      const to = [...this.state.markers].pop().coords;
      const polyLine = buildPolyLine(from, to);

      debug("add route from %o to %o", from, to, polyLine);

      if (this.state.route?.road && polyLine) {
        calculateRouteFromAtoB(map, group, platform, from, to).catch(error => {
          console.error("failed to render map ", error);
          drawPolyLine(map, polyLine);
        });
      } else if (polyLine) {
        drawPolyLine(map, polyLine);
      }
    }

    return this.setState({ map });
  }

  componentWillUnmount() {
    // Cleanup after the map to avoid memory leaks when this component exits the page
    if (this.state.map) {
      this.state.map.dispose();
    }
  }

  render() {
    // Set a height on the map so it will display
    return <div ref={this.mapRef} style={{ height: `${this.height}px` }} />;
  }
}

const latLngType = PropTypes.shape({
  lat: PropTypes.number,
  lng: PropTypes.number
});

DisplayMapClass.propTypes = {
  height: PropTypes.number,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      coords: latLngType
    })
  ),
  mapType: PropTypes.string,
  maxZoom: PropTypes.number,
  route: PropTypes.shape({
    polyline: PropTypes.shape({
      from: latLngType,
      to: latLngType,
      options: PropTypes.object // {style: { strokeColor: "rgba(0,0,255,0.7)", lineWidth: 4}}
    })
  })
};
