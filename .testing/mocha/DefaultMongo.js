const { MongoClient, ObjectID } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const debug = require("debug")("mongo:directConnect");
// Connection URI

const { commonKeys } = require("./schema-checks");

let mongoServer;

async function startMongo() {
  mongoServer = new MongoMemoryServer();
  const uri = await mongoServer.getUri();
  const check = mongoServer.getInstanceInfo();
  if (!check) throw Error("no db available!");

  return uri;
}

// Create a new MongoClient
let connection;

//store unique ids
let uniqueIds = [];
export const resetIds = () => {
  console.log("reset ids");
  uniqueIds = [];
};

export function createId(charsCount = 17, reset) {
  var UNMISTAKABLE_CHARS =
    "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz";
  var loops = 0;
  var id = "";

  if (
    !isNaN(parseFloat(charsCount)) &&
    isFinite(charsCount) &&
    charsCount > 0
  ) {
    //"Is a number"
  } else {
    charsCount = 6;
  }
  do {
    loops++;
    if (loops > 1) {
      console.log("duplicate issue, new id " + id + " after loops : ", loops);
    }
    id = "";
    // code block for random Id generation
    for (var i = 0; i < charsCount; i++) {
      id += UNMISTAKABLE_CHARS.charAt(
        Math.floor(Math.random() * UNMISTAKABLE_CHARS.length)
      );
    }
    //check if id exists already
  } while (uniqueIds.indexOf(id) > -1 && loops > 1000);
  if (loops > 1000) {
    throw Error("not able to find a good unique id");
  }
  uniqueIds.push(id);
  return id;
}

function cleanOptions(option) {
  if (option && option.fields) {
    option.projection = option.fields;
    delete option.fields;
  }
}

export async function connect() {
  try {
    if (connection) return connection;

    // Connect the client to the server
    console.log("try to connect to mongo");
    let uri;
    if (process.env.MONGO_URL) {
      console.log("connect with existing env URI!");
      // mongo uri given, use this
      uri = process.env.MONGO_URL;
    } else {
      // no mongo uri given , lets start temp db
      uri = await startMongo();
      process.env.MONGO_URL = uri;
      process.env.TEMP_DB = true;
      console.log("mongo server started! on uri ", uri);
    }
    connection = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      sslValidate: false,
      poolSize: 5,
      connectTimeoutMS: 5000
    });

    // Establish and verify connection
    await connection.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");
    connection.on("close", function() {
      console.log("mongo closing");
      connection = null;
    });
    return connection;
  } catch (e) {
    // Ensures that the client will close when you finish/error
    console.error("ERROR: close mongo connection", e.message);
    await connection.close();
    connection = null;
    throw e;
  }
}

export async function getCollection(collection) {
  return connection.db().collection(collection);
}

export async function disConnect() {
  try {
    if (connection) {
      console.log("connection exist! close...");
      await connection.close();
    }

    if (process.env.TEMP_DB) {
      console.log("stop mongo server");
      await mongoServer.stop();
    }
    delete process.env.TEMP_DB;
    connection = null;
    return true;
  } catch (e) {
    console.error("connection close ERROR", e);
    console.log("connection did not exist");

    return true;
  }
}

class Collection {
  constructor(collectionName) {
    this.collectionName = collectionName;
    // debug("connect to :", collectionName);
    this.before = {
      insert: () => {},
      update: () => {},
      upsert: () => {}
    };
    this.after = {
      insert: () => {},
      update: () => {},
      upsert: () => {}
    };
  }
  rawDatabase() {
    return connection.db();
  }
  rawCollection() {
    return connection.db().collection(this.collectionName);
  }
  attachSchema(schema) {
    debug("attach schema to ", this.collectionName);
    this.schema = schema.extend(commonKeys);
  }
  async insert(data) {
    // if array insert many
    if (Array.isArray(data)) {
      throw Error(
        "meteor only allows insert of 1 document, not array. Use rawCollection if needed!"
      );
    }
    if (this.schema) {
      const validator = this.schema
        .extend({ _id: { type: String, optional: true } })
        .newContext();

      validator.validate(data, { modifier: false });
      if (!validator.isValid()) {
        console.warn(
          "WARNING:",
          this.collectionName,
          "schema warning on insert",
          validator.validationErrors()
        );
      }
    }
    // if(this.schema){
    //   const validation =this.schema.validate(data)
    //   if(!validation){
    //     console.error(validation.invalidKeys());
    //     throw Error("schema not valid")}
    // }
    await connect();

    if (typeof data === "object" && !data._id) {
      data._id = createId();
    }
    const res = await connection
      .db()
      .collection(this.collectionName)
      .insertOne(data);

    return res.insertedId;
  }

