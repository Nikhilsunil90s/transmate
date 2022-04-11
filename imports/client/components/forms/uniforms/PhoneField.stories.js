/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { AutoForm, SubmitField } from "uniforms-semantic";

import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import PageHolder from "../../utilities/PageHolder";
import PhoneField from "./PhoneInput.jsx";

export default {
  title: "Components/Forms/PhoneField"
};

const dummyProps = {
  data: { phone: undefined },
  onSubmitForm: console.log,
  phoneProps: {
    enableSearch: true,
    onlyCountries: undefined,
    disabled: false,
    id: undefined
  }
};

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    phone: {
      type: String,
      optional: true
    }
  })
);

// as part of a uniforms:
export const basic = () => {
  const { t } = useTranslation();
  const { data, onSubmitForm, phoneProps } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm model={data} schema={schema} onSubmit={onSubmitForm}>
        <PhoneField
          name="phone"
          label={t("account.profile.contacts.phone")}
          {...phoneProps}
        />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};
