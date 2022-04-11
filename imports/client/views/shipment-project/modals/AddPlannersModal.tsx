import { useQuery } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import gql from "graphql-tag";
import React, { useState } from "react";
import { Button, Grid } from "semantic-ui-react";
import {
  ModalComponent,
  ModalActions
} from "/imports/client/components/modals";
import { AutoForm } from "uniforms-semantic";
import { SelectField } from "/imports/client/components/forms/uniforms";
import addPlannerSchema from "../schema/addPlanner.schema";

const GET_GENERAL_PLANNERS = gql`
  query getAccountPlanners {
    generalPlanners: getAccountPlanners {
      id
      name
    }
  }
`;

const AddPlannersModal = props => {
  const { t } = useTranslation();
  const { addPlanner, disabled } = props;
  const currentPlanners = props.currentPlanners || [];

  let formRef;

  const [show, showModal] = useState<boolean>(false);

  const { data = {} } = useQuery(GET_GENERAL_PLANNERS, {
    fetchPolicy: "no-cache"
  });

  const { generalPlanners = [] } = data;

  const alPlannersIds = generalPlanners.map(p => p.id);
  const plannersOption = alPlannersIds.filter(
    plannerId => !currentPlanners.map(p => p.id).includes(plannerId)
  );

  const handleSubmit = ({ planner }) => {
    const newPlanner = generalPlanners.find(p => p.id === planner);
    addPlanner(newPlanner, () => showModal(false));
  };

  return (
    <>
      <ModalComponent
        size="small"
        show={show}
        showModal={showModal}
        title="Add Planner"
        body={
          <AutoForm
            schema={addPlannerSchema}
            onSubmit={handleSubmit}
            ref={ref => {
              formRef = ref;
            }}
          >
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <SelectField
                    name="planner"
                    allowedValues={plannersOption}
                    transform={plannerId => {
                      const planner = generalPlanners.find(
                        p => p.id === plannerId
                      );
                      return planner.name;
                    }}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </AutoForm>
        }
        actions={
          <ModalActions
            {...{
              showModal,
              saveLabel: t("conversations.modal.submit"),
              onSave: () => formRef.submit()
            }}
          />
        }
      />
      <Button
        basic
        disabled={disabled}
        onClick={() => showModal(true)}
        content={<Trans i18nKey="form.add" />}
      />
    </>
  );
};

export default AddPlannersModal;
