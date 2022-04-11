import React from "react";
import { Trans } from "react-i18next";
import { Message, Icon, Button } from "semantic-ui-react";
import { AutoForm, BoolField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { TenderNDASchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/tender";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

// this block allows to set the requirements, used by the tender owner
// if the account is tender participant -> render the fields as a form

const schema = new SimpleSchema2Bridge(TenderNDASchema);

let NDAFormRef;
const TenderNDAOptions = ({ ...props }) => {
  const { tender = {}, onSave } = props;
  return (
    <>
      <AutoForm
        schema={schema}
        model={tender?.params?.NDA}
        ref={ref => {
          NDAFormRef = ref;
        }}
        onSubmit={data => onSave({ "params.NDA": data })}
      >
        <BoolField name="required" label="Enforce bidders to sign an NDA" />
      </AutoForm>
      <Message info>
        <Icon name="info" />
        The standard NDA template can be found here using this{" "}
        <a
          href="https://files.transmate.eu/support/basic%20NDA%20tender.pdf"
          target="_blank"
          rel="noreferrer"
        >
          link
        </a>
      </Message>
    </>
  );
};

const TenderNDARequirementSection = ({ ...props }) => {
  return (
    <IconSegment
      name="NDA"
      icon="file outline"
      title={<Trans i18nKey="tender.NDA.title" />}
      body={<TenderNDAOptions {...props} />}
      footer={
        <Button
          primary
          onClick={() => NDAFormRef.submit()}
          content={<Trans i18nKey="form.save" />}
        />
      }
    />
  );
};

export default TenderNDARequirementSection;