  async insertOne() {
    throw Error("insertOne is not allowed on collection, use rawCollection!");
  }

  async insertMany() {
    throw Error("insertOne is not allowed on collection, use rawCollection!");
  }

  async findOne(query, options) {
    cleanOptions(options);
    debug(
      "findOne on %o , query %o , options %o",
      this.collectionName,
      query,
      options
    );
    await connect();
    if (typeof query === "string") query = { _id: query };
    const result = await connection
      .db()
      .collection(this.collectionName)
      .findOne(query, options);
    // debug("result find one %o", result);
    debug("result found in %s id: %o", this.collectionName, (result || {})._id);
    // check schema on objects before any actions are done
    if (this.schema) {
      try {
        const objToValidate = { ...result };
        delete objToValidate._id;
        this.schema.validate(objToValidate);
      } catch (e) {
        // console.warn(
        //   "WARNING:",
        //   this.collectionName,
        //   "schema warning on returned obj",
        //   (result || {})._id,
        //   e.message
        // );
      }
    }

    return result;
  }

  async first() {
    throw Error("first is not allowed on collection, only on model!");
  }

  async find(query, options) {
    cleanOptions(options);
    //debug("find options", options)

    await connect();
    // return cursor
    if (typeof query === "string") query = { _id: query };
    const cursor = await connection
      .db()
      .collection(this.collectionName)
      .find(query, options);
    cursor.fetch = async () => {
      const docs = await cursor.toArray();
      if (options && typeof options.transform === "function")
        return docs.map(doc => options.transform(doc));
      return docs;
    };

    cursor.countDocs = async () => {
      const count = await cursor.count();
      return count;
    };
    // remove functions that meteor does not project
    delete cursor.hasNext;
    delete cursor.next;
    return cursor;
  }

  async where(query, options) {
    cleanOptions(options);
    if (typeof query === "string") query = { _id: query };
    await connect();
    // return data
    const result = await connection
      .db()
      .collection(this.collectionName)
      .find(query, options)
      .toArray();

    return result;
  }

  async count(query) {
    await connect();
    // return data
    const result = await connection
      .db()
      .collection(this.collectionName)
      .find(query)
      .count();

    return result;
  }
  async update(query, update, options) {
    cleanOptions(options);
    if (typeof query === "string") query = { _id: query };
    if (this.schema) {
      try {
        this.schema.validate(update, { modifier: true });
      } catch (e) {
        console.warn(
          "WARNING:",
          this.collectionName,
          "schema warning on update",
          JSON.stringify(query),
          e.message
        );
      }
    }
    await connect();
    return connection
      .db()
      .collection(this.collectionName)
      .updateMany(query, update, options);
  }
  upsert(query, update, options = {}) {
    return this.update(query, update, { ...options, upsert: true });
  }
  async updateOne() {
    throw Error("use 'update' not 'updateOne', it is not suported in meteor");
  }

  async updateMany() {
    throw Error("use 'update' not 'updateMany', it is not suported in meteor");
  }

  async push(query, update, options) {
    cleanOptions(options);
    debug("mongo push called %0", update);
    console.log(update);
    if (typeof query === "string") query = { _id: query };
    await connect();
    return connection
      .db()
      .collection(this.collectionName)
      .updateMany(query, { $push: update }, options);
  }

  async remove(query) {
    if (typeof query === "string") query = { _id: query };
    await connect();
    return connection
      .db()
      .collection(this.collectionName)
      .deleteMany(query);
  }

  async aggregate(pipeline, options) {
    await connect();
    if (!Array.isArray(pipeline))
      throw Error("aggregation should be an array!");
    const cursor = connection
      .db()
      .collection(this.collectionName)
      .aggregate(pipeline, options)
      .toArray();

    return cursor;
  }
  async createIndex(...args) {
    return connection
      .db()
      .collection(this.collectionName)
      .createIndex.apply(null, args);
  }
}

const Mongo = {
  Collection,
  ObjectID
};

export { Mongo };
