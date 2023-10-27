const fs = require("fs");
const db = require("../utils/db");
const geoJSONtoWKT = require("./convert");

async function insertStates(path) {
  console.log(path);
  fs.readFile(path, "utf8", async (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }
    let { features } = JSON.parse(data);
    features = features[0];

    const stateName = features.properties.name;
    const geometry = features.geometry;
    const polygon = geoJSONtoWKT(geometry);
    const coordinates = {
      type: geometry.type,
      coordinates: geometry.coordinates,
    };
    console.log(stateName);

    await db.none(
      `
        insert into states(state_name, state_polygon, state_coordinates)
        values (
            $(state_name),
            ST_Multi(ST_GeomFromText($(state_polygon),4326)),
            $(state_coordinates)::jsonb
        )
        on conflict(state_name) do update
        set
            state_name=$(state_name),
            state_polygon=ST_Multi(ST_GeomFromText($(state_polygon),4326)),
            state_coordinates=$(state_coordinates)::jsonb
      `,
      {
        state_name: stateName,
        state_polygon: polygon,
        state_coordinates: coordinates,
      }
    );
  });
}

insertStates(process.argv[2]);
