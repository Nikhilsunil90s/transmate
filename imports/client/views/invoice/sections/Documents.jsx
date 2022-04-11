import React from "react";
import { Trans } from "react-i18next";
import get from "lodash.get";
import { ReactTable } from "/imports/client/components/tables";
import { Icon } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { fileIcon } from "/imports/utils/UI/helpers";

//#region components
const DocumentOverview = ({ documents }) => {
  const columns = [
    {
      Header: () => null,
      Cell: ({ row }) => <Icon name={fileIcon(get(row, ["original", "type"]))} />
    },
    {
      Header: () => <Trans i18nKey="partner.billing.invoice.document.name" />,
      accessor: "meta.name"
    },
    { Header: () => <Trans i18nKey="partner.billing.invoice.document.type" />, accessor: "type" },
    {
      Header: () => <Trans i18nKey="partner.billing.invoice.document.comment" />,
      accessor: "comment"
    }
  ];

  return (
    <ReactTable
      columns={columns}
      data={documents}
      emptyTableMsg={<Trans i18nKey="partner.billing.invoice.documents.empty" />}
    />
  );
};

//#endregion

const InvoiceDocumentSection = ({ invoice = {} }) => {
  const { documents = [] } = invoice;
  return (
    <IconSegment
      title={<Trans i18nKey="partner.billing.invoice.documents.title" />}
      icon="inbox"
      body={
        documents.length ? (
          <DocumentOverview />
        ) : (
          <div className="empty">
            <Trans i18nKey="partner.billing.invoice.documents.empty" />
          </div>
        )
      }

      // footer=""
    />
  );
};

export default InvoiceDocumentSection;

// 		<footer class="ui segment">
// 			<div>
// 				{{#ModalTrigger template='PartnerInvoiceDocumentModal' invoiceId=_id}}
// 					<button class="ui primary button">
// 						<i class="plus icon"></i> {{_ 'partner.billing.invoice.documents.add'}}
// 					</button>
// 				{{/ModalTrigger}}
// 			</div>
// 		</footer>
// 	</section>
// </template>
