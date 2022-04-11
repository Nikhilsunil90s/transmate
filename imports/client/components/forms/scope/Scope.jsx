/* eslint-disable default-case */
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useApolloClient } from "@apollo/client";
import { Accordion, Message, List, Grid, Icon, Checkbox } from "semantic-ui-react";
import { VolumeOverview, LaneOverview, EquipmentOverview, DGOverview, Seasonality } from ".";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { sortChronologic } from "/imports/utils/functions/fnSortChronological";
import { SelectField } from "/imports/client/components/forms/uniforms/SelectField";

import { GET_MY_TENDERS, GET_MY_PRICELISTS, GET_MY_SIMULATIONS, COPY_SCOPE } from "./utils/queries";

const debug = require("debug")("component:scope");

function tenderOptions(data) {
  return [...(data.tenders || [])].sort(sortChronologic).map(item => ({
    key: item.id,
    value: item.id,
    text: (
      <>
        {item.title}
        <span style={{ opacity: 0.4, marginLeft: ".5em " }}>
          {" "}
          - {moment(item.created.at).format("YYYY-MM-DD")}
        </span>
      </>
    )
  }));
}

function priceListOptions(data) {
  const priceListSorted = [...(data.priceLists || [])].sort((a, b) =>
    ((a.status === "active" ? "a" : "b") + a.title).localeCompare(
      (b.status === "active" ? "a" : "b") + b.title
    )
  );
  debug("data %o , after sort %o", data.priceLists, priceListSorted);
  return priceListSorted.map(item => ({
    key: item.id,
    value: item.id,
    text: (
      <>
        {item.title}
        <span style={{ opacity: 0.4, marginLeft: ".5em " }}>
          {" "}
          - {item.carrierName}
          {item.status === "active" ? <Icon name="circle" color="green" /> : ""}
        </span>
      </>
    )
  }));
}

function simulationOptions(data) {
  return (data.simulations || []).map(item => ({
    key: item.id,
    value: item.id,
    text: (
      <>
        {item.name}
        <span style={{ opacity: 0.4, marginLeft: ".5em " }}>
          {" "}
          - {moment(item.created?.at).format("YYYY-MM-DD")}
        </span>
      </>
    )
  }));
}

