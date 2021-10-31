const { MongoClient } = require('mongodb');
const dbutils = require('./db-utils.js');

class Mongo {
  constructor(options) {
    return (async () => {
      // Connection URL
      const url = 'mongodb://localhost:27017';
      this.client = new MongoClient(url);

      // Database Name
      const dbName = 'jackson';

      await this.client.connect();
      this.db = this.client.db(dbName);
      this.collection = this.db.collection('jacksonStore');

      await this.collection.createIndex({ indexes: 1 });

      return this;
    })();
  }

  async get(namespace, key) {
    let res = await this.collection.findOne({
      _id: dbutils.key(namespace, key),
    });
    if (res && res.value) {
      return JSON.parse(res.value);
    }

    return null;
  }

  async getByIndex(namespace, idx) {
    const docs = await this.collection
      .find({
        indexes: dbutils.keyForIndex(namespace, idx),
      })
      .toArray();

    const ret = [];
    for (const doc of docs || []) {
      ret.push(JSON.parse(doc.value));
    }

    return ret;
  }

  async put(namespace, key, val, ttl = 0, ...indexes) {
    const doc = {
      value: JSON.stringify(val),
    };

    // TODO: support ttl
    // if (ttl) {
    // }

    // no ttl support for secondary indexes
    for (const idx of indexes || []) {
      const idxKey = dbutils.keyForIndex(namespace, idx);

      if (!doc.indexes) {
        doc.indexes = [];
      }

      doc.indexes.push(idxKey);
    }

    await this.collection.updateOne(
      { _id: dbutils.key(namespace, key) },
      {
        $set: doc,
      },
      { upsert: true }
    );
  }

  async delete(namespace, key) {
    return await this.collection.deleteOne({
      _id: dbutils.key(namespace, key),
    });
  }
}

module.exports = {
  new: async (options) => {
    return new Mongo(options);
  },
};
