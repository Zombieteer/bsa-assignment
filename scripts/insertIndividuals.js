const fs = require("fs");
const csv = require("csvtojson");
const db = require("../utils/db");
const geoJSONtoWKT = require("./convert");
const { Pool } = require("pg");
const pgp = require("pg-promise")();

const pool = new Pool({
  user: "bsa",
  host: "db",
  database: "bsadb",
  password: "bsa",
  port: 5432,
  max: 200,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
var client;

async function insertIndividuals(path) {
  const individualExists = await db.oneOrNone(
    `select 1 as exist from residents limit 1`
  );
  if (individualExists && individualExists.exist) return;

  const readStream = fs.createReadStream(path);
  client = await pool.connect();

  let jsonData = [],
    batchSize = 10000,
    count = 0;

  const parser = csv({
    noheader: false,
  });
  let init = Date.now();

  readStream
    .pipe(parser)
    .on("data", async (data) => {
      data = JSON.parse(data);
      const row = {
        first_name: data.first_name,
        last_name: data.last_name,
        location:
          data.field4.split('geometry":')[1] +
          '", ' +
          data.field5 +
          ", " +
          data.field6,
      };

      const coordinates = JSON.parse(row.location);
      const residentPolygon = geoJSONtoWKT(coordinates);
      row.geog = residentPolygon;
      row.coordinates = coordinates;

      jsonData.push(row);
      count++;
      if (jsonData.length === batchSize) {
        console.log(jsonData.length, count, "total converted rows");

        let time1 = Date.now() - init;
        console.log(time1, "init data");
        init = Date.now();

        parser.pause();
        const residentsData = await getMoreDetails(jsonData);

        let time2 = Date.now() - init;
        console.log(time2, "getMoreDetails");
        init = Date.now();

        await insertIntoDatabase(residentsData);

        let time3 = Date.now() - init;
        console.log(time3, "insertIntoDatabase");
        init = Date.now();

        jsonData = [];

        parser.resume();
      }
    })
    .on("end", async () => {
      console.log("Conversion completed!");
    });
}

async function getMoreDetails(rows) {
  let residentsData = "";
  rows = rows.map((row, index) => {
    residentsData =
      residentsData +
      `, (${index}, ST_Multi(ST_GeomFromText('${row.geog}', 4326)))`;
    return { ...row, index };
  });

  residentsData = residentsData.substring(1);

  const query = `
    SELECT 
      rg.index, 
      s.id, 
      rg.geog
    FROM 
      (VALUES ${residentsData}) AS rg(index, geog)
      CROSS JOIN LATERAL (
        SELECT
          s.id
        FROM
          states s
        WHERE
          ST_Within(rg.geog, s.state_polygon)
        LIMIT 1
      ) s
  `;

  const state_ids = await db.any(query);

  return rows.map((row) => {
    const state = state_ids.find(({ index }) => index == row.index);
    return {
      ...row,
      state_id: state ? state.id : null,
    };
  });
}

async function insertIntoDatabase(rows) {
  try {
    console.log("insert individual to db started");
    try {
      const data = rows.map((row) => {
        return {
          first_name: row.first_name,
          last_name: row.last_name,
          geog: row.geog,
          coordinates: JSON.stringify(row.coordinates),
          state_id: row.state_id,
        };
      });

      const cs = new pgp.helpers.ColumnSet(
        [
          "first_name",
          "last_name",
          {
            name: "geog",
            mod: ":raw",
            init: (c) => `ST_Multi(ST_GeomFromText('${c.value}', 4326))`,
          },
          { name: "coordinates", cast: "json" },
          "state_id",
        ],
        { table: "residents" }
      );

      const insert = pgp.helpers.insert(data, cs);
      await db.none(insert);

      console.log(rows.length, "individual inserted");
    } catch (batchError) {
      throw batchError;
    }
    console.log("insertIntoDatabase done");
  } catch (err) {
    console.error("Error inserting data:", err);
  }
}

insertIndividuals(process.argv[2]);
