/* eslint-disable camelcase */
/* eslint-disable no-cond-assign */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import { detailedDiff } from "deep-object-diff";

const debug = require("debug")("db:model");
const hash = require("object-hash");

function isPromise(value) {
  return Boolean(value && typeof value.then === "function");
}

const setByAt = userId => {
  return { by: userId || "server", at: new Date() };
};

export default class Model {
  constructor(attr = {}, parent = null, isNew = true) {
    this.__is_new = !!isNew;
    if (attr._id) {
      this.id = attr._id;
    }
    Object.assign(this, attr);
  }

  static create(attr, callback) {
    let doc;

    if (this.before_create) {
      attr = this.before_create(attr);
    }
    doc = this.init(attr, null, true);
    if (callback != null) {
      doc.save(attr, (e, r) => {
        if (e) {
          return callback(e, null);
        }
        if (typeof this.after_create === "function") {
          this.after_create(doc);
        }
        return callback(e, doc);
      });
      return null;
    }
    doc = doc.save(attr);
    if (doc) {
      if (typeof this.after_create === "function") {
        this.after_create(doc);
      }
    }
    return doc;
  }

  /**
   * @param {Object} attr
   * @param {{userId: string, accountId: string}} context
   * @param {Function} callback
   * @returns
   */
  static async create_async(attr, context, callback) {
    let doc;
    if (!attr.created) {
      attr.created = {
        by: (context || {}).userId || "server",
        at: new Date()
      };
    }

    if (this.before_create_async) {
      attr = this.before_create_async(attr, context);
    } else if (this.before_create) {
      attr = this.before_create(attr, context);
    }
    doc = this.init(attr, null, true);
    if (callback != null) {
      doc.save_async(attr, (e, r) => {
        if (e) {
          return callback(e, null);
        }
        if (typeof this.after_create === "function") {
          this.after_create(doc, context);
        }
        return callback(e, doc);
      });
      return null;
    }

    // without callback
    doc = await doc.save_async(attr);
    if (doc) {
      if (typeof this.after_create === "function") {
        await this.after_create(doc, context);
      }
    }
    return doc;
  }

  static init(attr, parent = null, isNew = false) {
    return new this(attr, parent, isNew);
  }

  static where(selector = {}, options = {}) {
    const find = this.find(selector, options);
    if (typeof find.fetch === "function") {
      return find.fetch();
    }

    // std mongo, for await functions
    return find.then(cursor => cursor.fetch());
  }

  // static async where(selector = {}, options = {}) {
  //   debug("where called for %o", selector);
  //   const cursor = await this.find(selector, options);
  //   return cursor.fetch();
  // }

  static first(selector = {}, options = {}) {
    // fibers
    const doc = this._collection.findOne(selector, options);
    if (!isPromise(doc)) {
      // return init doc when obj is found
      return doc && this.init(doc);
    }

    // call promise for await functions
    return doc.then(obj => obj && this.init(obj));
  }

  static async findOne(selector = {}, options = {}) {
    const doc = await this._collection.findOne(selector, options);
    return doc && this.init(doc);
  }

  static aggregate(pipeline, options) {
    return this._collection.aggregate(pipeline, options);
  }

