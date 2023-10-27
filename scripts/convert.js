function geoJSONtoWKT(geoJSON) {
  const { type, coordinates } = geoJSON;

  switch (type) {
    case "Polygon":
      return polygonToWKT(coordinates);
    case "MultiPolygon":
      return multiPolygonToWKT(coordinates);
    case "Point":
      return pointToWKT(coordinates);
    default:
      throw new Error("Unsupported GeoJSON type");
  }
}

function pointToWKT(coordinates) {
  const ring = coordinates.join(" ");
  return "POINT(" + ring + ")";
}

function polygonToWKT(coordinates) {
  const rings = coordinates
    .map((ring) => {
      return "(" + ring.map((point) => point.join(" ")).join(", ") + ")";
    })
    .join(", ");
  return "POLYGON(" + rings + ")";
}

function multiPolygonToWKT(coordinates) {
  const polygons = coordinates.map((polygon) => {
    return "(" + polygonToWKT(polygon).slice(8, -1) + ")";
  });
  return "MULTIPOLYGON(" + polygons.join(", ") + ")";
}

// const geoJSONString = process.argv[2];
// const geoJSON = JSON.parse(geoJSONString);

module.exports = geoJSONtoWKT;
