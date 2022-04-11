import React, { useState, createRef } from "react";
import { Trans } from "react-i18next";
import { Icon, Breadcrumb, Header, Popup, Grid } from "semantic-ui-react";
import get from "lodash.get";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("shipments:header:view");

const ViewItem = ({ view = {}, onChangeView }) => (
  <a style={{ width: "max-content" }} onClick={() => onChangeView(view)} className="item view">
    {view.name}
  </a>
);

const ViewsList = ({ views = [], onChangeView }) => (
  <div style={{ maxHeight: 360, overflowY: "auto", paddingRight: 70 }} className="ui link list">
    {views.map((view = {}, index) => (
      <ViewItem key={index} view={view} onChangeView={onChangeView} />
    ))}
  </div>
);

const HeaderViewSelect = ({ sortedViews = {}, viewName, onChangeView, loading }) => {
  const contextRef = createRef();
  const { goRoute } = useRoute();
  const [visible, setVisible] = useState(false);
  const defaultView = get(sortedViews, ["globalViews", 0]);
  const setDefaultView = () => defaultView && onChangeView(defaultView);
  const selectView = view => {
    debug("select view:%o", view);

    onChangeView(view);
    setVisible(!visible);
  };
  const sections = [
    {
      key: "root",
      content: <Trans i18nKey="shipments.overview.title" />,
      link: true,
      onClick: () => setDefaultView()
    }, // sets to default view
    {
      key: "current",
      content: viewName,
      link: true,
      active: true,
      onClick: () => setVisible(!visible)
    }
  ];

  const { globalViews = [], myListViews = [], sharedViews = [] } = sortedViews;

  return (
    <div>
      <Popup
        flowing
        hoverable
        relaxed="true"
        on="click"
        position="bottom left"
        open={loading ? false : visible}
        context={contextRef}
      >
        <div>
          <Grid divided columns={3}>
            <Grid.Row>
              <Grid.Column>
                <Header as="h5">
                  <i className="ui blue globe icon" />
                  <Trans i18nKey="shipments.views.global" />
                </Header>

                <ViewsList views={globalViews} onChangeView={selectView} />
              </Grid.Column>

              <Grid.Column>
                <h5 className="ui header">
                  <i className="ui blue user outline icon" />
                  <Trans i18nKey="shipments.views.personal" />
                </h5>
                <ViewsList views={myListViews} onChangeView={selectView} />
              </Grid.Column>

              <Grid.Column>
                <h5 className="ui header">
                  <i className="ui blue share alternate icon" />
                  <Trans i18nKey="shipments.views.shared" />
                </h5>
                <ViewsList views={sharedViews} onChangeView={selectView} />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <div className="ui basic button view" onClick={() => goRoute("shipmentsView")}>
            <i className="add icon" />
            <Trans i18nKey="shipments.view.add" />
          </div>
        </div>
      </Popup>
      <span ref={contextRef}>
        <Icon name="filter" onClick={() => setVisible(!visible)} style={{ cursor: "pointer" }} />
        <Breadcrumb icon="right angle" sections={sections} />
      </span>
    </div>
  );
};

export default HeaderViewSelect;
