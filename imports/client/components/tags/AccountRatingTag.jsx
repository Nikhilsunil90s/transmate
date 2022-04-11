import { useQuery, gql } from "@apollo/client";
import React from "react";
import ReactStars from "react-rating-stars-component";

const GET_PARTNER_RATING = gql`
  query getPartnerForRating($partnerId: String!) {
    partner: getPartner(partnerId: $partnerId) {
      id
      annotation {
        ratings {
          average
        }
      }
    }
  }
`;

/** @param {{partnerId: string}} param0*/
const AccountRatingTag = ({ partnerId }) => {
  const { data = {} } = useQuery(GET_PARTNER_RATING, {
    variables: { partnerId },
    fetchPolicy: "cache-first"
  });
  const rating = data.partner?.annotation?.ratings?.average || null;

  return (
    rating && (
      <>
        <div className="ratingWrapper">
          <div className="starRating">
            <ReactStars
              count={5}
              value={rating}
              isHalf
              edit={false}
              size={20}
              activeColor="#ffd700"
              classNames="partnerRating"
            />
          </div>
          ({rating})
        </div>
      </>
    )
  );
};

export default AccountRatingTag;
