import React, { useState } from "react";
import get from "lodash.get";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { Segment, Button, Header, Popup } from "semantic-ui-react";

import ReactTable from "/imports/client/components/tables/ReactTable";
import { PriceListSelectModal, ConfirmComponent } from "/imports/client/components/modals";
import SwitchPointAnalyisLaneModal from "./modals/Lane.jsx";
import SwitchPointAnalyisDetailModal from "./modals/Detail.jsx";
import { CountryFlag } from "/imports/client/components/tags";
import { GENERATE_LANES } from "../utils/queries";

const debug = require("debug")("switchPoint:UI");

const LaneTable = ({ lanes, onRemoveLane }) => {
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  const [modalState, setModalState] = useState({ show: false, lane: {} });
  const showModal = show => setModalState({ ...modalState, show });

  return (
    <>
      <ReactTable
        tableClass="ui celled structure table"
        data={lanes}
        columns={[
          {
            Header: <Trans i18nKey="analysis.switchPoint.results.pickup" />,
            id: "laneFrom",
            columns: [
              {
                Header: <Trans i18nKey="analysis.switchPoint.results.cc" />,
                accessor: "from.CC",
                Cell: ({ value }) => <CountryFlag countryCode={value} />
              },
              {
                Header: <Trans i18nKey="analysis.switchPoint.results.zip" />,
                accessor: "from.zip"
              }
            ]
          },
          {
            Header: <Trans i18nKey="analysis.switchPoint.results.delivery" />,
            id: "laneTo",
            columns: [
              {
                Header: <Trans i18nKey="analysis.switchPoint.results.cc" />,
                accessor: "to.CC",
                Cell: ({ value }) => <CountryFlag countryCode={value} />
              },
              {
                Header: <Trans i18nKey="analysis.switchPoint.results.zip" />,
                accessor: "to.zip"
              }
            ]
          },
          {
            Header: <Trans i18nKey="analysis.switchPoint.results.switchPoint" />,
            id: "results",
            columns: [
              { Header: <Trans i18nKey="analysis.switchPoint.results.from" />, id: "j" },
              { Header: <Trans i18nKey="analysis.switchPoint.results.to" />, id: "k" },
              { Header: <Trans i18nKey="analysis.switchPoint.results.priceList" />, id: "l" },
              { Header: <Trans i18nKey="analysis.switchPoint.results.carrier" />, id: "m" }
            ]
          },
          {
            id: "actions",
            Cell: ({ row: { original, index } }) => (
              <Button.Group>
                <Popup
                  content={<Trans i18nKey="analysis.switchPoint.results.detail" />}
                  trigger={
                    <Button
                      icon="line chart"
                      onClick={() => setModalState({ show: true, lane: original })}
                    />
                  }
                />
                <Popup
                  content={<Trans i18nKey="general.remove" />}
                  trigger={
                    <Button icon="trash" onClick={() => setConfirmState({ show: true, index })} />
                  }
                />
              </Button.Group>
            )
          }
        ]}
      />
      <SwitchPointAnalyisDetailModal {...modalState} showModal={showModal} />
      <ConfirmComponent
        {...confirmState}
        showConfirm={showConfirm}
        onConfirm={() => onRemoveLane({ index: confirmState.index }, () => showConfirm(false))}
      />
    </>
  );
};

const LaneOverview = ({ analysisId, analysis, onSave }) => {
  const client = useApolloClient();
  const [laneModalState, setLaneModalState] = useState({ show: false });
  const [showGenerate, showGenerateModal] = useState(false);
  const showLaneModal = show => setLaneModalState({ ...laneModalState, show });

  const lanes = get(analysis, ["switchPoint", "lanes"]) || [];
  const intervals = get(analysis, ["switchPoint", "intervals"]) || [];
  async function generateFromPriceList({ priceListId }) {
    try {
      const { errors } = await client.mutate({
        mutation: GENERATE_LANES,
        variables: { input: { analysisId, priceListId } }
      });
      if (errors) throw errors;
      showGenerateModal(false);
    } catch (error) {
      console.error({ error });
      toast.error("Could not generate pricelist");
    }
  }
  async function saveLane(lane) {
    let mod = [...lanes];
    const { index } = laneModalState;
    debug("updating lanes update:%o, idx:%s", lane, index);
    if (index > -1) {
      mod[index] = lane;
    } else {
      mod = [...mod, lane];
    }
    onSave({ lanes: mod }, () => showLaneModal(false));
  }
  async function onRemoveLane({ index }, cb) {
    const mod = lanes.filter((lane, idx) => idx !== index);
    onSave({ lanes: mod }, cb);
  }
  return (
    <Segment padded="very">
      <div>
        <Header as="h4" content={<Trans i18nKey="analysis.switchPoint.results.title" />} />
        {lanes.length > 0 ? (
          <LaneTable lanes={lanes} intervals={intervals} onRemoveLane={onRemoveLane} />
        ) : (
          <Trans i18nKey="analysis.switchPoint.form.laneEmpty" />
        )}
      </div>
      <Segment as="footer">
        <SwitchPointAnalyisLaneModal
          {...laneModalState}
          showModal={showLaneModal}
          onSave={saveLane}
        />
        <Button
          primary
          content={<Trans i18nKey="analysis.switchPoint.form.addLane" />}
          onClick={() => showLaneModal(true)}
        />

        <PriceListSelectModal
          show={showGenerate}
          showModal={showGenerateModal}
          onSave={generateFromPriceList}
        />
        <Popup
          content="Generate from priceList"
          trigger={
            <Button
              icon="lightning"
              content={<Trans i18nKey="analysis.switchPoint.form.laneGenerate.label" />}
              onClick={() => showGenerateModal(true)}
            />
          }
        />
      </Segment>
    </Segment>
  );
};

export default LaneOverview;
