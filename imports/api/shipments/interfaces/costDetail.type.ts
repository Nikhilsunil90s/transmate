export type costDetailType = {
  baseCurrency: string;
  calculated: {
    id: string;
    costId: string;
    source: string;
    amount: {
      value: number;
      currency: string;
      rate?: number;
    };
    added: {
      by: string;
      at: Date;
    };
    accountId: string;
    sellerId?: string;
    invoiceId?: string;
    invoiced?: string;
    orgIndex?: number;
    description?: string;
    forApproval?: boolean;
    response?: {
      approved: boolean;
      reason?: string;
      comment?: string;
      responded?: {
        by: string;
        at: Date;
      };
    };
    isManualBaseCost?: boolean;
    tooltip?: string;
    priceListId?: string;
    date?: Date;
    calculatedExchange?: number;
  };
  invoices?: {
    id: string;
    number: string;
    sellerId: string;
    invoiceCurrency: string;
    date: Date;
    subtotal: number;
    costItems: {
      id: string;
      description: string;
      amount: {
        value: number;
        currency: string;
        rate?: number;
      }[];
      costId: string;
      orgIndex: number;
      source: string;

      // isInvoice
      invoiceId: string;
      invoiced: boolean;
    };
  }[];
  totalShipmentCosts: number;
  totalInvoiceCosts: number;
  totalInvoiceDelta: number;
};
