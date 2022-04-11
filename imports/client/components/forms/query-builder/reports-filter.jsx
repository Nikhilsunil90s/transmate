/* eslint-disable react/no-unused-state */
import React, { Component } from "react";
import throttle from "lodash/throttle";
import "react-awesome-query-builder/lib/css/styles.css";
import "react-awesome-query-builder/lib/css/compact_styles.css"; // optional, for more compact styles
import { Query, Builder, BasicConfig, Utils as QbUtils } from "react-awesome-query-builder";
import moment from "moment";

const hash = require("object-hash");
const debug = require("debug")("report-filter:query-builder");

// fix config for sql dates
const widgets = {
  ...BasicConfig.widgets,
  date: {
    ...BasicConfig.widgets.date,
    valueFormat: '"YYYYMMDDHHmm"',
    operators: ["greater", "less", "between"],
    sqlFormatValue: (val, _fieldDef, _wgtDef) => {
      debug("sqlFormatValue", val, _fieldDef, _wgtDef);
      return moment(val).format(_wgtDef.valueFormat);
    }
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    valueFormat: '"YYYYMMDDHHmm"',
    sqlFormatValue: (val, _fieldDef, _wgtDef) => {
      debug("sqlFormatValue", val, _fieldDef, _wgtDef);
      return moment(val).format(_wgtDef.valueFormat);
    }
  }
};

const queryValue = { id: QbUtils.uuid(), type: "group" };
const getQuerySetup = fields => {
  debug("getQuerySetup with fields %o", fields);

  // copy fields to avoid immutable issue
  const config = { ...BasicConfig, widgets, fields: JSON.parse(JSON.stringify(fields)) };
  const tree = QbUtils.checkTree(QbUtils.loadTree(queryValue), config);

  return { tree, config };
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)

class QueryBuilder extends Component {
  updateResult = throttle(() => {
    // don't update immediatly wait a little
    debug("updateResult", this);
    this.setState({
      tree: this.immutableTree || this.tree,
      config: this.config,
      fields: this.fields
    });
    this.setFilter(QbUtils.sqlFormat(this.immutableTree, this.config));
  }, 200);

  constructor(props) {
    super(props);
    debug("set config", props);
    this.fields = props.fields;
    const { config, tree } = getQuerySetup(this.fields);

    this.setFilter = props.setFilter;
    this.state = {
      fields: this.fields,
      tree,
      config
    };
  }

  componentDidUpdate(prevProps) {
    const { fields } = this.props;
    debug("componentDidUpdate", prevProps.fields, fields);
    if (hash(prevProps.fields) !== hash(fields)) {
      debug("fields changed!");
      const { config, tree } = getQuerySetup(fields);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ fields, tree, config });

      // to do relad fields
    }
  }

  render = () => {
    debug("render");
    const { config, tree } = this.state || {};

    return (
      <div>
        <h2>add filters</h2>
        <Query
          {...config}
          value={tree}
          onChange={this.onChange}
          renderBuilder={this.renderBuilder}
        />
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

  onChange = (immutableTree, config) => {
    // Tip: for better performance you can apply `throttle` - see `examples/demo`
    debug("change detected %o", QbUtils.queryString(immutableTree, config));
    this.immutableTree = immutableTree;
    this.config = config;
    this.updateResult();

    // this.setState({ tree: immutableTree, config });

    // const jsonTree = QbUtils.getTree(immutableTree);

    // debug("onchange %o", jsonTree);

    // `jsonTree` can be saved to backend, and later loaded to `queryValue`
  };
}

export const BuildFilter = ({ fields, output, setFilter, ...props }) => {
  debug("build filter with ", fields, output, props);

  return <QueryBuilder fields={fields} output={output} setFilter={setFilter} />;
};