const SourceSelectionModal = ({ type, title, showModal, show, onSave }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [value, setValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState();
  const selectInput = () => onSave({ referenceId: value, type });

  async function getData() {
    if (!show) return;
    setLoading(true);
    switch (type) {
      case "tender": {
        const res = await client.query({ query: GET_MY_TENDERS, fetchPolicy: "no-cache" });
        setOptions(tenderOptions(res?.data));
        break;
      }
      case "priceList": {
        const res = await client.query({
          query: GET_MY_PRICELISTS,
          variables: { input: { type: "contract" } },
          fetchPolicy: "no-cache"
        });
        setOptions(priceListOptions(res?.data));
        break;
      }
      case "simulation": {
        const res = await client.query({ query: GET_MY_SIMULATIONS, fetchPolicy: "no-cache" });
        setOptions(simulationOptions(res?.data));
        break;
      }
    }
    setLoading(false);
  }
  useEffect(() => {
    getData();
  }, [show]);

  return (
    <ModalComponent
      show={show}
      title={title}
      showModal={showModal}
      body={
        <div className="ui form">
          <SelectField
            onChange={newValue => {
              setValue(newValue);
            }}
            loading={loading}
            value={value}
            label={t("form.select")}
            options={options}
          />
        </div>
      }
      actions={<ModalActions {...{ showModal, onSave: selectInput }} />}
    />
  );
};

const ScopeControlPanel = ({
  scopeDefinition,
  handleCheck,
  generateFromPriceList,
  generateFromTender,
  generateFromSimulation,
  canEdit
}) => {
  const { t } = useTranslation();
  return (
    <>
      <p>{t("analysis.scope.parameters")}</p>
      <Grid divided>
        <Grid.Row>
          <Grid.Column width={10}>
            <List>
              <List.Item
                content={<Checkbox name="lanes" label={t("general.lanes")} checked disabled />}
              />
              <List.Item
                content={
                  <Checkbox
                    name="volumes"
                    disabled={!canEdit}
                    label={t("general.goods")}
                    checked={scopeDefinition.includes("volumes")}
                    onChange={(_, { checked }) => handleCheck(checked, "volumes")}
                  />
                }
              />
              <List.Item
                content={
                  <Checkbox
                    name="equipments"
                    disabled={!canEdit}
                    label={t("general.equipmenType")}
                    checked={scopeDefinition.includes("equipments")}
                    onChange={(_, { checked }) => handleCheck(checked, "equipments")}
                  />
                }
              />
              <List.Item
                content={
                  <Checkbox
                    name="DG"
                    disabled={!canEdit}
                    label={t("general.dangerousGoods")}
                    checked={scopeDefinition.includes("DG")}
                    onChange={(_, { checked }) => handleCheck(checked, "DG")}
                  />
                }
              />
              {/* Seasonality */}
            </List>
          </Grid.Column>
          <Grid.Column width={6}>
            <h4>{t("analysis.importSource")}</h4>
            {canEdit ? (
              <List selection>
                {/* ModalTrigger template='SimpleDropdownModal' */}
                <List.Item
                  icon="list alternate outline"
                  content={t("general.priceList")}
                  onClick={generateFromPriceList}
                />
                {/* triggers dropdownmodal */}
                <List.Item
                  icon="list alternate outline"
                  content={t("general.tender")}
                  onClick={generateFromTender}
                />
                <List.Item
                  icon="list alternate outline"
                  content={t("general.simulation")}
                  onClick={generateFromSimulation}
                />
                <List.Item icon="upload" content={t("analysis.uploadSimulationConfig")} />
              </List>
            ) : (
              t("analysis.scope.locked")
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

const ScopeDefinition = ({ ...props }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });
  const { canEdit, onSave, masterType, masterId } = props;
  const scope = {
    ...(props.scope || {}),
    definition: props.scope?.definition || ["lanes"]
  };

  const [scopeDefinition, setScopeDefinition] = useState(scope.definition || []);

  const handleCheck = (checked, topic) => {
    let mod = scopeDefinition;
    if (checked) {
      mod.push(topic);
    } else {
      mod = mod.filter(tc => tc !== topic);
    }
    setScopeDefinition(mod);
    onSave({ definition: mod });
  };

  async function selectCopySourceAction(input = {}) {
    const { referenceId, type: referenceType } = input;
    debug("selectCopySourceAction %o", input);
    if (!referenceId) return toast.error("referenceId not set up!");
    const res = await client.mutate({
      mutation: COPY_SCOPE,
      variables: {
        input: {
          referenceId,
          referenceType,
          masterType,
          masterId
        }
      }
    });

    const newDef = res.data?.result?.definition || [];
    setScopeDefinition(newDef);
    if (res.error) return toast.error(res.error);
    return onSave({ definition: newDef }, () => setModalState({ show: false })); // we use this to refresh the data
  }

  const generateFromPriceList = () =>
    setModalState({
      show: true,
      title: "Select Rate card",
      type: "priceList"
    });

  const generateFromTender = () =>
    setModalState({
      show: true,
      title: "Select tender",
      type: "tender"
    });

  const generateFromSimulation = () =>
    setModalState({
      show: true,
      title: "Select analysis",
      type: "simulation"
    });

  return (
    <>
      <Accordion
        styled
        fluid
        defaultActiveIndex={1}
        panels={[
          {
            key: "scopeInfo",
            title: t("analysis.info"),
            content: {
              content: (
                <Message
                  floating
                  info
                  header={t("analysis.about.scopes")}
                  content={
                    <>
                      <p>{t("analysis.about.detail")}</p>
                      <a
                        href="https://www.transmate.eu/help/understanding-scopes"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("analysis.about.supportUrl")}
                      </a>
                    </>
                  }
                />
              )
            }
          },
          {
            key: "scopeDefinition",
            title: t("analysis.scope.definition"),
            content: {
              content: (
                <ScopeControlPanel
                  {...{
                    canEdit,
                    scopeDefinition,
                    handleCheck,
                    generateFromPriceList,
                    generateFromTender,
                    generateFromSimulation
                  }}
                />
              )
            }
          },
          {
            key: "scopeLanes",
            title: t("general.lanes"),
            content: {
              content: <LaneOverview lanes={scope.lanes} onSave={onSave} canEdit={canEdit} />
            }
          },
          ...(scopeDefinition.includes("volumes")
            ? [
                {
                  key: "scopeVolumes",
                  title: t("general.volumes"),
                  content: {
                    content: (
                      <VolumeOverview volumes={scope.volumes} onSave={onSave} canEdit={canEdit} />
                    )
                  }
                }
              ]
            : []),
          ...(scopeDefinition.includes("equipments")
            ? [
                {
                  key: "scopeEquipments",
                  title: t("general.equipments"),
                  content: {
                    content: (
                      <EquipmentOverview
                        equipments={scope.equipments}
                        onSave={onSave}
                        canEdit={canEdit}
                      />
                    )
                  }
                }
              ]
            : []),
          ...(scopeDefinition.includes("DG")
            ? [
                {
                  key: "scopeDG",
                  title: t("general.dangerousGoods"),
                  content: {
                    content: <DGOverview />
                  }
                }
              ]
            : []),
          ...(scopeDefinition.includes("seasonality")
            ? [
                {
                  key: "seasonality",
                  title: t("general.seasonality"),
                  content: {
                    content: <Seasonality />
                  }
                }
              ]
            : [])
        ]}
      />
      <SourceSelectionModal {...modalState} showModal={showModal} onSave={selectCopySourceAction} />
    </>
  );
};

ScopeDefinition.propTypes = {
  scope: PropTypes.object,
  masterType: PropTypes.string.isRequired,
  masterId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,

  // all is returned as {definition, lanes,...}, if holding document stores this in scope key, this should be handled.
  onSave: PropTypes.func.isRequired
};

export default ScopeDefinition;
