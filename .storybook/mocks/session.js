module.exports = {
  Session: {
    set: (key, value) => sessionStorage.setItem(key, value),
    get: key => sessionStorage.getItem(key)
  }
};
