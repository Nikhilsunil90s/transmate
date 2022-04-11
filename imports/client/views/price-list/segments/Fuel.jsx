import React from "react";
import { Trans } from "react-i18next";
import { useQuery, gql, useMutation } from "@apollo/client";
import { Segment, Form, Input, Dropdown, Grid, Icon } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import { GET_MY_FUEL_INDEXES, GET_FUEL_INDEX, UPDATE_FUEL_INDEX } from "../utils/queries";
import Loader from "/imports/client/components/utilities/Loader.jsx";

const debug = require("debug")("priceList:fuel");

const GET_FUEL_NAME = gql`
  query getFuelIndexForTagInPriceList($fuelIndexId: String!) {
    fuelIndex: getFuelIndex(fuelIndexId: $fuelIndexId) {
      id
      name
    }
  }
`;

/** @param {{fuelIndexId: string}} param0 */
const FuelTag = ({ fuelIndexId }) => {
  const { data, loading, error } = useQuery(GET_FUEL_NAME, {
    variables: { fuelIndexId },
    fetchPolicy: "cache-only"
  });

  debug("fuel tag", { data, loading, error });

  const name = data?.fuelIndex?.name;

  return name || <Trans i18nKey="price.list.fuel.index.empty" />;
};

const FuelPeriods = ({ periods }) => {
  return (
    <>
      <h3>
        <Trans i18nKey="price.list.fuel.index.periods" />
      </h3>
      <ReactTable
        columns={[
          {
            id: "period",
            Header: <Trans i18nKey="settings.fuel.period.period" />,
            Cell: ({ row: { original: period } }) => `${period.month}/${period.year}`
          },
          { id: "fuel", Header: <Trans i18nKey="settings.fuel.period.fuel" />, accessor: "fuel" },
          {
            id: "index",
            Header: <Trans i18nKey="settings.fuel.period.index" />,
            accessor: "index"
          }
        ]}
        data={periods}
      />
    </>
  );
};

const FuelDetail = ({ fuelIndexId }) => {
  const { data = {}, loading, error } = useQuery(GET_FUEL_INDEX, {
    variables: { fuelIndexId }
  });
  if (error) console.error(error);

  const fuel = data.fuelIndex || {};
  debug(fuel);
  const basePeriod = fuel.base
    ? `${String(fuel.base?.month || "").padStart(2, "0")}/${String(fuel.base?.year) || " - "}`
    : " - ";
  const lastIndexPeriod = (fuel.periods || []).slice(-1)[0];
  debug(lastIndexPeriod);
  return (
    <>
      <Loader loading={loading} />
      <Form>
        <Form.Group>
          <Form.Field
            width={3}
            content={
              <>
                <label>
                  <Trans i18nKey="settings.fuel.index.base" />
                </label>
                <Input type="number" value={fuel.base?.rate} disabled label="€" />
              </>
            }
          />
          <Form.Field
            width={3}
            content={
              <>
                <label>
                  <Trans i18nKey="settings.fuel.index.basePeriod" />
                </label>
                <Input value={basePeriod} disabled />
              </>
            }
          />
          {lastIndexPeriod ? (
            <>
              <Form.Field
                width={3}
                content={
                  <>
                    <label>
                      <Trans i18nKey="settings.fuel.period.index" />
                    </label>
                    <Input type="number" value={lastIndexPeriod.index} disabled />
                  </>
                }
                label="%"
              />
              <Form.Field
                width={3}
                content={
                  <>
                    <label>
                      <Trans i18nKey="settings.fuel.period.fuel" />
                    </label>
                    <Input type="number" value={lastIndexPeriod.fuel} disabled />
                  </>
                }
                label="%"
              />
              <Form.Field
                width={3}
                content={
                  <>
                    <label>
                      <Trans i18nKey="settings.fuel.period.period" />
                    </label>
                    <span>
                      {lastIndexPeriod.year} / {lastIndexPeriod.month}
                    </span>
                  </>
                }
              />
            </>
          ) : (
            <Form.Field
              width={3}
              content={
                <>
                  <label>
                    <Trans i18nKey="settings.fuel.period.index" />
                  </label>
                  <Trans i18nKey="settings.fuel.period.empty" />
                </>
              }
            />
          )}
        </Form.Group>

        {fuel.description && (
          <>
            <h3>
              <Trans i18nKey="price.list.fuel.index.description" />
            </h3>
            <Segment>
              <span style={{ whiteSpace: "pre-wrap" }}>{fuel.description}</span>
            </Segment>
          </>
        )}
        {fuel.periods && <FuelPeriods periods={fuel.periods} />}
      </Form>
    </>
  );
};

const PriceListFuelSection = ({ ...props }) => {
  const { security = {}, priceList = {}, priceListId } = props;
  const [updateFuelIndex, { loading: isLoadingMutation }] = useMutation(UPDATE_FUEL_INDEX);

  // get all indexes fuel data for dropdown
  const { data = {}, loading, error } = useQuery(GET_MY_FUEL_INDEXES);
  if (error) console.error(error);

  const allIndex = data.fuelIndexes || [];

  function saveFuelIndex(newFuelIndexId) {
    updateFuelIndex({ variables: { priceListId, fuelIndexId: newFuelIndexId } });
  }

  return (
    <Segment padded="very" className="fuel">
      <Form>
        <Grid verticalAlign="bottom">
          <Grid.Row>
            <Grid.Column width={4}>
              <Form.Field>
                <label>
                  <Trans i18nKey="price.list.fuel.index.name" />
                </label>
                <div>
                  {security.canAddFuelModel ? (
                    <Dropdown
                      selection
                      disabled={!security.canAddFuelModel}
                      loading={loading || isLoadingMutation}
                      value={priceList.fuelIndexId || ""}
                      onChange={(_, { value }) => saveFuelIndex(value)}
                      options={allIndex.map(({ id, name }) => ({ value: id, text: name }))}
                    />
                  ) : (
                    <FuelTag fuelIndexId={priceList.fuelIndexId} />
                  )}
                </div>
              </Form.Field>
            </Grid.Column>
            <Grid.Column>
              <Icon name="share external" as="a" href="" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
      {priceList.fuelIndexId && <FuelDetail fuelIndexId={priceList.fuelIndexId} />}
    </Segment>
  );
};

export default PriceListFuelSection;
