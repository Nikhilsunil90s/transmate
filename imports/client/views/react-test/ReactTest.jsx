/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Button, Header, Modal } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import client from "../../services/apollo/client";

const debug = require("debug")("reacttest");

const rootEl = document.getElementById("react-root");

const QUERY = gql`
  query getCurrentUserForTest {
    getCurrentUser {
      id
    }
  }
`;

const ReactTest = () => {
  const { data, loading, error } = useQuery(QUERY, { client, fetchPolicy: "no-cache" });
  debug("data, loading, error", data, loading, error);

  return (
    <div>
      <p>React Test Successful</p>

      <button type="submit" className="ui button primary">
        button without semantic library
      </button>

      <Button primary>button with semantic library</Button>

      <SampleModal />
    </div>
  );
};

const SampleModal = () => {
  return (
    <Modal trigger={<Button>Test Modal</Button>} mountNode={rootEl}>
      <Modal.Header>Header for modal</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Modal Description header</Header>
          <p>
            This is the Modal content. We've found the following gravatar image associated with your
            e-mail address.
          </p>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

export default ReactTest;
