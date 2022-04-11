const collections = [];
const indexes = {};
db.getCollectionInfos().forEach(el => {
  if (el.type === "collection" && !el.name.includes("system.")) {
    collections.push(el.name);
    console.log("get indexes for ", el.name);
    const indexresult = db[el.name].getIndexes();
    // console.log("---indexes:", indexes);
    indexes[el.name] = indexresult.map(index => {
      const { key, ns, ...options } = index;

      const indexObj = {
        keys: key,
        options
      };
      if (options.name !== "_id_") {
        db.indexes.update(
          { collection: el.name, name: options.name },
          { $set: indexObj },
          {
            upsert: true
          }
        );
      }
    });
  }
});

db.indexes
  .find({})
  .projection({ _id: 0, collection: 1, keys: 1, options: 1 })
  .sort({ collection: 1, "options.name": 1 });
