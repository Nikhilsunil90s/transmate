import React, { useState } from "react";
import { toast } from "react-toastify";
import classNames from "classnames";
import { useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Grid, List, Icon, Table, Button } from "semantic-ui-react";
import {
  ConfirmComponent,
  SimpleDropdownModal,
  SimpleInputModal
} from "/imports/client/components/modals";
import {
  EDIT_TENDER_BID_MAPPING,
  GENERATE_TENDER_BID_MAPPING,
  GENERATE_TENDER_BID_SHEET
} from "../../../../utils/queries";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("tenderBid");

const TenderifyMappingDefinition = ({ tenderBidId, mapping, canEdit }) => {
  const { goRoute } = useRoute();
  const [confirmRemappingVisible, showConfirmRemapping] = useState(false);
  const [confirmGenerateSheetVisible, showConfirmGenerateSheet] = useState(false);
  const [sourceSheetModalVisible, showSourceSheetModal] = useState(false);
  const [headerDefModalVisible, showHeaderDefModal] = useState(false);
  const [editMapping] = useMutation(EDIT_TENDER_BID_MAPPING);
  const [generateMapping, { loading: isGeneratingMapping }] = useMutation(
    GENERATE_TENDER_BID_MAPPING
  );
  const [generateBidSheet, { loading: isGeneratingSheet }] = useMutation(GENERATE_TENDER_BID_SHEET);
  const sheetOptions = (mapping.sheets || []).map(sheet => ({ value: sheet, text: sheet }));

  async function onSaveSheet({ input }) {
    debug("saving sheet %o", input);
    try {
      const { error } = await editMapping({
        variables: {
          input: {
            mappingId: mapping._id,
            update: { header: input }
          }
        }
      });
      if (error) throw error;
      toast.success("Sheet definition updated");
      showSourceSheetModal(false);
    } catch (error) {
      toast.error("Could not save sheet definition");
    }
  }

  async function onSaveHeader({ input }) {
    try {
      const { error } = await editMapping({
        variables: {
          input: {
            mappingId: mapping._id,
            update: { header: input }
          }
        }
      });
      if (error) throw error;
      toast.success("Header definition updated");
      showHeaderDefModal(false);
    } catch (error) {
      toast.error("Could not save header definition");
    }
  }

  debug("isGeneratingMapping %o", isGeneratingMapping);

  // TODO [$6130a08837762e00094fd3e2]:
  function headerValidation() {}

  async function triggerGenerateMapping() {
    try {
      const { errors, data } = await generateMapping({ variables: { mappingId: mapping.id } });
      debug("GQL generateMapping:%o", { errors, data });
      if (errors) throw errors;
      toast.success("Mapping generated");
      showConfirmRemapping(false);
    } catch (error) {
      toast.error("Mapping error");
    }
  }

  async function triggerGenerateBidSheet() {
    try {
      const { errors, data } = await generateBidSheet({ variables: { tenderBidId } });
      debug("GQL generateBidSheet:%o", { errors, data });
      if (errors) throw errors;
      toast.success("sheet generated");
      goRoute("bid", { _id: tenderBidId, section: "sheet" });
      showConfirmGenerateSheet(false);
    } catch (error) {
      toast.error("Mapping error");
    }
  }
  return (
    <Grid columns={2}>
      <Grid.Column>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell content={<Trans i18nKey="tenderify.section.mapping.definition.type" />} />
              <Table.Cell content={mapping.type} />
            </Table.Row>
            <Table.Row>
              <Table.Cell content={<Trans i18nKey="tenderify.section.mapping.definition.name" />} />
              <Table.Cell content={mapping.name} />
            </Table.Row>
            <Table.Row>
              <Table.Cell
                content={<Trans i18nKey="tenderify.section.mapping.definition.sheet" />}
              />
              <Table.Cell
                content={
                  <>
                    <div
                      className={classNames("relative", { editable: canEdit })}
                      style={{ position: "relative" }}
                      onClick={() => showSourceSheetModal(true)}
                    >
                      <div className="float top right" style={{ visibility: "hidden" }}>
                        <Icon color="grey" name="pencil" />
                      </div>
                      <div className="contentHolder">{mapping.sheet}</div>
                    </div>
                    <SimpleDropdownModal
                      show={sourceSheetModalVisible}
                      showModal={showSourceSheetModal}
                      title={<Trans i18nKey="tenderify.section.mapping.definition.sheet" />}
                      label={<Trans i18nKey="tenderify.section.mapping.definition.sheetSelect" />}
                      options={sheetOptions}
                      model={{ input: mapping.sheet }}
                      onSave={onSaveSheet}
                    />
                  </>
                }
              />
            </Table.Row>
            <Table.Row>
              <Table.Cell
                content={<Trans i18nKey="tenderify.section.mapping.definition.header" />}
              />
              <Table.Cell
                content={
                  <>
                    <div
                      className={classNames("relative", { editable: canEdit })}
                      style={{ position: "relative" }}
                      onClick={() => showHeaderDefModal(true)}
                    >
                      <div className="float top right" style={{ visibility: "hidden" }}>
                        <Icon color="grey" name="pencil" />
                      </div>
                      <div className="contentHolder">{mapping.header}</div>
                    </div>
                    <SimpleInputModal
                      show={headerDefModalVisible}
                      showModal={showHeaderDefModal}
                      title={<Trans i18nKey="tenderify.section.mapping.definition.header" />}
                      label={<Trans i18nKey="tenderify.section.mapping.definition.headerEdit" />}
                      model={{ input: mapping.header }}
                      onSave={onSaveHeader}
                      validation={headerValidation}
                    />
                  </>
                }
              />
            </Table.Row>
          </Table.Body>
        </Table>
      </Grid.Column>
      <Grid.Column>
        <List verticalAlign="middle" divided>
          <List.Item>
            <List.Content floated="right">
              <Button
                primary
                onClick={() => showConfirmRemapping(true)}
                content={<Trans i18nKey="tenderify.section.mapping.rerunMapping.btn" />}
                loading={isGeneratingMapping}
              />
              <ConfirmComponent
                content={<Trans i18nKey="tenderify.section.mapping.rerunMapping.msg" />}
                loading={isGeneratingMapping}
                show={confirmRemappingVisible}
                showConfirm={showConfirmRemapping}
                onConfirm={triggerGenerateMapping}
              />
            </List.Content>
            <List.Content>
              <Trans i18nKey="tenderify.section.mapping.rerunMapping.label" />
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Content floated="right">
              <Button
                primary
                onClick={() => showConfirmGenerateSheet(true)}
                loading={isGeneratingSheet}
                content={<Trans i18nKey="tenderify.section.mapping.generateSheet.btn" />}
              />
              <ConfirmComponent
                content={<Trans i18nKey="tenderify.section.mapping.generateSheet.msg" />}
                show={confirmGenerateSheetVisible}
                loading={isGeneratingSheet}
                showConfirm={showConfirmGenerateSheet}
                onConfirm={triggerGenerateBidSheet}
              />
            </List.Content>
            <List.Content>
              <Trans i18nKey="tenderify.section.mapping.generateSheet.label" />
            </List.Content>
          </List.Item>
        </List>
      </Grid.Column>
    </Grid>
  );
};

export default TenderifyMappingDefinition;
