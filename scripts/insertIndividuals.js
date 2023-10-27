const fs = require("fs");
const csv = require("csvtojson");
const db = require("../utils/db");
const geoJSONtoWKT = require("./convert");
const { Pool } = require("pg");

const pool = new Pool({
  user: "bsa",
  host: "127.0.0.1",
  database: "bsadb",
  password: "bsa",
  port: 5432,
  max: 200,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function insertIndividuals(path) {
  const readStream = fs.createReadStream(path);

  let jsonData = [];

  readStream
    .pipe(csv())
    .on("data", (data) => {
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
    })
    .on("end", async () => {
      // const residentsData = await getMoreDetails(jsonData);
      await insertIntoDatabase(jsonData);
      console.log("Conversion completed!");
    });
}

async function insertIntoDatabase(rows) {
  try {
    const batchSize = 10000;
    const client = await pool.connect();
    console.log("insert individual to db started");
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      await client.query("BEGIN");
      try {
        const insertPromises = batch.map((row) => {
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
        console.log(i + batchSize, "individual inserted");
      } catch (batchError) {
        await client.query("ROLLBACK");
        throw batchError;
      }
    }
    console.log("insertIntoDatabase done");
  } catch (err) {
    console.error("Error inserting data:", err);
  }
}

insertIndividuals(process.argv[2]);
