import React from "react";
import { BoolField } from "uniforms-semantic";
import { Grid, Divider } from "semantic-ui-react";
import SelectFieldWithAdditions from "/imports/client/components/forms/uniforms/SelectFieldWithAddtions";
import { toOptionList } from "../utils/helpers";
import ServicesDropdown from "./ServicesDropdown";

const debug = require("debug")("portal:services:tab");

const DEFAULT_CERTIFICATES = [
  "HACCP",
  "OHSAS 18001",
  "GMP",
  "ISO 13485",
  "ISO 14000",
  "ISO 14155",
  "ISO 22000",
  "ISO 45001",
  "ISO 50001",
  "ISO 9000",
  "ISO 9001"
];
const DEFAULT_INDUSTRIES = [
  "buildingMaterials",
  "chemical",
  "consumerGoods",
  "FMCG",
  "feed",
  "food",
  "industry",
  "pharma"
];

const CertificatesSelectionField = () => {
  const certificateOptions = toOptionList(DEFAULT_CERTIFICATES);
  debug("certificateOptions", certificateOptions);
  return (
    <SelectFieldWithAdditions
      name="certificates"
      label="Certificates"
      options={certificateOptions}
      multiple
    />
  );
};

const IndustriesSelectionField = () => {
  const industryOptions = toOptionList(DEFAULT_INDUSTRIES);
  debug("industryOptions", industryOptions);
  return (
    <SelectFieldWithAdditions
      name="industries"
      label="Industries"
      options={industryOptions}
      multiple
    />
  );
};

const ServicesTab = () => {
  return (
    <>
      <Grid divided stackable columns="equal">
        <Grid.Row>
          <Grid.Column>
            <h3>Road</h3>
            <BoolField name="service.FTL" label="FTL" />
            <BoolField name="service.LTL" label="LTL" />
            <BoolField name="service.express" label="Express" />
            <BoolField name="service.generalCargo" label="General Cargo" />
          </Grid.Column>
          <Grid.Column>
            <h3>Ocean</h3>
            <BoolField name="service.FCL" label="FCL" />
            <BoolField name="service.LCL" label="LCL" />
            <BoolField name="service.packed" label="packed" />
          </Grid.Column>
          <Grid.Column>
            <h3>Air</h3>
            <BoolField name="service.air" label="Air" />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Divider />
      <ServicesDropdown name="services" label="Services" />
      <CertificatesSelectionField />
      <IndustriesSelectionField />
    </>
  );
};

export default ServicesTab;
