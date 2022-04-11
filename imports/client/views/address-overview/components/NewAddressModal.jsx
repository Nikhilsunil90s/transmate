import React, { useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Button, Form, Input, Tab } from "semantic-ui-react";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { AddressSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/address";
import { DropdownCountryFlagField } from "/imports/client/components/forms/uniforms";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("address:modal");

const LINK_ADDRESS = gql`
  mutation linkAddress($addressId: String!, $name: String!, $update: JSONObject) {
    linkAddress(addressId: $addressId, name: $name, update: $update) {
      id
      name
      addressFormatted
    }
  }
`;

const schema = new SimpleSchema2Bridge(
  AddressSchema.pick(
    "input",
    "street",
    "number",
    "bus",
    "zip",
    "city",
    "state",
    "countryCode"
  ).extend({ name: String, notes: { type: String, optional: true }, id: String })
);

const VALIDATE_ADDRESS = gql`
  query validateAddress($input: String!) {
    address: validateAddress(input: $input) {
      id
      validated {
        by
        confidence
        isValidated
      }
      input
      street
      number
      bus
      zip
      city
      state
      country
      countryCode
      location {
        lat
        lng
      }
    }
  }
`;

const AddressPane = ({ disabled }) => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Group widths={3}>
        <AutoField
          className="eight wide"
          name="street"
          label={t("address.form.street")}
          disabled={disabled}
        />
        <AutoField name="number" label={t("address.form.number")} disabled={disabled} />
        <AutoField name="bus" label={t("address.form.bus")} disabled={disabled} />
      </Form.Group>
      <Form.Group widths={2}>
        <AutoField name="city" label={t("address.form.city")} disabled={disabled} />
        <AutoField name="zip" label={t("address.form.zip")} disabled={disabled} />
      </Form.Group>
      <Form.Group widths={2}>
        <AutoField name="state" label={t("address.form.state")} disabled={disabled} />
        <DropdownCountryFlagField
          name="countryCode"
          label={t("address.form.country")}
          disabled={disabled}
        />
      </Form.Group>
    </>
  );
};

// const NotesPane = () => (
//   <LongTextField name="notes" label={t("address.form.notes.title")} />
// );

// const MapPane = () => null;

let formRef;
export const AddressForm = ({ address, isLocked, onSubmitForm }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [state, setState] = useState({ input: "" });
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (_, { value }) => {
    setState({ ...state, input: value, canSearch: value?.length >= 3 });
  };

  const validateAddress = () => {
    if (!formRef) return;
    if (!state.canSearch) return;
    debug("searching address for input %s", state.input);
    setLoading(true);
    setDisabled(true);
    client
      .query({
        query: VALIDATE_ADDRESS,
        variables: { input: state.input },
        fetchPolicy: "no-cache"
      })
      .then(res => {
        const { data, loading: loadingQuery, error } = res || {};

        debug("address validation result %o", res);
        if (loadingQuery) return null;
        if (error) throw error;
        const addressRes = data?.address || {};

        // only go to next step when loading is finished!
        setState({ ...state, location: addressRes.location, validated: !!addressRes.validated });
        formRef.change("input", state.input);
        ["id", "street", "number", "bus", "zip", "city", "state", "country", "countryCode"].forEach(
          field => {
            if (!!addressRes[field]) {
              formRef.change(field, addressRes[field]);
            }
          }
        );
        debug("address returned");
        setDisabled(!addressRes.validated);
        return true;
      })
      .catch(error => {
        console.error(error);
        toast.error(
          "This address could not be validated. Please check for errors, or input the details manually."
        );
      })
      .finally(() => {
        debug("address loaded");
        setLoading(false);
      });
  };

  const panes = [
    {
      menuItem: t("address.form.tab.address"),
      render: () => (
        <Tab.Pane>
          <AddressPane {...{ disabled }} />
        </Tab.Pane>
      )
    }

    // {
    //   menuItem: <Trans i18nKey=`address.form.tab.notes` />,
    //   render: () => (
    //     <Tab.Pane>
    //       <NotesPane />
    //     </Tab.Pane>
    //   )
    // },
    // {
    //   menuItem: <Trans i18nKey=`address.form.tab.map` />,
    //   render: () => (
    //     <Tab.Pane>
    //       <MapPane />
    //     </Tab.Pane>
    //   )
    // }
  ];

  return (
    <AutoForm
      onChangeModel={model => debug("onChangeModel", model)}
      model={address}
      schema={schema}
      onSubmit={onSubmitForm}
      disabled={isLocked}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group widths={2}>
        <Form.Field>
          <Input
            icon="marker"
            iconPosition="left"
            value={state.input}
            loading={loading}
            placeholder={t("address.form.input")}
            onChange={handleInputChange}
          />
        </Form.Field>
        <div>
          <Button
            primary
            content="Go"
            disabled={!state.canSearch}
            onClick={e => {
              e.stopPropagation();
              validateAddress();
            }}
          />
        </div>
      </Form.Group>

      <AutoField name="name" placeholder={t("address.form.namePlaceholder")} />
      {loading ? "" : <ErrorsField />}
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    </AutoForm>
  );
};

const NewAddressModal = ({ ...props }) => {
  const { goRoute } = useRoute();
  const { show, showModal, address, isLocked, onCreated } = props;
  const [linkAddress] = useMutation(LINK_ADDRESS, {
    onCompleted(data) {
      debug("result %o", data);
      const addressId = data?.linkAddress?.id;
      if (onCreated) {
        return onCreated(data?.linkAddress);
      }

      if (addressId) {
        goRoute("address", { _id: addressId });
      } else {
        showModal(false);
      }
      return true;
    },
    onError(error) {
      console.error({ error });
      toast.error(error.message || "Could not link address");
    }
  });

  const title = !!address ? (
    <Trans i18nKey="address.form.title.edit" />
  ) : (
    <Trans i18nKey="address.form.title.add" />
  );

  const onSave = async validatedAddress => {
    debug("validated address", validatedAddress);

    // FIXME: updates are not passed in when linking:
    linkAddress({
      variables: {
        addressId: validatedAddress.id,
        name: validatedAddress.name,
        updates: {}
      }
    });
  };

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<AddressForm {...{ address, isLocked, onSubmitForm: onSave }} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

NewAddressModal.propTypes = {
  show: PropTypes.bool,
  showModal: PropTypes.func.isRequired,
  address: PropTypes.shape({
    id: PropTypes.string,
    validated: PropTypes.shape({
      by: PropTypes.string,
      confidence: PropTypes.string,
      isValidated: PropTypes.bool
    }),
    input: PropTypes.string,
    street: PropTypes.string,
    number: PropTypes.string,
    bus: PropTypes.string,
    zip: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    country: PropTypes.string,
    countryCode: PropTypes.string,
    location: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    })
  }),
  isLocked: PropTypes.bool,
  onCreated: PropTypes.func
};

export default NewAddressModal;
