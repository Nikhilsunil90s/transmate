import React from "react";
import { useTranslation } from "react-i18next";
import { List, Button, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";

import WebsiteModal from "../modals/Website.jsx";
import { IconSegment } from "../../../../components/utilities/IconSegment";

let i = 1;
const WebsitesOverview = ({ sites = [] }) => {
  const { t } = useTranslation();
  const hasSites = sites.length > 0;
  return hasSites ? (
    <List bulleted>
      {sites.map(site => {
        i += 1;
        return (
          <List.Item key={i}>
            {site.name} - {site.url}
            <a href={site.url} target="_blank" rel="noopener noreferrer">
              <Icon name="external share" />
            </a>
          </List.Item>
        );
      })}
    </List>
  ) : (
    <div className="empty">{t("partner.profile.websites.empty")}</div>
  );
};

const WebsiteFooter = ({ onSave: onSaveAction, sites = [] }) => {
  const { t } = useTranslation();
  const onSave = newItem => {
    sites.push(newItem);
    onSaveAction({ sites });
  };
  return (
    <WebsiteModal onSave={onSave}>
      <Button primary icon="plus" size="mini" content={t("account.profile.website.add")} />
    </WebsiteModal>
  );
};

const ProfileWebsiteSegment = ({ canEdit, onSave, sites = [] }) => {
  const { t } = useTranslation();
  const onSaveSites = ({ sites: newSites }) => {
    onSave({ sites: newSites });
  };
  const segmentData = {
    name: "locations",
    icon: "world",
    title: t("account.profile.websites.title"),
    body: <WebsitesOverview {...{ sites, onSave: onSaveSites, canEdit }} />,
    ...(canEdit
      ? {
          footer: <WebsiteFooter {...{ onSave: onSaveSites, sites }} />
        }
      : undefined)
  };
  return <IconSegment {...segmentData} />;
};
ProfileWebsiteSegment.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  websites: PropTypes.object
};

export default ProfileWebsiteSegment;
