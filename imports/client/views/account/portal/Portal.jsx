import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Container, Segment, Grid, Image } from "semantic-ui-react";
import client from "/imports/client/services/apollo/client"; // root -> required
import { GET_PORTAL_DATA, UPDATE_PORTAL_DATA } from "./utils/queries";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import ProfileGeneralBanner from "../profile/sections/Banner";
import { ProfileForm, UserPane, NotificationPane } from "./components";
import { portalPropType } from "./utils/propTypes";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("accountPortal");

let formRef;
export const AccountPortal = ({ ...props }) => {
  const { profile, activeUser, notifications } = props;
  const { banner, logo } = profile || {};

  return (
    <div style={{ height: "100vh", display: "block", position: "relative", overflow: "auto" }}>
      <Container>
        <Grid columns={2} stackable>
          <Grid.Row columns="equal">
            <Grid.Column>
              <Image
                src="https://assets.transmate.eu/app/logo_transmate_transparent_full.png"
                centered
                size="small"
              />
            </Grid.Column>
            <Grid.Column
              computer={4}
              largeScreen={3}
              widescreen={3}
              only="computer large screen widescreen"
            />
          </Grid.Row>
          <Grid.Row columns="equal">
            <Grid.Column>
              {logo ? (
                <div>
                  <ProfileGeneralBanner {...{ banner, logo }} />
                </div>
              ) : (
                <Segment padded="very" content={<h3>{profile.name}</h3>} />
              )}
            </Grid.Column>
            <Grid.Column
              computer={4}
              largeScreen={3}
              widescreen={3}
              only="computer large screen widescreen"
            />
          </Grid.Row>
          <Grid.Row columns="equal">
            <Grid.Column>
              <Segment
                padded="very"
                content={
                  <ProfileForm
                    {...props}
                    getRef={ref => {
                      formRef = ref;
                    }}
                  />
                }
              />
              <div style={{ fontSize: "0.733rem", marginTop: "-15px" }}>
                <a href="https://www.transmate.eu">www.transmate.eu</a>
                {" | "}
                <a href="https://www.transmate.eu/legal/privacy">Privacy policy</a>
                {" | "}
                <a href="https://www.transmate.eu/legal/terms-of-use">Terms of use</a>
              </div>
            </Grid.Column>

            <Grid.Column computer={4} largeScreen={3} widescreen={3}>
              <UserPane contact={activeUser} onClickSave={() => formRef.submit()} />
              <NotificationPane notifications={notifications} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </div>
  );
};

const AccountPortalLoader = () => {
  const { params, queryParams } = useRoute();
  const { id } = params;
  const { userKey } = queryParams;
  const [notifications, setNotifications] = useState();
  const { data = {}, loading, error } = useQuery(GET_PORTAL_DATA, {
    client,
    variables: { input: { id, userKey } },
    fetchPolicy: "no-cache",
    errorPolicy: "all"
  });
  debug("userKey %s", userKey);
  debug("AccountPortalLoader: %o", id, { data, loading, error });

  const [updatePortalData] = useMutation(UPDATE_PORTAL_DATA, { client });

  if (error) console.error({ error });
  const { canEdit, activeUser, profile } = data.result || {};

  if (loading) return <Loader loading />;
  if (!profile) return <p>Could not find profile</p>;

  async function onSave(updates, cb) {
    debug("saving data updates:%o, canEdit:%s", updates, canEdit);
    if (!canEdit) return;
    try {
      const { error } = await updatePortalData({
        variables: {
          input: {
            id,
            userKey,
            updates
          }
        }
      });
      if (error) throw error;
      setNotifications({ lastSave: new Date() });
    } catch (error) {
      console.error(error);
      setNotifications({ error });
    }
    if (typeof cb === "function") cb();
  }

  return <AccountPortal {...{ profile, canEdit, activeUser, onSave, notifications }} />;
};

AccountPortal.propTypes = {
  ...portalPropType
};

export default AccountPortalLoader;