  static async aggregateWithBuffer(
    pipeline = [],
    options = {
      allowDiskUse: true
    }
  ) {
    const rawDB = this._collection.rawDatabase();

    // check for collection + each lookup if collection has changed!

    const collections = {};
    collections[this._collection._name] = true;
    pipeline.forEach(step => {
      if (step.$lookup) {
        collections[step.$lookup.from] = true;
      }
    });

    const atms = await Promise.all(
      Object.keys(collections).map(collectionName =>
        rawDB.collection(collectionName).findOne(
          {},
          {
            fields: { _id: 0, "updated.at": 1 },
            sort: { "updated.at": -1 }
          }
        )
      )
    );
    const lastAtms = Math.max(
      ...atms.map(timestamp => {
        try {
          return timestamp.updated.at.getTime();
        } catch {
          return 0;
        }
      })
    );
    const key = {
      collection: this._collection._name,
      pipeline,
      lastAtms
    };
    const hashedKey = hash(key);
    const obj = await rawDB
      .collection("buffer")
      .findOne({ _id: hashedKey }, { fields: { result: 1 } });
    debug("obj returned from buffer %o", obj);
    if (obj && obj.result) {
      return obj.result;
    }

    debug(
      "we should check atms on  %o",
      collections,
      atms,
      lastAtms,
      hashedKey
    );
    debug("mongo aggregation with %d steps!", pipeline.length);
    const start = new Date();
    const result = await this._collection.aggregate(pipeline, options);
    const end = new Date() - start;
    await rawDB.collection("buffer").updateOne(
      {
        _id: hashedKey
      },
      {
        $set: {
          collection: this._collection._name,
          result,
          lastAtms,
          duration: end / 1000,
          pipeline: `db.getCollection('${
            this._collection._name
          }').aggregate( ${JSON.stringify(pipeline)} ) `
        }
      },
      {
        upsert: true
      }
    );
    return result;
  }

  static all(options = {}) {
    return this.where({}, options);
  }

  static check(id) {
    const options = { fields: { id: 1 } };
    return this.first(id, options);
  }

  static find(selector = {}, options = {}) {
    const self = this;

    // Transform all docs in the collection to be an instance of our model
    if (!options.transform) {
      options.transform = doc => {
        return this.init(doc);
      };
    }
    return this._collection.find(selector, options);
  }

  static storeChanges(collection) {
    // we need "this"
    const collectionName = this._collection._name;
    // eslint-disable-next-line func-names
    collection.after.update(function(userId, doc, fieldNames, modifier) {
      // debug("update detected %o , previous %o", doc, this.previous);
      const changes = detailedDiff(this.previous, doc);
      debug(
        "changes to collecton %s , update %j by user %s modifier %j",
        collectionName,
        changes,
        userId,
        modifier
      );

      // we don't want meteor to create ids as this slows down the process and we loose created dt in mongo
      const rawDB = collection.rawDatabase();

      // async but we don't wait...
      rawDB.collection("logs.changes").insertOne({
        collection: collectionName,
        docId: doc._id,
        changes,
        userId,
        modifier: JSON.stringify(modifier),
        created: setByAt(userId)
      });
    });
    return collection;
  }

  static updateByAt(collection) {
    collection.before.insert((userId, obj) => {
      if (obj && !obj.updated) {
        obj.updated = setByAt(userId);
      }
      if (obj && !obj.created) {
        obj.created = setByAt(userId);
      }
      if (obj && !obj.deleted) {
        obj.deleted = false;
      }
    });
    collection.before.update((userId, obj, fieldNames, modifier, options) => {
      modifier.$set = modifier.$set || {};
      modifier.$set.updated = setByAt(userId);
    });
    collection.before.upsert((userId, selector, modifier, options) => {
      modifier.$set = modifier.$set || {};
      modifier.$set.updated = setByAt(userId);
    });
    return collection;
  }

  static count(selector = {}, options = {}) {
    const find = this.find(selector, options);
    if (typeof find.count === "function") {
      return find.count();
    }

    // std mongo, for await functions
    return find.then(cursor => cursor.countDocs());
  }

  getId() {
    if (this.id && !this._id) this._id = this.id;
    if (!this._id) throw Error("missing _id in class");
    return this._id;
  }

  isNew() {
    return this.__is_new;
  }

  update(attr = {}, callback) {
    return this.save(attr, callback);
  }

  async update_async(attr = {}, callback) {
    return this.save_async(attr, callback);
  }

