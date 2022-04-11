import React from "react";
import { Trans } from "react-i18next";
import { Form, Header, Segment, Button } from "semantic-ui-react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, AutoField } from "uniforms-semantic";
import ScopeDefinition from "/imports/client/components/forms/scope/Scope.jsx";
import { CurrencySelectField } from "/imports/client/components/forms/uniforms";

const debug = require("debug")("analysis:simulation:options");

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    name: String,
    currency: String
  })
);

let formRef;
const OptionsTab = ({ ...props }) => {
  const { simulation = {}, onSave, security, analysisId } = props;
  const { canEdit } = security;

  const handleFormSubmit = ({ name, currency }) => {
    onSave({
      name,
      params: { currency }
    });
  };

  const saveScope = (update, cb) => {
    const scopeUpdate = {};
    Object.entries(update).forEach(([k, v]) => {
      scopeUpdate[`scope.${k}`] = v;
    });
    debug({ scopeUpdate });
    onSave(scopeUpdate, cb);
  };

  return (
    <>
      <Segment padded="very" className="options" data-test="optionsSegment">
        <AutoForm
          disabled={!canEdit}
          schema={schema}
          model={{ name: simulation?.name, currency: simulation?.params?.currency }}
          onSubmit={handleFormSubmit}
          ref={ref => {
            formRef = ref;
          }}
        >
          <Form.Group>
            <AutoField name="name" label="Name" className="ten wide" />
            <CurrencySelectField name="currency" label="Currency" />
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
      <Segment padded="very" data-test="scopeSegment">
        <Header as="h4" dividing content="Scope settings" />
        <ScopeDefinition
          scope={simulation.scope}
          masterType="simulation"
          masterId={analysisId}
          onSave={saveScope}
          canEdit={canEdit}
        />
      </Segment>
    </>
  );
};

export default OptionsTab;
