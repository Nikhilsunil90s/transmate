let params = {};

module.exports = {
  FlowRouter: {
    url: () => "URL",
    path: () => "PATH",
    // path: (base, params = {}) => {
    //   return `/${base}/${params._id}`;
    // },
    go: () => {
      alert("flowrouter go");
    },
    getParam: key => params[key],
    setParams: newParams => {
      params = newParams;
      console.log({ params });
    },
    getQueryParam: () => {}
  }
};
