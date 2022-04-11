import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { Rating } from "semantic-ui-react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import Card from "./Card.jsx";

export default {
  title: "Components/directoryCard"
};

export const card = () => {
  const props = {
    account: {
      id: "test",
      description: "some text"
    }
  };

  return (
    <MockedProvider>
      <PageHolder main="AccountPortal">
        <Card {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

export const rating = () => {
  return (
    <PageHolder main="AccountPortal">
      <Rating icon="star" rating={0} onRate={() => {}} />
    </PageHolder>
  );
};
