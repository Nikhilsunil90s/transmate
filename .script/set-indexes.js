const { MongoClient } = require("mongodb");

import { indexesToSetup } from "imports/api/_jsonSchemas/simple-schemas/indexes/indexes-grouped.js";

async function setIndexes(uri){
    const connection = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        sslValidate: false,
        poolSize: 5,
        connectTimeoutMS: 5000
      });
     
      
    for await(const index of indexesToSetup){
        console.log("index", index.collection, index.keys.join(","));
        try {
            await  connection.db()
              .collection(index.collection)
              .createIndex(index.keys, index.options);
          } catch (e) {
            console.warn(
              "index was already set for index ",
              index,
              "error:",
              e.message
            );
          }
    }
    await connection.close();
}

setIndexes(process.env.MONGO_URL)