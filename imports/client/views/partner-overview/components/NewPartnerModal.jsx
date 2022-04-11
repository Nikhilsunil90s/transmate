import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import pick from "lodash.pick";
import { useLazyQuery, useApolloClient, gql } from "@apollo/client";
import { AutoForm, AutoField, ErrorsField, BoolField } from "uniforms-semantic";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Grid, Dropdown, Form } from "semantic-ui-react";
import { SelectField } from "/imports/client/components/forms/uniforms";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { getType } from "/imports/api/allAccounts/services/getAccountType";
import { mutate } from "/imports/utils/UI/mutate";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("partners:new");

const INVITE_ACCOUNT = gql`
  mutation inviteAccount($input: AccountInviteInput!) {
    account: inviteAccount(input: $input) {
      id
      name
    }
  }
`;

const CREATE_PARTNER = gql`
  mutation createPartnershipInPartnerModal($partnerId: String!) {
    account: createPartnership(partnerId: $partnerId) {
      id
      name
    }
  }
`;

//#region components
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    company: { type: String },
    partnerId: { type: String, optional: true },
    isAddingNew: { type: Boolean, optional: true },
    isSelected: { type: Boolean, optional: true },
    sendInvite: { type: Boolean, optional: true },
    email: { type: String, regEx: SimpleSchema.RegEx.EmailWithTLD, optional: true }, // if send invite flag
    firstName: { type: String, optional: true }, // if send invite flag
    lastName: { type: String, optional: true }, // if send invite flag
    type: { type: String, allowedValues: ["shipper", "carrier", "provider"] },
    role: { type: String, optional: true, allowedValues: ["warehouse", "forwarder", "customs"] }
  })
);

const SEARCH = gql`
  query searchPartner($query: String) {
    searchPartner(query: $query) {
      accountId
      name
    }
  }
`;

let formRef;
const NewPartnerSubForm = ({ visible, type, noEmail }) => {
  const { t } = useTranslation();
  return (
    <>
      <Grid columns={2} style={{ marginTop: "2em", visibility: visible ? "visible" : "hidden" }}>
        <Grid.Row className="add-partner" style={visible ? {} : { visibility: "hidden" }}>
          <Grid.Column className="info">
            <h3>
              <Trans i18nKey="partner.invite.title" />
            </h3>
            {noEmail ? (
              <div>
                <Trans i18nKey="partner.invite.description2" />
              </div>
            ) : (
              <>
                <BoolField name="sendInvite" label={t("partner.invite.send")} />
                <div>
                  <Trans i18nKey="partner.invite.description" values={{ value: "name" }} />
                </div>
              </>
            )}
          </Grid.Column>
          <Grid.Column className="input">
            {!type && (
              <>
                <SelectField
                  name="type"
                  label={t("partner.invite.type")}
                  transform={key => <Trans i18nKey={`partner.invite.types.${key}`} />}
                />
                {type === "provider" && (
                  <SelectField
                    name="role"
                    label={t("partner.invite.role")}
                    transform={key => <Trans i18nKey={`partner.invite.roles.${key}`} />}
                  />
                )}
              </>
            )}

            <AutoField name="firstName" label={t("partner.invite.name")} />
            <AutoField name="lastName" label={t("partner.invite.name")} />
            <AutoField name="email" label={t("partner.invite.email")} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <ErrorsField />
    </>
  );
};

const LinkPartnerInfo = () => (
  <Grid columns={2} style={{ marginTop: "2em" }}>
    <Grid.Row className="existing-partner">
      <Grid.Column className="info" style={{ marginBottom: "1em" }}>
        <h3>
          <Trans i18nKey="partner.link.title" />
        </h3>
        <div>
          <Trans i18nKey="partner.link.description" />
        </div>
      </Grid.Column>
      <Grid.Column />
    </Grid.Row>
  </Grid>
);

