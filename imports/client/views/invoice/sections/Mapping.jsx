import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import get from "lodash.get";
import { Trans, useTranslation } from "react-i18next";

import { Popup, Button, Segment, Message } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { CostTag } from "/imports/client/components/tags";

import Loader from "/imports/client/components/utilities/Loader.jsx";
import ReactTable from "/imports/client/components/tables/ReactTable";

import { tabPropTypes } from "../utils/_tabProptypes";
import useRoute from "/imports/client/router/useRoute";
import {
  GET_COST_TYPES,
  CostTypeSelectLoader
} from "/imports/client/components/forms/uniforms/CostTypeSelect";
import { RESET_COST_MAPPING, MAP_INVOICE_COSTS } from "../utils/queries";

//#region components
const setHeader = column => {
  return <Trans i18nKey={`partner.billing.invoice.cost.${column}`} />;
};

const InvoiceMapping = ({ invoice, isEditing, updateMapping }) => {
  const costs = [...invoice.costs];
  const [mapping, setMapping] = useState(costs);

  useEffect(() => setMapping(invoice.costs || []), [invoice]);

  const onChangeMapping = ({ description, costId, index }) => {
    // update table (immutable):
    const updatedMapping = mapping.map((item, idx) => {
      if (idx === index) {
        return { description, costId };
      }
      return item;
    });

    setMapping(updatedMapping);

    // update changes state:
    updateMapping({ description, costId });
  };

  const columns = [
    {
      Header: setHeader("code"),
      className: "collapsing",
      accessor: "code"
    },
    {
      Header: setHeader("description"),
      accessor: "description"
    },
    {
      // if can edit -> dropdowns, otherwise costTag...
      Header: setHeader("type"),
      accessor: "costId",
      Cell: ({ row }) => {
        const costId = get(row, ["original", "costId"]);
        return isEditing ? (
          <CostTypeSelectLoader
            value={costId}
            onChange={newValue => {
              onChangeMapping({
                description: get(row, ["original", "description"]),
                costId: newValue,
                index: row.index
              });
            }}
          />
        ) : (
          <CostTag costId={costId} />
        );
      }
    }
  ];

  return (
    <ReactTable data={mapping} columns={columns} paginate shouldShowTablePagination maxRows={5} />
  );
};

const MappingActions = ({ invoiceId, canEdit, activateMapping }) => {
  const [resetMapping, { loading: isResetMappingLoading }] = useMutation(RESET_COST_MAPPING, {
    variables: { invoiceId }
  });

  function doResetMapping() {
    toast.info("Resetting mapping");
    resetMapping()
      .then(() => toast.success("Mapping regenerated"))
      .catch(error => console.error(error));
  }

  return (
    <Segment clearing>
      <Button.Group floated="right">
        <Popup
          content={<Trans i18nKey="partner.billing.invoice.costs.edit" />}
          trigger={<Button icon="pencil alternate" disabled={!canEdit} onClick={activateMapping} />}
        />
        <Popup
          content={<Trans i18nKey="partner.billing.invoice.costs.reset" />}
          trigger={
            <Button
              icon="redo alternate"
              disabled={!canEdit}
              loading={isResetMappingLoading}
              onClick={doResetMapping}
            />
          }
        />
      </Button.Group>
    </Segment>
  );
};

//#endregion

export const InvoiceMappingSection = ({ ...props }) => {
  // pre-load all cost descriptions
  const [mapInvoiceCost] = useMutation(MAP_INVOICE_COSTS);
  const { t } = useTranslation();
  const [isEditing, setEditing] = useState(false);
  const [newMappings, setNewMappings] = useState({});
  const { params } = useRoute();

  const { canEdit } = props;
  function activateMapping() {
    if (!canEdit) return;
    setEditing(true);
  }

  function updateMapping({ description, costId }) {
    setNewMappings({
      ...newMappings,
      [description]: costId
    });
  }

  function confirmNewMappings() {
    // this will set all invoice descriptions to this costId
    // showConfirm first??
    const invoiceId = params._id;
    const updates = Object.entries(newMappings).map(([k, v]) => ({
      description: k,
      costId: v
    }));

    mapInvoiceCost({ variables: { input: { invoiceId, updates } } })
      .then(() => {
        toast.success("Cost items mapped");
        setNewMappings({});
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not map cost item");
      });
  }

  const newMappingsAvailable = Object.keys(newMappings).length > 0;

  return (
    <IconSegment
      title={t("partner.billing.invoice.costs.title")}
      icon="tags"
      body={
        <>
          {props.canEdit && <MappingActions {...props} activateMapping={activateMapping} />}
          <InvoiceMapping {...props} isEditing={isEditing} updateMapping={updateMapping} />
          {newMappingsAvailable ? (
            <Message warning icon="exclamation" content="Pending changes." />
          ) : (
            <Message
              info
              icon="info"
              content={<Trans i18nKey="partner.billing.invoice.cost.info" />}
            />
          )}
        </>
      }
      footer={
        newMappingsAvailable ? (
          <Button content={<Trans i18nKey="form.save" />} onClick={confirmNewMappings} />
        ) : null
      }
    />
  );
};

InvoiceMappingSection.propTypes = {
  ...tabPropTypes
};

// gets the costData:
const InvoiceMappingSectionLoader = ({ ...props }) => {
  const { loading } = useQuery(GET_COST_TYPES, {
    variables: { includeDummy: true },
    fetchPolicy: "cache-first"
  });

  if (loading) return <Loader loading />;
  return <InvoiceMappingSection {...props} />;
};

InvoiceMappingSectionLoader.propTypes = { ...tabPropTypes };

export default InvoiceMappingSectionLoader;
