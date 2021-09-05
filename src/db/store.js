class Store {
  constructor(namespace, db, ttl = 0) {
    this.namespace = namespace;
    this.db = db;
    this.ttl = ttl;
  }

  async get(key) {
    return this.db._get(this.namespace, key);
  }

  async getByIndex(idx) {
    return this.db._getByIndex(this.namespace, idx);
  }

  async put(key, val, ...indexes) {
    this.db._put(this.namespace, key, val, this.ttl, ...indexes);
  }
}

const key = (namespace, key) => {
  return namespace + ':' + key;
};

const keyForIndex = (namespace, idx) => {
  return key(key(namespace, idx.name), idx.value);
};

module.exports = {
  new: (namespace, db, ttl = 0) => {
    return new Store(namespace, db, ttl);
  },
  key,
  keyForIndex,
};
