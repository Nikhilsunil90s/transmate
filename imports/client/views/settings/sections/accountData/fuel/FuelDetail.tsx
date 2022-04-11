import React, { useContext } from "react";
import { useMutation, useQuery } from "@apollo/client";

import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import { Container, Button, Segment, Grid } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import useRoute from "/imports/client/router/useRoute";

import { GET_FUEL_INDEX, UPDATE_FUEL_INDEX } from "./utils/queries";
import { FuelPeriod } from "./fuel.d";
import PeriodForm from "./components/PeriodForm";
import Footer from "./components/Footer";
import { initializeSecurity } from "./utils/security";
import LoginContext from "/imports/client/context/loginContext";
import PeriodChart from "./components/PeriodChart";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";

const debug = require("debug")("fuel");

let formRef;
const FuelDetailLoader = () => {
  const context = useContext(LoginContext);
  const {
    params: { fuelIndexId }
  } = useRoute();
  const { data = {}, loading, error } = useQuery(GET_FUEL_INDEX, {
    variables: { fuelIndexId }
  });
  const [updateFuelIndex] = useMutation(UPDATE_FUEL_INDEX);
  debug("fuel data %o", { data, loading, error });

  const canEditFuelIndex = initializeSecurity({
    context,
    fuelAccountId: data.fuelIndex?.accountId
  });

  function onSaveFuel(updates: { description: string; periods: FuelPeriod[] }) {
    debug("updates", updates);
    updateFuelIndex({
      variables: {
        input: {
          fuelIndexId,
          updates
        }
      }
    })
      .then(() => {
        toast.success("Fuel saved");
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save fuel");
      });
  }

  const fuelIndex = removeEmpty(data.fuelIndex);

  return (
    <>
      <Container fluid>
        {/* @ts-ignore */}
        <IconSegment
          title="Fuel"
          icon="tint"
          loading={loading}
          body={
            data.fuelIndex ? (
              <Grid columns={2}>
                <Grid.Row>
                  <Grid.Column>
                    <PeriodForm
                      forwardRef={ref => {
                        formRef = ref;
                      }}
                      fuelIndex={data.fuelIndex}
                      onSave={onSaveFuel}
                      locked={!canEditFuelIndex}
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <Segment>
                      <PeriodChart fuelIndex={data.fuelIndex} />
                    </Segment>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            ) : null
          }
          footer={
            canEditFuelIndex ? (
              <div>
                <Button
                  primary
                  content={<Trans i18nKey="form.save" />}
                  onClick={() => formRef.submit()}
                />
              </div>
            ) : (
              undefined
            )
          }
        />
      </Container>
      <Footer />
    </>
  );
};

export default FuelDetailLoader;
