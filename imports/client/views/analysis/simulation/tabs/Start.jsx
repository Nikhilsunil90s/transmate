import { toast } from "react-toastify";
import React, { useState } from "react";
import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { Grid, Button, Segment, Input, Popup, Dropdown } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import { SelectCheckboxes } from "/imports/client/components/forms/uniforms/SelectCheckboxes";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";

import { SIMULATION_START, GET_MY_PRICELISTS, SIMULATION_SAVE_PRICELISTS } from "../utils/queries";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVW";

const debug = require("debug")("analysis:start");

const StartTab = ({ ...props }) => {
  const client = useApolloClient();
  const { t } = useTranslation();
  const { simulation, analysisId, refetch } = props;
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const [startSimulation] = useMutation(SIMULATION_START, {
    variables: { analysisId }
  });
  const [savePriceLists] = useMutation(SIMULATION_SAVE_PRICELISTS, {
    client,
    onCompleted: data => {
      // can we make this update the cache??
      debug("data %o", data);
      toast.success("PriceLists saved");
      refetch();
    }
  });

  const { data: priceListdata = {}, loading, error } = useQuery(GET_MY_PRICELISTS, {
    variables: { input: { type: "contract" } }
  });
  if (error) console.error(error);
  debug("priceList data from apollo", { priceListdata, loading, error });

  const selectedPriceListIds = (simulation.priceLists || []).map(item => item.id);

  const data = (simulation.priceLists || []).map((item, i) => {
    const pl = {}; // use cache?
    return {
      id: item.id,
      title: item.title || (pl ? pl.title : undefined),
      carrierId: item.carrierId || (pl ? pl.carrierId : undefined),
      carrierName: item.carrierName || (pl ? pl.carrierName : undefined),
      alias: item.alias || ALPHABET[i]
    };
  });

  const priceListOptions = (priceListdata.priceLists || []).map(({ id, title, carrierName }) => ({
    id,
    label: (
      <>
        {title} <span style={{ opacity: 0.5 }}>{carrierName}</span>
      </>
    )
  }));

  const onChangeSelectedPriceLists = priceListIds => {
    const priceLists = (priceListdata.priceLists || [])
      .filter(({ id }) => priceListIds.includes(id))
      .map(({ id, carrierName, carrierId, title }) => ({ id, carrierName, carrierId, title }));
    debug("saving pricelists %o", priceLists);
    savePriceLists({ variables: { input: { analysisId, priceLists } } });
  };

  const confirmStartSimulation = () => {
    if (!simulation.priceLists?.length > 0) return;

    setConfirmState({
      show: true,
      onConfirm: () => {
        startSimulation();
        showConfirm(false);
        return toast.success("You simulation has been started");
      }
    });
  };
  return (
    <>
      <Segment padded="very" data-test="startSegment" className="startSegment">
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              {loading ? (
                <Dropdown
                  text={t("analysis.simulation.priceLists.title")}
                  icon="filter"
                  labeled
                  button
                  loading
                  disabled
                  className="icon"
                />
              ) : (
                <SelectCheckboxes
                  label={t("analysis.simulation.priceLists.title")}
                  options={priceListOptions}
                  value={selectedPriceListIds}
                  onChange={onChangeSelectedPriceLists}
                />
              )}
            </Grid.Column>
            <Grid.Column align="center">
              {simulation.status === "running" ? (
                "... running"
              ) : (
                <Popup
                  content={
                    !simulation.priceLists?.length > 0
                      ? "Please select at least 1 price list to start the analysis"
                      : "Start simulation"
                  }
                  trigger={<Button icon="play" content="Start" onClick={confirmStartSimulation} />}
                />
              )}
              <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>

      <Segment padded="very" className="selectedPriceLists">
        <ReactTable
          columns={[
            { accessor: "carrierId", Header: "Carrier id" },
            { accessor: "carrierName", Header: "Carrier Name" },
            { accessor: "alias", Header: "Alias", Cell: ({ value }) => <Input value={value} /> }
          ]}
          data={data}
        />
      </Segment>
    </>
  );
};

export default StartTab;
