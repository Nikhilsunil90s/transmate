import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import { Checkbox, Form } from "semantic-ui-react";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { PriceListExport } from "/imports/utils/priceList/grid__class_export";
import { useApolloClient } from "@apollo/client";

import { GET_PRICELIST } from "../utils/queries";

const debug = require("debug")("pricelist:export:modal");

const PriceListExportModal = ({ show, showModal, priceListId, filters = [] }) => {
  const client = useApolloClient();
  debug("filters %o ", filters);

  // adds xlsx script to the window:
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.1.1/exceljs.min.js";

    // script.integrity =
    // "sha512-zhDD6mpjQmjTOqcC2jd9iRgxmAlk/pmCCUPjKA9XWbcmvk7o0Jr8/9Dr0qQ5V54DPQJcRgCvlgFrtWMxgRjSOQ==";
    // script.crossorigin = "anonymous";
    script.async = true;

    document.body.appendChild(script);

    // return () => {
    //   document.body.removeChild(script);
    // };
  }, []);

  const generateExport = () => {
    const selectedFilters = filters.reduce((acc, { field, options }) => {
      return [...acc, ...options.map(({ value }) => ({ field, key: value }))];
    }, []);

    client
      .query({
        query: GET_PRICELIST,
        variables: { priceListId },
        fetchPolicy: "network-only"
      })
      .then(({ data = {} }) => {
        const { priceList } = data;
        if (!priceList) throw new Error("Could not get data");
        const exportPL = new PriceListExport({ priceListDoc: priceList, selectedFilters }, client);

        return exportPL
          .addGeneralInfo()
          .addUpdateHistory()
          .addStructureData()
          .prepareFilter()
          .getData();
      })
      .then(() => {
        toast.success("File generated");
        showModal(false);
      })
      .catch(e => {
        toast.error(e);
      });
  };
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="price.list.export.title" />}
      body={
        <Form>
          <div className="ui items">
            {filters.map((filter, i) => (
              <React.Fragment key={`filter-${i}`}>
                <b>{filter.fieldName}:</b>
                {(filter.options || []).map(({ text }, j) => (
                  <div className="item" key={`option-${j}`}>
                    <Checkbox label={text} checked disabled />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </Form>
      }
      actions={<ModalActions {...{ showModal, onSave: generateExport }} />}
    />
  );
};

export default PriceListExportModal;

PriceListExportModal.propTypes = {
  show: PropTypes.bool,
  showModal: PropTypes.func,
  priceListId: PropTypes.string,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string,
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
        })
      )
    })
  )
};
