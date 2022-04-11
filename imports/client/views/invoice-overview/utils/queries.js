import gql from "graphql-tag";
import { fragments as invoiceFragments } from "/imports/api/invoices/apollo/fragments";

export const GET_INVOICE_OVERVIEW = gql`
  query getInvoiceOverview($filters: InvoiceOverviewInput) {
    invoices: getInvoiceOverview(filters: $filters) {
      ...invoiceBase
      client {
        id
        name
      }
      seller {
        id
        name
      }
      itemCount
    }
  }
  ${invoiceFragments.invoiceBase}
`;

export const CREATE_INVOICE = gql`
  mutation createInvoice($input: CreateInvoiceInput!) {
    invoice: createInvoice(input: $input) {
      ...invoiceBase
    }
  }
  ${invoiceFragments.invoiceBase}
`;