const initialState = { addedOption: [], value: "" };
const SearchField = () => {
  const { t } = useTranslation();
  const [state, setState] = useState(initialState);
  const [fetchQuery, { loading, data: searchData = {} }] = useLazyQuery(SEARCH, {
    fetchPolicy: "no-cache"
  });

  const handleSearchChange = (e, { searchQuery }) => {
    setState({ ...state, value: searchQuery });

    // server search:
    fetchQuery({ variables: { query: searchQuery } });
  };

  function onAddItem(e, { value }) {
    formRef.change("company", value);
    formRef.change("isAddingNew", true);
    formRef.change("isSelected", true);
    setState({
      ...state,
      addedOption: [{ value, text: value }],
      isAddingNew: true,
      isSelected: true
    });
  }
  function onSelect(e, { value: accountId }) {
    const company = (searchData.searchPartner || []).find(
      partner => partner.accountId === accountId
    )?.name;
    debug("selecting existing %s, company %s", accountId, company);
    formRef.change("partnerId", accountId);
    formRef.change("company", company);
    formRef.change("isSelected", true);
    setState({
      ...state,
      value: accountId,
      type: getType({ accountId }),
      isSelected: true
    });
  }

  debug("search data", searchData);
  const searchResults = (searchData.searchPartner || []).map(({ accountId, name }) => ({
    value: accountId,
    content: (
      <>
        {name}
        <span style={{ opacity: 0.5 }}> &mdash; {accountId}</span>
      </>
    ),
    text: name
  }));
  return (
    <Form.Field>
      <label>
        <Trans i18nKey="partner.name" />
      </label>
      <Dropdown
        search
        selection
        fluid
        allowAdditions
        minCharacters={2}
        options={[...searchResults, ...state.addedOption]}
        onSearchChange={debounce(handleSearchChange, 500, { leading: true })}
        loading={loading}
        disabled={state.isSelected}
        onAddItem={onAddItem}
        onChange={onSelect}
        value={state.value}
        placeholder={t("search.placeholder")}
      />
    </Form.Field>
  );
};

// create:
// type, role, company, sendInvite, email, email,name
export const PartnerForm = ({ onSubmitForm }) => {
  const [state, setState] = useState({});

  const showLinkPartner = state.isSelected && !state.isAddingNew;
  const showInvitePartner = state.isSelected && !!state.isAddingNew;

  return (
    <AutoForm
      schema={schema}
      model={{ type: "carrier" }}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
      onChangeModel={model => {
        setState(pick(model, ["isSelected", "isAddingNew"]));
      }}
    >
      <SearchField />
      {showLinkPartner && <LinkPartnerInfo />}
      {<NewPartnerSubForm visible={showInvitePartner} />}
    </AutoForm>
  );
};
//#endregion

// flow:
// 1. enter name (search in background) -> if select match -> render second block
// either we find an existing one -> linking
// either we add a new one -> invite

const PartnerModal = ({ ...props }) => {
  const client = useApolloClient();
  const { show, showModal } = props;
  const { goRoute } = useRoute();

  const onSubmitForm = ({ isAddingNew, isSelected, partnerId, ...partnerData }) => {
    if (isAddingNew) {
      // action for adding a new partner
      mutate(
        {
          client,
          query: {
            variables: { input: partnerData },
            mutation: INVITE_ACCOUNT
          },
          successMsg: "Partner linked",
          errorMsg: "Could not link partner"
        },
        data => {
          const partner = data?.account;
          if (!partner.id) throw new Error("No id returned from mutation");
          goRoute("partner", { _id: partner.id });
          showModal(false);
        }
      );
    } else {
      // action for linking a new partner
      mutate(
        {
          client,
          query: {
            variables: { partnerId },
            mutation: CREATE_PARTNER
          },
          successMsg: "Partner linked",
          errorMsg: "Could not link partner"
        },
        data => {
          const partner = data?.account;
          if (!partner.id) throw new Error("No id returned from mutation");
          goRoute("partner", { _id: partner.id });
          showModal(false);
        }
      );
    }
  };

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="partner.title" />}
      body={<PartnerForm {...{ onSubmitForm }} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

export default PartnerModal;
