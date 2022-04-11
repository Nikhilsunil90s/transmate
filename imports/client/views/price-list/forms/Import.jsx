import React, { useContext } from "react";
import get from "lodash.get";
import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, SubmitField } from "uniforms-semantic";
import FileUpload from "/imports/client/components/forms/input/FileUpload.jsx";
import { Container, Grid, List, Message, Segment } from "semantic-ui-react";
import { PartnerSelectField } from "/imports/client/components/forms/uniforms";
import { uploadDoc } from "/imports/utils/functions/fnUpload";
import { useApolloClient, gql } from "@apollo/client";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("price-list:import");

const TEMPLATE_LINKS = {
  road: "https://files.transmate.eu/cdn/upload_template_pricelist_V33_road.xlsx",
  ocean: "https://files.transmate.eu/cdn/upload_template_pricelist_V31_ocean.xlsx",
  air: "https://files.transmate.eu/cdn/upload_template_pricelist_V31_all.xlsx"
};

const CREATE_FROM_FILE = gql`
  mutation createPriceListFromUpload($xlsUrl: String!, $partnerId: String) {
    result: createPriceListFromUpload(xlsUrl: $xlsUrl, partnerId: $partnerId) {
      id
    }
  }
`;

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    partnerId: String,
    file: String
  })
);

const PriceListImport = () => {
  const { accountId } = useContext(LoginContext);
  const client = useApolloClient();
  const { goRoute } = useRoute();
  const onSubmitForm = ({ file, partnerId }) => {
    debug("PriceListImport", { file, partnerId });

    // function uploads to AWS and returns url & store info
    uploadDoc({ file, directive: "pricelist.import", accountId })
      .then(({ store, link }) => {
        debug("data from submit uploadDoc %o , link %o", store, link);
        return client.mutate({
          mutation: CREATE_FROM_FILE,
          variables: { xlsUrl: link, partnerId }
        });
      })
      .then(({ data, errors }) => {
        debug("result data from api %o", { data, errors });
        if (errors) throw errors;
        toast.success("File has been parsed");

        const priceListId = get(data, "result.id");
        return goRoute("priceList", { _id: priceListId });
      })
      .catch(err => {
        return toast.error(err);
      });
  };

  return (
    <div>
      <Container fluid>
        <Segment padded="very">
          <h4>
            <Trans i18nKey="price.list.form.title_new" />
          </h4>
          <Grid columns={2}>
            <Grid.Column>
              <Segment floating>
                <AutoForm
                  schema={schema}
                  onSubmit={onSubmitForm}
                  modelTransform={(mode, model) => {
                    if (mode === "validate") {
                      const { name } = model.file || {};

                      return {
                        ...model,
                        file: name
                      };
                    }
                    return model;
                  }}
                >
                  <PartnerSelectField name="partnerId" options={{ includeOwnAccount: true }} />
                  <div style={{ marginBottom: "10px" }}>
                    <FileUpload name="file" />
                  </div>
                  <SubmitField
                    className="ui primary button"
                    data-test="submit"
                    content="Start import"
                  />
                </AutoForm>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Message
                info
                floating
                header={<Trans i18nKey="price.list.import.info_title" />}
                content={
                  <>
                    <p>
                      <Trans i18nKey="price.list.import.info_body" />
                    </p>
                    <List
                      items={[
                        {
                          content: (
                            <a href={TEMPLATE_LINKS.road}>
                              <Trans i18nKey="price.list.import.info_options.road" />
                            </a>
                          )
                        },
                        {
                          content: (
                            <a href={TEMPLATE_LINKS.ocean}>
                              <Trans i18nKey="price.list.import.info_options.ocean" />
                            </a>
                          )
                        },
                        {
                          content: (
                            <a href={TEMPLATE_LINKS.air}>
                              <Trans i18nKey="price.list.import.info_options.air" />
                            </a>
                          )
                        }
                      ]}
                    />
                    <p>
                      <Trans i18nKey="price.list.import.info_body2" />
                    </p>
                  </>
                }
              />
            </Grid.Column>
          </Grid>
        </Segment>
      </Container>
    </div>
  );
};
export default PriceListImport;
