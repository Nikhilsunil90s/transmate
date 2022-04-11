import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import classNames from "classnames";
import { Trans } from "react-i18next";
import { useQuery, useApolloClient, useMutation } from "@apollo/client";
import groupBy from "lodash.groupby";
import { AutoField, AutoForm } from "uniforms-semantic";
import { Button, Grid, Container, Form, Header, Icon, List } from "semantic-ui-react";

import { LocationTag, UserListItemTag, PartnerListItemTag } from "/imports/client/components/tags";
import {
  AutoCompleteField,
  SelectField,
  DateField,
  CurrencyAmountField
} from "../../../components/forms/uniforms";
import generalTabSchema from "../schema/generalTab.schema";
import AddPlannersModal from "../modals/AddPlannersModal";
import Loader from "/imports/client/components/utilities/Loader";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import {
  EDIT_SHIPMENT_PROJECT,
  GET_ACCOUNT_SETTINGS,
  REFRESH_PARTNERS,
  EDIT_SHIPMENT_PROJECT_LOCATION
} from "../utils/queries";
import AddressModal from "/imports/client/components/modals/specific/AddressSelect";
import { mutate } from "/imports/utils/UI/mutate";
import { tabPropTypes } from "../utils/propTypes";
import useRoute from "/imports/client/router/useRoute";
import { PROJECT_STATUS_OPTIONS } from "/imports/api/_jsonSchemas/simple-schemas/collections/shipment-projects";
import LoginContext from "/imports/client/context/loginContext";

const getIdAndName = ({ id, name }) => ({ id, name });

const convertedProjectCodeToTitleAndValue = ({ group, code }) => ({
  value: code,
  title: `${group} - ${code}`,
  group
});

const prepareProjectCodesForSelectField = (projectCodes = []) => {
  const groupedProjectCodes = groupBy(projectCodes, "group");
  const projectCodeGroups = Object.keys(groupedProjectCodes);

  return projectCodeGroups.map(projectCodeGroup => {
    const projectCodesGrouped = groupedProjectCodes[projectCodeGroup];
    const results = projectCodesGrouped.map(convertedProjectCodeToTitleAndValue);
    return { name: projectCodeGroup, results };
  });
};

