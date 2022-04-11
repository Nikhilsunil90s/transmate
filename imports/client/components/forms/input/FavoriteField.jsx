import React, { useState } from "react";
import { Rating } from "semantic-ui-react";

// TODO remove npm package once the semantic library has fix!!!
// this is a temporary fix for the rating component
import "semantic-ui-css/components/rating.css";

const FavoriteField = ({ isFavorite: initial, addToFavorites }) => {
  const [isFavorite, setFavorite] = useState(initial);

  const toggleFavorite = () => {
    addToFavorites(!isFavorite);
    setFavorite(!isFavorite);
  };

  return <Rating icon="star" rating={isFavorite ? 1 : 0} onRate={toggleFavorite} />;
};

export default FavoriteField;
