export const deepDiffMapper = (function deepDiffMapper() {
  return {
    VALUE_CREATED: "created",
    VALUE_UPDATED: "updated",
    VALUE_DELETED: "deleted",
    VALUE_UNCHANGED: "unchanged",
    diff: {},
    updated: {},
    deleted: {},
    created: {},
    mapDiff(obj1, obj2) {
      this.diff = this.map(obj1, obj2);
      return this;
    },
    map(obj1, obj2, key) {
      const diff = {};
      if (this.isFunction(obj1) || this.isFunction(obj2)) {
        throw new Error("Invalid argument. Function given, object expected.");
      }

      if (this.isValue(obj1) || this.isValue(obj2)) {
        const type = this.compareValues(obj1, obj2);

        // sort out diffs:
        if (key && type === this.VALUE_UPDATED) {
          this.updated[key] = obj1 === undefined ? obj2 : obj1;
        }
        if (key && type === this.VALUE_DELETED) {
          this.deleted[key] = obj1 === undefined ? obj2 : obj1;
        }
        if (key && type === this.VALUE_CREATED) {
          this.created[key] = obj1 === undefined ? obj2 : obj1;
        }

        // return all difs:
        return {
          type,
          data: obj1 === undefined ? obj2 : obj1
        };
      }

      Object.keys(obj1).forEach(k => {
        if (this.isFunction(obj1[k])) {
          return;
        }

        let value2;
        if (obj2[k] !== undefined) {
          value2 = obj2[k];
        }

        diff[k] = this.map(obj1[k], value2, k);
      });

      Object.keys(obj2).forEach(k => {
        if (this.isFunction(obj2[k]) || diff[k] !== undefined) {
          return;
        }

        diff[k] = this.map(undefined, obj2[k], k);
      });

      return diff;
    },
    compareValues(value1, value2) {
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      if (
        this.isDate(value1) &&
        this.isDate(value2) &&
        value1.getTime() === value2.getTime()
      ) {
        return this.VALUE_UNCHANGED;
      }
      if (value1 === undefined) {
        return this.VALUE_CREATED;
      }
      if (value2 === undefined) {
        return this.VALUE_DELETED;
      }
      return this.VALUE_UPDATED;
    },
    isFunction(x) {
      return Object.prototype.toString.call(x) === "[object Function]";
    },
    isArray(x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    },
    isDate(x) {
      return Object.prototype.toString.call(x) === "[object Date]";
    },
    isObject(x) {
      return Object.prototype.toString.call(x) === "[object Object]";
    },
    isValue(x) {
      return !this.isObject(x) && !this.isArray(x);
    },
    get(k = "diff") {
      return this[k];
    }
  };
})();