const GeneralTab = ({ project, canEdit, loading }) => {
  const { params } = useRoute();
  let formRef;
  const client = useApolloClient();
  const [show, showModal] = useState();
  const { userId } = useContext(LoginContext);
  const [editShipmentProject] = useMutation(EDIT_SHIPMENT_PROJECT);
  const projectId = params._id;
  const currentPartners = (project.partners || []).map(getIdAndName);
  const currentPlanners = (project.planners || []).map(getIdAndName);
  const { data: accData = {}, error } = useQuery(GET_ACCOUNT_SETTINGS, {
    fetchPolicy: "no-cache"
  });
  const { projectCodes = [], projectYears = [] } = accData.accountSettings || {};

  const projectCodeOptions = prepareProjectCodesForSelectField(projectCodes);
  const statusOptions = PROJECT_STATUS_OPTIONS;

  const projectType = project && project.type;

  const handleSubmitGeneral = ({ year, type, title, status, eventDate, attendees, budget }) => {
    const existingType = projectCodes.find(p => p.code === type);
    mutate({
      client,
      query: {
        mutation: EDIT_SHIPMENT_PROJECT,
        variables: {
          input: {
            projectId,
            year,
            type: {
              code: existingType.code,
              group: existingType.group,
              name: existingType.name
            },
            title,
            status,

            // info:
            eventDate,
            attendees,
            budget
          }
        }
      },
      successMsg: "Successfully edited shipment project",
      errorMsg: "Error editing shipment project"
    });
  };

  function refreshPartners() {
    mutate({
      client,
      query: {
        mutation: REFRESH_PARTNERS,
        variables: { shipmentProjectId: projectId }
      },
      successMsg: "Partners refreshed",
      errorMsg: "Could not reload partners"
    });
  }

  function handlePlannerChanges(updatedPlanners = [], callback) {
    editShipmentProject({
      variables: {
        input: {
          projectId,
          planners: updatedPlanners
        }
      }
    })
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        callback && callback();
        toast.success("Planners updated");
      })
      .catch(() => toast.error("Could not update planners"));
  }

  /**
   * @param {{id: string, name: string}} param0
   * @param {Function} param1
   */
  const addPlanner = ({ id, name }, callback) => {
    currentPlanners.push({ id, name });
    handlePlannerChanges(currentPlanners, callback);
  };

  /** @param {{location: {id: string, type: "address" | "location" }}} param0 */
  const setAddress = ({ location: updatedLocation }) => {
    mutate(
      {
        client,
        query: {
          mutation: EDIT_SHIPMENT_PROJECT_LOCATION,
          variables: {
            input: {
              projectId,
              location: updatedLocation
            }
          }
        },
        successMsg: "Location saved",
        errorMsg: "Could not save location"
      },
      () => showModal(false)
    );
  };

  const onRemovePlanner = ({ userId: idToRemove }, callback) => {
    const updatedPlanners = currentPlanners.filter(({ id }) => id !== idToRemove);
    handlePlannerChanges(updatedPlanners, callback);
  };

  const onRemovePartner = ({ partnerId: partnerIdToRemove }, callback) => {
    const updatedPartners = currentPartners.filter(({ id }) => id !== partnerIdToRemove);
    editShipmentProject({
      variables: {
        input: {
          projectId,
          partners: updatedPartners
        }
      }
    })
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        callback && callback();
        toast.success("Partners updated");
      })
      .catch(() => toast.error("Could not update partners"));
  };

  return (
    <Container fluid>
      <IconSegment
        title={<Trans i18nKey="projects.general.title" />}
        icon="flag checkered"
        name="general"
        body={
          <>
            <Loader loading={loading} />
            <AutoForm
              schema={generalTabSchema}
              onSubmit={handleSubmitGeneral}
              ref={ref => {
                formRef = ref;
              }}
              disabled={!canEdit}
              model={{
                title: project ? project.title : "",
                type: projectType ? projectType.code : "",
                status: project ? project.status : "",
                year: project ? project.year : "",
                eventDate: project?.eventDate,
                attendees: project.attendees,
                budget: project.budget
              }}
            >
              <AutoField name="title" />
              <Form.Group widths="equal">
                <AutoCompleteField name="type" options={projectCodeOptions} category />
                <SelectField name="year" allowedValues={projectYears} />
                <SelectField name="status" allowedValues={statusOptions} />
              </Form.Group>

              <Header
                as="h4"
                dividing
                content={<Trans i18nKey="projects.general.infoTitle" />}
                style={{ marginBottom: "5px" }}
              />
              <Form.Group widths={3}>
                <DateField name="eventDate" />
                <AutoField name="attendees" />
                {/* only planner can see this */}
                {canEdit && <CurrencyAmountField label="budget" name="budget" />}
              </Form.Group>
              <Grid>
                <Grid.Row>
                  <Grid.Column className="location" width={8}>
                    <div
                      className={classNames("relative", { editable: canEdit })}
                      style={{ position: "relative" }}
                    >
                      <div className="float top right" style={{ visibility: "hidden" }}>
                        <Icon name="pencil" color="grey" onClick={() => showModal(true)} />
                        <AddressModal
                          show={show}
                          showModal={showModal}
                          title={<Trans i18nKey="projects.general.location.modal" />}
                          onSubmitForm={setAddress}
                        />
                      </div>
                      <div className="content">
                        <h4>
                          <Trans i18nKey="projects.general.location.title" />
                        </h4>
                        {project.location ? (
                          <LocationTag
                            location={project.location}
                            annotation={{ enable: true, accountId: project.accountId }}
                            options={{ lines: 3 }}
                          />
                        ) : (
                          "No location set."
                        )}
                      </div>
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </AutoForm>
          </>
        }
        footer={
          <div>
            <Button
              disabled={!canEdit || error}
              primary
              onClick={() => formRef.submit()}
              content={<Trans i18nKey="form.save" />}
            />
          </div>
        }
      />

      <IconSegment
        title={<Trans i18nKey="projects.access.title" />}
        icon="users"
        name="access"
        body={
          <Grid>
            <Grid.Row>
              <Grid.Column width={8}>
                <h4>
                  <Trans i18nKey="projects.access.planners.title" />
                </h4>
                {currentPlanners && (
                  <List>
                    {currentPlanners.map(planner => (
                      <UserListItemTag
                        key={planner.id}
                        userId={planner.id}
                        name={planner.name}
                        canRemove={canEdit && planner.id !== userId}
                        onRemoveAction={onRemovePlanner}
                      />
                    ))}
                  </List>
                )}
              </Grid.Column>
              <Grid.Column width={8}>
                {canEdit && (
                  <>
                    <h4>
                      <Trans i18nKey="projects.access.partners.title" />
                    </h4>
                    {currentPartners.length ? (
                      <List>
                        {currentPartners.map(partner => (
                          <PartnerListItemTag
                            key={partner.id}
                            accountId={partner.id}
                            name={partner.name}
                            canRemove={canEdit}
                            onRemoveAction={onRemovePartner}
                          />
                        ))}
                      </List>
                    ) : (
                      <Trans i18nKey="projects.access.partners.empty" />
                    )}
                  </>
                )}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}>
                <AddPlannersModal
                  disabled={!canEdit}
                  addPlanner={addPlanner}
                  currentPlanners={currentPlanners}
                />
              </Grid.Column>
              <Grid.Column width={8}>
                <Button
                  disabled={!canEdit || error}
                  basic
                  onClick={() => refreshPartners()}
                  content={<Trans i18nKey="projects.access.partners.refresh" />}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        }
      />
    </Container>
  );
};

GeneralTab.propTypes = tabPropTypes;

export default GeneralTab;
