import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Container, Grid, Segment } from "semantic-ui-react";
import { AutoForm, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { SelectField } from "/imports/client/components/forms/uniforms";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

import { GET_OCEAN_DISTANCE, GET_USAGE } from "./utils/queries";
import OceanDistanceResults from "./components/Results.jsx";

import { portNames } from "/imports/api/_jsonSchemas/fixtures/ocean-distance.json";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("tools:routeInsight");

const toTitleCase = str => {
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

//#region components
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    from: String,
    to: String
  })
);

let formRef;
const SearchForm = ({ onSubmitForm, initialSearch }) => {
  const portOptions = portNames.map(key => ({ value: key, text: toTitleCase(key) }));
  return (
    <AutoForm
      schema={schema}
      model={initialSearch}
      onSubmit={onSubmitForm}
      onChangeModel={console.log}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Grid stackable columns={2}>
        <Grid.Column>
          <SelectField search name="from" options={portOptions} />
        </Grid.Column>
        <Grid.Column>
          <SelectField search name="to" options={portOptions} />
        </Grid.Column>
      </Grid>

      <ErrorsField />
    </AutoForm>
  );
};

//#endregion

const ToolsOceanDistance = () => {
  const [isSearched, setSearched] = useState(false);
  const {
    queryParams: { from, to }
  } = useRoute();
  const initialSearch = { from, to };

  const [getOceanDistance, { loading, data = {}, error }] = useMutation(GET_OCEAN_DISTANCE, {
    refetchQueries: [
      {
        query: GET_USAGE,
        variables: { input: { activity: "tools.ocean-distance", thisMonthOnly: true } }
      }
    ]
  });
  useEffect(() => {
    if (from && to) {
      getOceanDistance({ variables: { input: { from, to } } });
      setSearched(true);
    }
  }, []);

  if (error) console.error({ error });
  const results = data.getOceanDistance || {};
  debug("results", results);

  const onSubmitForm = formData => {
    setSearched(true);
    debug("search query", formData);
    getOceanDistance({ variables: { input: formData } });
  };

  return (
    <>
      <div>
        <Container>
          <IconSegment
            name="oceanDistance"
            icon="globe"
            title={<Trans i18nKey="tools.oceanDistance.title" />}
            body={<SearchForm onSubmitForm={onSubmitForm} initialSearch={initialSearch} />}
          />

          {isSearched && (
            <Segment padded="very" loading={loading}>
              <OceanDistanceResults results={results} />
            </Segment>
          )}
        </Container>
      </div>

      <Segment as="footer">
        <div>
          <Button
            primary
            icon="search"
            content={<Trans i18nKey="components.search" />}
            onClick={() => formRef.submit()}
          />
        </div>
      </Segment>
    </>
  );
};

export default ToolsOceanDistance;
