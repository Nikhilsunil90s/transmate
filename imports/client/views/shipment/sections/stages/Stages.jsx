import React, { useContext } from "react";
import LoginContext from "/imports/client/context/loginContext";
import StageSection from "./Stage.jsx";
import { tabProptypes } from "../../utils/propTypes";
import { runSecurityChecks } from "./utils/security";

const ShipmentStagesSection = ({ ...props }) => {
  const curLogin = useContext(LoginContext);
  const { shipment } = props;
  const stages = shipment?.stages || [];

  return (
    <section className="stages">
      {stages.map(stage => {
        const stageSecurity = runSecurityChecks({ stage, shipment, stages, context: curLogin });
        return <StageSection key={stage.id} {...props} {...{ stage, stageSecurity }} />;
      })}
    </section>
  );
};

ShipmentStagesSection.propTypes = tabProptypes;

export default ShipmentStagesSection;
