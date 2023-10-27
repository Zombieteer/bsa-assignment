const fs = require("fs");
const csv = require("csvtojson");
const db = require("../utils/db");
const geoJSONtoWKT = require("./convert");
const { Pool } = require("pg");

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

async function insertIndividuals(path) {
  const individualExists = await db.oneOrNone(
    `select 1 as exist from residents limit 1`
  );
  if (individualExists.exist) return;

  const readStream = fs.createReadStream(path);

  let jsonData = [],
    batchSize = 10000;

  const parser = csv({
    noheader: false,
  });

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
      row.state_id = null;

      console.log(jsonData.length, "total converted rows");
      jsonData.push(row);
      if (jsonData.length === batchSize) {
        parser.pause();
        await insertIntoDatabase(jsonData);
        jsonData = [];
        parser.resume();
      }
    })
    .on("end", async () => {
      // const residentsData = await getMoreDetails(jsonData);
      console.log("Conversion completed!");
    });
}

async function insertIntoDatabase(rows) {
  try {
    const client = await pool.connect();
    console.log("insert individual to db started");
    await client.query("BEGIN");
    try {
      const insertPromises = rows.map((row) => {
        const query = `
          INSERT INTO residents (first_name, last_name, geog, coordinates, state_id)
          VALUES 
          ($1, $2, ST_Multi(ST_GeomFromText($3,4326)),
          $4::jsonb, $5)
        `;
        const values = [
          row.first_name,
          row.last_name,
          row.geog,
          JSON.stringify(row.coordinates),
          row.state_id,
        ];
        return client.query(query, values);
      });

      await Promise.all(insertPromises);

      await client.query("COMMIT");
      console.log(rows.length, "individual inserted");
    } catch (batchError) {
      await client.query("ROLLBACK");
      throw batchError;
    }
    console.log("insertIntoDatabase done");
  } catch (err) {
    console.error("Error inserting data:", err);
  }
}

insertIndividuals(process.argv[2]);
