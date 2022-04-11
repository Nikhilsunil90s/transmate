import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Form, Input, Segment, Icon, Grid } from "semantic-ui-react";
import { FieldsColumn, FiltersColumn, Footer, ViewSettings } from "./components";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const ShipmentView = ({ ...props }) => {
  const { t } = useTranslation();
  const { state, updateState } = props;

  return (
    <>
      <div>
        <Form>
          <header className="view ui basic segment">
            <Icon name="filter" />
            <Input
              label={t("shipments.view.name")}
              value={state.name || ""}
              onChange={(_, { value }) => updateState({ name: value })}
            />

            <a className="button" href={generateRoutePath("shipments")}>
              <i className="icon-close" />
            </a>
          </header>
          <Segment padded="very" basic>
            <Grid columns={2} reversed="mobile" stackable>
              <Grid.Column>
                <FieldsColumn {...props} />
              </Grid.Column>
              <Grid.Column>
                <FiltersColumn {...props} />
                <ViewSettings {...props} />
              </Grid.Column>
            </Grid>
          </Segment>
        </Form>
      </div>
      <Footer {...props} {...props} />
    </>
  );
};

const ShipmentViewState = ({ view }) => {
  const viewObj = view || {};
  const [state, setState] = useState({
    filters: viewObj.filters || {},
    columns: viewObj.columns || [],
    name: viewObj.name || "",
    shipmentOverviewType: viewObj.shipmentOverviewType || "GBQ",
    isShared: !!viewObj.isShared
  });

  const updateState = update => {
    setState({ ...state, ...update });
  };

  const props = { view: viewObj, state, updateState };

  return <ShipmentView {...props} />;
};
export default ShipmentViewState;
