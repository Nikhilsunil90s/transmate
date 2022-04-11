import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import { Dimmer, Loader } from "semantic-ui-react";

const DimmingTextLoader = ({ loading, text }) => {
  const [ld, setLd] = useState(false);

  // delay the loader as apollo may take a few milliseconds to fetch from cache
  useEffect(() => {
    const timer = window.setTimeout(() => setLd(loading), 200);
    return () => window.clearTimeout(timer);
  });

  return ld ? (
    <Dimmer inverted active>
      <Loader inverted active>
        {text || <Trans i18nKey="general.loading" />}
      </Loader>
    </Dimmer>
  ) : null;
};

DimmingTextLoader.propTypes = {
  loading: PropTypes.bool,
  text: PropTypes.string
};
export default DimmingTextLoader;
