import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "semantic-ui-react";
import { ConfirmComponent } from "/imports/client/components/modals";

// renders 3 buttons for documents & corresponding actions
const DocumentViewActions = ({ ...props }) => {
  const [show, showConfirm] = useState(false);

  return (
    <>
      <Button.Group floated="right" size="small" basic>
        <Button as="a" icon="eye" href={props.link} target="_blank" rel="noreferrer" />
        {!props.download?.hidden && (
          <Button as="a" icon="download" href={props.link} target="doc" rel="noreferrer" />
        )}
        {!props.delete?.hidden && (
          <>
            <Button
              as="a"
              disabled={props.delete.disabled}
              icon="trashs"
              onClick={() => showConfirm(true)}
            />
            <ConfirmComponent
              show={show}
              showConfirm={showConfirm}
              onConfirm={() =>
                props.delete.action({ documentId: props.ref?.id }, () => showConfirm(false))
              }
            />
          </>
        )}
      </Button.Group>
    </>
  );
};

DocumentViewActions.propTypes = {
  ref: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string
  }),
  link: PropTypes.string,
  download: PropTypes.shape({
    disabled: PropTypes.bool,
    hidden: PropTypes.bool
  }),
  delete: PropTypes.shape({
    disabled: PropTypes.bool,
    action: PropTypes.func,
    hidden: PropTypes.bool
  })
};
