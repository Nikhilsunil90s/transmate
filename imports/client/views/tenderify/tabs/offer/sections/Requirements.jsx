import React from "react";
import { List } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

const TenderifySectionRequirements = ({ ...props }) => {
  const { tenderBid } = props;
  return (
    <IconSegment
      name="requirements"
      icon="hand point right outline"
      title="Requirements"
      footerButton="footerButton"
      body={
        tenderBid.requirements ? (
          <List divided>
            {tenderBid.requirements.map((requirement, i) => (
              <List.Item key={`requirement-${i}`}>
                <List.Content>
                  <List.Header content={requirement.title} />
                  <List.Description>
                    {requirement.details}
                    {requirement.response && (
                      <>
                        <br />
                        {requirement.response.value}
                        <br />
                        {requirement.response.comment}
                      </>
                    )}
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        ) : (
          <p>No requirements added</p>
        )
      }
    />
  );
};

export default TenderifySectionRequirements;
