import React, { useContext } from "react";
import { gql, useQuery } from "@apollo/client";
import get from "lodash.get";
import { Flag } from "semantic-ui-react";
import { connectField } from "uniforms";
import { SelectField } from "./SelectField";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("entities");

const GET_ENTITIES = gql`
  query getOwnAccountForEntitiesSelection {
    account: getOwnAccount {
      id
      entities {
        code
        name
        address
        zipCode
        city
        country
        UID
        registrationNumber
        EORI
        VAT
        email
      }
    }
  }
`;

/** getSelectableEntities
 * if user has entities set -> only view these.
 * if user has no entities set -> view all the account entities
 * (some account do not use the entity role assignment)
 */
function getSelectableEntities(accountEntities, ownEntities) {
  if (ownEntities.length) {
    return accountEntities.filter(({ code }) => ownEntities.includes(code));
  }
  return accountEntities;
}

const EntityFieldLoader = ({ ...props }) => {
  const { entities: ownEntities } = useContext(LoginContext);
  const { data, loading, error } = useQuery(GET_ENTITIES);
  debug("entities data %o", { data, loading, error });
  const accountEntities = get(data, "account.entities") || [];
  const selectableEntities = getSelectableEntities(accountEntities, ownEntities);
  const entitiesEnabled = selectableEntities.length > 0;

  return (
    <SelectField
      {...props}
      className="entityField"
      label={props.label}
      loading={loading}
      disabled={!entitiesEnabled}
      search
      selection
      options={selectableEntities.map(({ code, name, country }) => ({
        key: code,
        value: code,
        text: code,
        content: (
          <>
            {country && <Flag name={country.toLowerCase()} />}
            {code}
            <span style={{ opacity: 0.5 }}> - {name}</span>
          </>
        )
      }))}
    />
  );
};

export default connectField(EntityFieldLoader);
