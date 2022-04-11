import React from "react";
import { Trans } from "react-i18next";
import { Form, Header, Segment, Button } from "semantic-ui-react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, AutoField } from "uniforms-semantic";
import ReactTable from "/imports/client/components/tables/ReactTable";

const schema = new SimpleSchema2Bridge(new SimpleSchema({ name: String, analysisId: String }));

let formRef;
const GeneralTab = ({ ...props }) => {
  const { scenario = {}, onSave, security } = props;
  const { canEdit } = security;

  const handleFormSubmit = ({ name, currency }) => {
    onSave({
      name,
      params: { currency }
    });
  };

  // const saveScope = (update, cb) => {
  //   const scopeUpdate = {};
  //   Object.entries(update).forEach(([k, v]) => {
  //     scopeUpdate[`scope.${k}`] = v;
  //   });
  //   debug({ scopeUpdate });
  //   onSave(scopeUpdate, cb);
  // };

  return (
    <>
      <Segment padded="very" className="options" data-test="optionsSegment">
        <AutoForm
          disabled={!canEdit}
          schema={schema}
          model={{ name: scenario?.name }}
          onSubmit={handleFormSubmit}
          ref={ref => {
            formRef = ref;
          }}
        >
          <Form.Group>
            <AutoField name="name" label="Name" className="ten wide" />
          </Form.Group>
        </AutoForm>
        {canEdit && (
          <Segment
            as="footer"
            content={
              <div>
                <Button
                  primary
                  content={<Trans i18nKey="form.save" />}
                  onClick={() => formRef.submit()}
                  data-test="saveOptions"
                />
              </div>
            }
          />
        )}
      </Segment>
      <Segment padded="very" data-test="reference">
        <Header as="h4" content="Summary" />
        <ReactTable
          columns={[
            { accessor: "scenario", Header: "Name" },
            { accessor: "carrierCount", Header: "# partners" },
            { accessor: "totalCost", Header: "Total" },
            { accessor: "volume", Header: "Volume" }
          ]}
          data={[
            { scenario: "single", carrierCount: 1, totalCost: 1300000, volume: "100%" },
            { scenario: "overall", carrierCount: 5, totalCost: 1200000, volume: "100%" },
            { scenario: "Limit 2 carriers", carrierCount: 2, totalCost: 1400000, volume: "95%" }
          ]}
        />
      </Segment>
    </>
  );
};

export default GeneralTab;
