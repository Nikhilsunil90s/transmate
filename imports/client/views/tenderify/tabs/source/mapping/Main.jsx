import React, { useContext, useState } from "react";
import { Trans } from "react-i18next";
import { Accordion, Menu, Segment, Button, Label, Tab } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import {
  TenderifyMappingDefinition,
  TenderifyMappingHeaders,
  TenderifyMappingTable
} from "./components";
import SettingsContext from "../../../utils/settingsContext";
import { get } from "lodash";

const TenderifyMappingMain = ({ ...props }) => {
  const { t } = useTranslation();
  const { mappingParents = [] } = useContext(SettingsContext);
  const { tenderBidId, mapping, security } = props;
  const canEdit = security.editMapping;
  return (
    <>
      <TenderifyMappingDefinition tenderBidId={tenderBidId} mapping={mapping} canEdit={canEdit} />

      <Accordion
        styled
        fluid
        exclusive
        defaultActiveIndex={1}
        panels={[
          {
            key: "headerMap",
            title: t("tenderify.mapping.header.title"),
            content: {
              content: (
                <TenderifyMappingHeaders
                  mappingH={mapping.mappingH}
                  mappingId={mapping.id}
                  canEdit={canEdit}
                />
              )
            }
          },
          {
            key: "valueMap",
            title: t("tenderify.mapping.values.title"),
            content: {
              content: (
                <Tab
                  menu={{ compact: true, stackable: true }}
                  panes={mappingParents.map(parent => ({
                    key: `mappingValues-${parent}`,
                    menuItem: (
                      <Menu.Item key={`mappingValues-${parent}`}>
                        <Trans i18nKey={`tenderify.section.mapping.values.${parent}`}>
                          {parent}{" "}
                        </Trans>
                        <Label
                          color="teal"
                          floating
                          content={get(mapping, ["mappingV", parent, "data", "length"], 0)}
                        />
                      </Menu.Item>
                    ),
                    render: () => (
                      <Segment
                        className="stretch mappingTable"
                        style={{ width: "100%", minHeight: "250px" }}
                      >
                        <TenderifyMappingTable
                          topic={parent}
                          valueMap={get(mapping, ["mappingV", parent])}
                          mappingId={mapping.id}
                          security={security}
                        />
                      </Segment>
                    )
                  }))}
                />
              )
            }
          }
        ]}
      />

      {security.canRemove && <Button negative content={t("tenderify.mapping.removeBtn")} />}
    </>
  );
};

export default TenderifyMappingMain;
