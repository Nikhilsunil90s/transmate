import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Button,
  Container,
  Divider,
  Grid,
  Icon,
  List,
  Message,
  Popup,
  Segment
} from "semantic-ui-react";
import { AutoField, AutoForm, BoolField } from "uniforms-semantic";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { useQuery } from "@apollo/client";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import {
  SelectCheckboxesField,
  DropdownCountryFlagField
} from "/imports/client/components/forms/uniforms";
import DirectoryCard from "./Card.jsx";

import { SEARCH_DIRECTORY, GET_DIRECTORY_SEARCH_OPTIONS } from "./queries";

const debug = require("debug")("directory");

let formRef;
const searchSchema = new SimpleSchema2Bridge(
  new SimpleSchema(
    {
      name: String,
      partners: Boolean,
      favorites: Boolean,
      services: String,
      certificates: String,
      location: String,
      destination: String
    },
    { requiredByDefault: false }
  )
);

const SearchPanel = ({ onChangeSearch }) => {
  const { t } = useTranslation();
  const { data = {}, loading, error } = useQuery(GET_DIRECTORY_SEARCH_OPTIONS, {
    fetchPolicy: "cache-first"
  });

  if (error) console.error(error);

  debug("filter options %o", data);
  const serviceOptions = (data.results?.services || []).map(value => ({ value, label: value }));
  const certificateOptions = (data.results?.certificates || []).map(value => ({
    value,
    label: value
  }));
  if (loading) return <Loader loading />;
  return (
    <AutoForm
      schema={searchSchema}
      autosave
      onSubmit={onChangeSearch}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Message>
        <AutoField name="name" label={t("partner.directory.quickSearch")} />
      </Message>
      <Divider
        horizontal
        content={
          <>
            <Icon name="tag" />
            <Trans i18nKey="partner.directory.tagSearch" />
          </>
        }
      />
      <Message>
        <p>
          <Trans i18nKey="partner.directory.filter" />

          <Popup
            content={<Trans i18nKey="partner.directory.filterTooltip" />}
            trigger={
              <a>
                <Icon name="help" circular />
              </a>
            }
          />
        </p>

        <Divider />
        <BoolField name="partners" label={t("partner.directory.partnersFilter")} />
        <Divider />
        <BoolField name="favorites" label={t("partner.directory.favoritesFilter")} />
      </Message>
      <Message>
        <p>
          <Trans i18nKey="partner.directory.services" />
          <Popup
            content={<Trans i18nKey="partner.directory.servicesTooltip" />}
            trigger={
              <a>
                <Icon name="help" circular />
              </a>
            }
          />
        </p>
        <Divider />
        <SelectCheckboxesField
          label={t("partner.directory.serviceFilter")}
          name="services"
          options={serviceOptions}
        />
      </Message>
      <Message>
        <p>
          <Trans i18nKey="partner.directory.location" />
          <Popup
            content={<Trans i18nKey="partner.directory.locationTooltip" />}
            trigger={
              <a>
                <Icon name="help" circular />
              </a>
            }
          />
        </p>
        <Divider />
        <DropdownCountryFlagField name="location" multiple label={t("countries.label")} />
      </Message>
      <Message>
        <p>
          <Trans i18nKey="partner.directory.destination" />
          <Popup
            content={<Trans i18nKey="partner.directory.destinationTooltip" />}
            trigger={
              <a>
                <Icon name="help" circular />
              </a>
            }
          />
        </p>
        <Divider />
        <DropdownCountryFlagField name="destination" multiple label={t("countries.label")} />
      </Message>
      <Message>
        <p>
          <Trans i18nKey="partner.directory.certificates" />
          <Popup
            content={<Trans i18nKey="partner.directory.certificatesTooltip" />}
            trigger={
              <a>
                <Icon name="help" circular />
              </a>
            }
          />
        </p>
        <Divider />
        <SelectCheckboxesField
          label={t("partner.directory.certificateFilter")}
          name="certificates"
          options={certificateOptions}
        />
      </Message>
      <div className="reset">
        <Button
          content={<Trans i18nKey="partner.directory.reset" />}
          onClick={() => {
            formRef.reset();
            onChangeSearch({});
          }}
        />
      </div>
    </AutoForm>
  );
};

const ResultsPanel = ({ filter }) => {
  const [limit, setLimit] = useState(10);
  const { data = {}, loading } = useQuery(SEARCH_DIRECTORY, {
    variables: {
      input: {
        filter,
        limit
      }
    }
  });

  debug("directory search result %o", data);

  const getMore = () => setLimit(limit + 10);
  const items = data.results || [];
  const hasMore = items.length > limit;

  return (
    <>
      {items.map((item, i) => (
        <DirectoryCard key={i} account={item} />
      ))}
      {loading && <Loader loading />}
      {hasMore && (
        <div className="more">
          <Button primary content={<Trans i18nKey="partner.directory.more" />} onClick={getMore} />
        </div>
      )}
    </>
  );
};

const Directory = () => {
  const [filter, setFilter] = useState({});
  const onChangeSearch = newFilter => setFilter(newFilter);

  return (
    <Container fluid>
      <Segment padded="very" className="portal">
        <List>
          <List.Item>
            <div className="content full">
              <h3 className="section-header">
                <Trans i18nKey="partner.directory.title" />
              </h3>
              <Grid>
                <Grid.Column width={4} className="searchPanel">
                  <SearchPanel onChangeSearch={onChangeSearch} />
                </Grid.Column>
                <Grid.Column width={12} className="resultsPanel">
                  <ResultsPanel {...{ filter }} />
                </Grid.Column>
              </Grid>
            </div>
          </List.Item>
        </List>
      </Segment>
    </Container>
  );
};

export default Directory;
