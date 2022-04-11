import React, { Component } from "react";
import throttle from "lodash/throttle";
import "react-awesome-query-builder/lib/css/styles.css";
import "react-awesome-query-builder/lib/css/compact_styles.css"; // optional, for more compact styles
import {
  Query,
  Builder,
  BasicConfig,
  Utils as QbUtils
} from "react-awesome-query-builder";
import PageHolder from "/imports/client/components/utilities/PageHolder";

const debug = require("debug")("querybuilder:demo");

export default {
  title: "Components/Query-Builder"
};

// You need to provide your own config. See below 'Config format'
const demoConfig = {
  fields: {
    qty: {
      label: "Qty",
      type: "number",
      fieldSettings: {
        min: 0
      },
      valueSources: ["value"],
      preferWidgets: ["number"]
    },
    price: {
      label: "Price",
      type: "number",
      valueSources: ["value"],
      fieldSettings: {
        min: 10,
        max: 100
      },
      preferWidgets: ["slider", "rangeslider"]
    },
    color: {
      label: "Color",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" }
        ]
      }
    },
    is_promotion: {
      label: "Promo?",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"]
    }
  }
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue = { id: QbUtils.uuid(), type: "group" };

class DemoQueryBuilder extends Component {
  updateResult = throttle(() => {
    debug("updateResult");
    this.setState({ tree: this.immutableTree, config: this.config });
  }, 200);

  constructor(props) {
    super(props);
    const config = { ...BasicConfig, ...props.config };
    this.state = {
      tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
      config
    };
  }

  // state = {
  //   tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
  //   config
  // };

  render = () => {
    const { config, tree } = this.state;

    return (
      <div>
        <h2>add filters</h2>
        <Query
          {...config}
          value={tree}
          onChange={this.onChange}
          renderBuilder={this.renderBuilder}
        />
        {this.renderResult(this.state)}
      </div>
    );
  };

  renderBuilder = props => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  );

  renderResult = ({ tree: immutableTree, config }) => (
    <div className="query-builder-result">
      <div>
        Query string:{" "}
        <pre>{JSON.stringify(QbUtils.queryString(immutableTree, config))}</pre>
      </div>
      <div>
        MongoDb query:{" "}
        <pre>
          {JSON.stringify(QbUtils.mongodbFormat(immutableTree, config))}
        </pre>
      </div>
      <div>
        SQL where:{" "}
        <pre>{JSON.stringify(QbUtils.sqlFormat(immutableTree, config))}</pre>
      </div>
      <div>
        JsonLogic:{" "}
        <pre>
          {JSON.stringify(QbUtils.jsonLogicFormat(immutableTree, config))}
        </pre>
      </div>
    </div>
  );

  onChange = (immutableTree, config) => {
    // Tip: for better performance you can apply `throttle` - see `examples/demo`
    debug("change detected %s", QbUtils.queryString(immutableTree, config));
    this.immutableTree = immutableTree;
    this.config = config;
    this.updateResult();

    // this.setState({ tree: immutableTree, config });

    // const jsonTree = QbUtils.getTree(immutableTree);

    // debug("onchange %o", jsonTree);

    // `jsonTree` can be saved to backend, and later loaded to `queryValue`
  };
}

// as part of a uniforms:
export const demo = () => {
  const props = { config: demoConfig };
  return (
    <PageHolder main="ReportFilter">
      <DemoQueryBuilder {...props} />
    </PageHolder>
  );
};
