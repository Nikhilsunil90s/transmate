import React, { useState } from "react";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import { Trans } from "react-i18next";
import { Container, Segment, Grid, Header, Message, Button, List, Form } from "semantic-ui-react";
import { FileUpload } from "/imports/client/components/forms/input/FileUpload.jsx";
import useRoute from "/imports/client/router/useRoute.js";
import { parseDataFile, ALLOWED_FILE_TYPES } from "../../../../utils/functions/fnParseDataFile";
import { START_DATA_IMPORT } from "/imports/api/imports/apollo-dataImports/queries";

const IMPORT_OPTIONS = {
  headers: [
    "name",
    "country",
    "city",
    "zipCode",
    "street",
    "nr",
    "bus",
    "id",
    "notes",
    "notesLoading",
    "notesPacking",
    "openingHours",
    "input"
  ]
};

const PartnerImport = () => {
  const [file, setFile] = useState();
  const [isParsing, setParsing] = useState(false);
  const client = useApolloClient();
  const { goRoute } = useRoute();

  function parseFile() {
    if (!file) return toast.error("Please select a file.");
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return toast.error("Please select a csv file.");
    setParsing(true);

    const onCompleteCb = async data => {
      try {
        const { data: res, errors } = await client.mutate({
          mutation: START_DATA_IMPORT,
          variables: { input: { data, type: "address" } }
        });
        if (errors) throw errors;
        goRoute("dataImport", { _id: res.startDataImport });
      } catch (error) {
        console.error({ error });
        setParsing(false);
        toast.error("Unable to import data");
      }
    };
    return parseDataFile({ file, onCompleteCb, options: IMPORT_OPTIONS });
  }
  return (
    <div>
      <Container fluid>
        <Segment padded="very">
          <Header as="h4" content={<Trans i18nKey="address.form.import.title" />} />
          <Grid columns={2}>
            <Grid.Column>
              <Segment>
                <Form>
                  {isParsing ? (
                    <p>
                      <Trans i18nKey="form.saving" />
                    </p>
                  ) : (
                    <Form.Field>
                      <FileUpload onChange={selectedFile => setFile(selectedFile)} />
                    </Form.Field>
                  )}
                </Form>
                <br />
                <Button
                  primary
                  content={<Trans i18nKey="address.form.import.submit" />}
                  disabled={isParsing}
                  onClick={parseFile}
                />
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Message info>
                <Message.Header content={<Trans i18nKey="address.form.import.info_title" />} />
                <p>
                  <Trans i18nKey="address.form.import.info_body" />
                </p>
                <List bulleted>
                  <List.Item>
                    <a href="https://files.transmate.eu/support/upload-template-address.csv">
                      <Trans i18nKey="address.form.import.info_options.file" />
                    </a>
                  </List.Item>
                </List>
                <p>
                  <Trans i18nKey="address.form.import.info_body2" />
                </p>

                <a href="https://www.transmate.eu/help/import-partners" target="blank">
                  <Trans i18nKey="info.read-more" />
                </a>
              </Message>
            </Grid.Column>
          </Grid>
        </Segment>
      </Container>
    </div>
  );
};

export default PartnerImport;
