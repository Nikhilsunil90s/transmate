import React from "react";
import { Rating } from "semantic-ui-react";
import { connectField } from "uniforms";

// TODO remove npm package once the semantic library has fix!!!
// this is a temporary fix for the rating component
import "semantic-ui-css/components/rating.css";

const MAX_RATING = 5;

/** @param {{onChange: (newRating: number)=> void, rating?: number, maxRating?: number, canEdit?: boolean}} param0 */
export const RatingField = ({ onChange, rating = 0, maxRating = MAX_RATING, canEdit }) => {
  return (
    <Rating
      icon="star"
      disabled={!canEdit}
      maxRating={maxRating}
      rating={rating}
      size="mini"
      onRate={(e, { rating: newRating }) => onChange(newRating)}
    />
  );
};

export default connectField(RatingField);