  save(attr = {}, callback) {
    Object.assign(this, attr);
    if (this.constructor.before_save) {
      attr = this.constructor.before_save(attr, this.id);
    }

    if (callback != null) {
      if (this.isNew()) {
        this.constructor._collection.insert(attr, (error, result) => {
          if (error == null) {
            this.id = result;
            this._id = this.id;
            this.__is_new = false;
            if (this.constructor.after_save) {
              this.constructor.after_save(this);
            }
          }
          return callback(error, result);
        });
      } else {
        this.constructor._collection.update(
          this.id,
          {
            $set: attr
          },
          (error, result) => {
            if (error == null) {
              if (this.constructor.after_save) {
                this.constructor.after_save(this);
              }
            }
            return callback(error, result);
          }
        );
      }
      return null;
    }
    if (this.isNew()) {
      this.id = this.constructor._collection.insert(attr);
      this._id = this.id;
      this.__is_new = false;
    } else {
      this.constructor._collection.update(this.id, {
        $set: attr
      });
    }
    if (this.constructor.after_save) {
      this.constructor.after_save(this);
    }
    return this;
  }

  async save_async(attr = {}, callback) {
    Object.assign(this, attr);
    if (this.constructor.before_save) {
      attr = await this.constructor.before_save(attr, this.id);
    }

    if (callback != null) {
      if (this.isNew()) {
        await this.constructor._collection.insert(attr, (error, result) => {
          if (error == null) {
            this.id = result;
            this._id = this.id;
            this.__is_new = false;
            if (this.constructor.after_save) {
              this.constructor.after_save(this);
            }
          }
          return callback(error, result);
        });
      } else {
        await this.constructor._collection.update(
          this.id,
          { $set: attr },
          (error, result) => {
            if (error == null) {
              if (this.constructor.after_save) {
                this.constructor.after_save(this);
              }
            }
            return callback(error, result);
          }
        );
      }
      return null;
    }
    if (this.isNew()) {
      this.id = await this.constructor._collection.insert(attr);
      this._id = this.id;
      this.__is_new = false;
    } else {
      await this.constructor._collection.update(this.id, {
        $set: attr
      });
    }
    if (this.constructor.after_save) {
      this.constructor.after_save(this);
    }
    if (this.constructor.after_save_async) {
      await this.constructor.after_save_async(this);
    }
    return this;
  }

  reload(options) {
    let doc;
    const self = this;
    if (
      this.id != null &&
      (doc = this.constructor._collection.findOne(this.id, options))
    ) {
      if (!isPromise(doc)) {
        return Object.assign(this, doc);
      }
      return doc.then(obj => Object.assign(self, obj));
    }
  }

  updateHistory(action, userId = "server") {
    return this.push({
      updates: {
        action,
        userId,
        ts: new Date()
      }
    });
  }

  push(data, unique = true) {
    const operator = unique ? "$addToSet" : "$push";

    const self = this;

    const result = this.constructor._collection.update(this.id, {
      [`${operator}`]: data
    });
    if (!isPromise(result)) {
      // return init doc when obj is found
      return this.reload();
    }

    //
    return result.then(() => self.reload());
  }

  pull(data) {
    this.constructor._collection.update(this.id, {
      $pull: data
    });
    return this.reload();
  }

  async pull_async(data) {
    await this.constructor._collection.update(this.id, {
      $pull: data
    });
    return this.reload();
  }

  del(field) {
    this.constructor._collection.update(this.id, {
      $unset: {
        [`${field}`]: ""
      }
    });
    return delete this[field];
  }

  async del_async(field) {
    await this.constructor._collection.update(this.id, {
      $unset: { [`${field}`]: "" }
    });
    return delete this[field];
  }

  destroy(callback) {
    if (this.id != null) {
      this.constructor._collection.remove(this.id, callback);
      this.id = null;
      this._id = null;
    }
  }

  async destroy_async(callback) {
    if (this.id != null) {
      await this.constructor._collection.remove(this.id, callback);
      this.id = null;
      this._id = null;
    }
  }

  deleteFlag(callback) {
    if (this.id != null) {
      this.updateHistory("deleted");
      return this.save(
        {
          deleted: true
        },
        callback
      );
    }
  }
}
