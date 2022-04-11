/* eslint-disable react/no-unused-state */
import React, { Component } from "react";

// see https://www.ag-grid.com/javascript-grid-header-rendering/#header-group-component

export class PriceListGridSheetHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ascSort: "inactive",
      descSort: "inactive",
      noSort: "inactive"
    };

    this.headerRef = React.createRef();
  }

  componentDidMount() {
    // const node = findDOMNode(findDOMNode(this).parentNode);

    // node.style.cssText = "background-color:red; width: 100%; height: 100%;";
    this.props.reactContainer.style.cssText = "width: 100%; height: 100%;";

    // why can not get the more parent Node
    this.props.reactContainer.oncontextmenu = this.onContextMenu.bind(this);
  }

  onContextMenu = event => {
    event.preventDefault();
    const { api, column } = this.props;

    if (column.colId === "0") {
      // left top header need not context menu?
      return;
    }
    api.showColumnMenuAfterMouseClick(column, event);
  };

  render() {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <div className="customHeaderLabel">{this.props.displayName}</div>
      </div>
    );
  }
}
