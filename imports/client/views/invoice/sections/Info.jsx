import React, { useContext } from "react";
import { Trans } from "react-i18next";
import { Segment, Form } from "semantic-ui-react";
import moment from "moment";
import LoginContext from "/imports/client/context/loginContext";
import { StatusTag } from "/imports/client/components/tags";
import { STATUS_COLORS } from "/imports/api/_jsonSchemas/enums/invoice";

const DATE_FORMAT = "DD/MM/YYYY";

const InvoiceInfoSegment = ({ invoice = {} }) => {
  const { accountId: myAccountId } = useContext(LoginContext);
  const { client, seller } = invoice;
  const partner = seller._id === myAccountId ? client : seller;
  return (
    <Segment padded="very" basic>
      <Form>
        <Form.Group widths="equal">
          {[
            ["partner", partner.name],
            ["number", invoice.number],
            ["date", moment(invoice.date).format(DATE_FORMAT)],
            [
              "status",
              <StatusTag
                key="status"
                text={invoice.status}
                color={STATUS_COLORS[invoice.status] || "grey"}
              />
            ]
          ].map(([key, value]) => (
            <Form.Field key={key}>
              <label>
                <Trans i18nKey={`partner.billing.invoice.${key}`} />
              </label>
              {value}
            </Form.Field>
          ))}
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default InvoiceInfoSegment;
