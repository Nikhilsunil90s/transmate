import React from "react";
import { useQuery } from "@apollo/client";
import { Segment, Image } from "semantic-ui-react";
import { GET_PARTNER_ASIDE } from "./utils/queries";
import useRoute from "../../router/useRoute";

const PartnerDetails = () => {
  const { params } = useRoute();
  const partnerId = params._id;
  const { data = {}, loading, error } = useQuery(GET_PARTNER_ASIDE, {
    variables: { partnerId }
  });
  if (error) console.error(error);

  const logo = data.account?.logo;
  return (
    <>
      <Segment padded="very" basic loading={loading}>
        {logo && <Image size="medium" bordered rounded src={logo} />}
      </Segment>

      <Segment as="footer" />
    </>
  );
};

export default PartnerDetails;
