import React, { useState } from "react";
import get from "lodash.get";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { useApolloClient } from "@apollo/client";
import { Header, Segment, Grid, List, Form, Button } from "semantic-ui-react";

// helpers:
import { getFieldOptions } from "/imports/api/imports/helpers/getFieldOptions";

import { PROCESS_IMPORT, MAP_HEADER, MAP_VALUE, RESTART_IMPORT } from "../../utils/queries";

import ImportMappingValue from "./MapValues";
import ImportMappingSelect from "./MapHeader";

const debug = require("debug")("shipment-import");

// when header map has changed -> values need to be re-evaluated
const ImportHeaderMap = ({ importId, imp, header }) => {
  function getFieldValues(impAfterUpdate) {
    const impObj = impAfterUpdate || imp;
    const field = get(impObj, ["mapping", "headers", header]); // is header mapped?
    if (field && getFieldOptions(field).length) {
      return get(impObj, ["mapping", "values", header]) || {};
    }
    return {};
  }
  const client = useApolloClient();
  const [valueMapping, setValueMapping] = useState(getFieldValues());
  const [headerMap, setHeaderMapping] = useState(get(imp, ["mapping", "headers", header]));

  async function onChangeHeaderMapping(key) {
    const oldKey = headerMap;
    setHeaderMapping(key);
    try {
      const { data = {}, errors } = await client.mutate({
        mutation: MAP_HEADER,
        variables: { input: { importId, header, key } }
      });
      debug("apollo - headerMap", { data, errors });
      if (errors) throw errors;
      setValueMapping(getFieldValues(data.mapShipmentImportHeader)); // mutation should return mapping update
      toast.success("Header mapping stored");
    } catch (errors) {
      console.error({ errors });
      setHeaderMapping(oldKey);
      toast.error("Could not set header");
    }
  }

  async function onChangeValueMapping(importValue, systemValue) {
    const oldValueMapping = valueMapping;
    setValueMapping({
      ...valueMapping,
      [importValue]: systemValue
    });
    try {
      const { errors } = await client.mutate({
        mutation: MAP_VALUE,
        variables: { input: { importId, header, importValue, systemValue } }
      });
      if (errors) throw errors;
      toast.success("Value mapping stored");
    } catch (errors) {
      console.error({ errors });
      setValueMapping(oldValueMapping);
      errors.forEach(error =>
        toast.error(
          <>
            <b>Could not set header</b>
            {error.message}
          </>
        )
      );
    }
  }

  return (
    <>
      <ImportMappingSelect
        header={header}
        value={headerMap}
        onChange={onChangeHeaderMapping}
        imp={imp}
      />

      {/* value mapping */}
      {Object.entries(valueMapping).map(([k, v], j) => (
        <ImportMappingValue
          key={`value-map-${j}`}
          imp={imp}
          header={header}
          value={v}
          importValue={k}
          onChange={onChangeValueMapping}
        />
      ))}
    </>
  );
};

const ImportMappingForm = ({ ...props }) => {
  const { importId, imp, setActiveStep, resetMapping } = props;
  const client = useApolloClient();

  function getSamples(header) {
    return Object.values(get(imp, ["mapping", "samples", header]) || {});
  }

  function processImport() {
    client.mutate({
      mutation: PROCESS_IMPORT,
      variables: { importId }
    });
    toast.info("Import process started");
    setActiveStep("ImportProcess");
  }

  async function restartImport() {
    debug("restarting");
    client.mutate({
      mutation: RESTART_IMPORT,
      variables: { importId }
    });
  }

  return (
    <>
      <div>
        <Segment padded="very" basic>
          <Header as="h3" content={<Trans i18nKey="edi.mapping.title" />} />
          <Form>
            <Form.Field inline>
              <label>Mapping template</label>
              {imp.type}
            </Form.Field>
            <Grid columns={2}>
              {(imp.headers || []).map((header, i) => {
                const samples = getSamples(header);

                return (
                  <Grid.Row key={`header-map-${i}`}>
                    <Grid.Column>
                      <ImportHeaderMap {...props} header={header} />
                    </Grid.Column>
                    <Grid.Column>
                      <Form.Field>
                        <label>
                          <Trans i18nKey="edi.mapping.sample" />
                        </label>
                      </Form.Field>

                      {samples ? (
                        <List bulleted className="samples">
                          {samples.map((sample, j) => (
                            <List.Item key={j}>{sample}</List.Item>
                          ))}
                        </List>
                      ) : (
                        <i className="samples">
                          <Trans i18nKey="edi.mapping.emptyrow" />
                        </i>
                      )}
                    </Grid.Column>
                  </Grid.Row>
                );
              })}
            </Grid>
          </Form>
        </Segment>
      </div>
      <Segment as="footer">
        <div>
          <Button
            primary
            disabled={imp.errors?.length > 0}
            content={<Trans i18nKey="edi.steps.process.title" />}
            onClick={processImport}
          />
          <Button
            primary
            basic
            icon="undo"
            content={<Trans i18nKey="edi.restart" />}
            onClick={restartImport}
          />
          <Button
            primary
            basic
            content={<Trans i18nKey="edi.resetMapping" />}
            onClick={() => resetMapping({ variables: { input: { importId, force: true } } })}
          />
        </div>
      </Segment>
    </>
  );
};

export default ImportMappingForm;
