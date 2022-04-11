import React from "react";
import { Card, Button } from "semantic-ui-react";

const CarrierItem = ({ carrier, onClick }) => {
  const { name, shipments } = carrier;

  const handleClick = () => {
    onClick(shipments, name);
  };

  return (
    <>
      <Card link fluid color="blue" onClick={handleClick} className="ts-manifest-card">
        <Card.Content>
          <div className="ts-manifest__col-row">
            <h1>{name}</h1>
            <div>
              <Button content={shipments.length} basic size="huge" primary />
            </div>
          </div>
        </Card.Content>
      </Card>
    </>
  );
};

export default CarrierItem;
