import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import React from "react";
import {
  ProfileControlSection,
  ProfilePackageSection,
  ProfileBidControlSection
} from "../segments";
import { mutate } from "/imports/utils/UI/mutate";
import { GENERATE_PACKAGES } from "../utils/queries";

const debug = require("debug")("tender:tab:profile");

const TenderProfileTab = ({ ...props }) => {
  const client = useApolloClient();
  const { tender } = props;

  const regenerateProfile = () => {
    toast.info("Generating your tender profile...");
    debug("call tender.packages", { tenderId: props.tender?.id });
    mutate(
      {
        client,
        query: {
          mutation: GENERATE_PACKAGES,
          variables: { tenderId: tender.id }
        }
      },
      () => toast.info("finished, refreshing data...")
    );
  };

  return (
    <>
      <ProfileBidControlSection {...props} />
      <ProfileControlSection {...props} {...{ regenerateProfile }} />
      <ProfilePackageSection {...props} {...{ regenerateProfile }} />
    </>
  );
};

export default TenderProfileTab;
