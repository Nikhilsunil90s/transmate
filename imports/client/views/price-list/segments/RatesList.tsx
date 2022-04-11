import React, { useState } from "react";
import { toast } from "react-toastify";
import { useQuery, useApolloClient, useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Segment, Divider, Icon } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import { CurrencyTag, NumberTag } from "/imports/client/components/tags";
import PriceListRateModal from "../components/RateModal";
import {
  PriceListSelectModal,
  ConfirmComponent
} from "/imports/client/components/modals";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";

import {
  GET_PRICELIST_RATES,
  UPDATE_RATE_IN_LIST,
  COPY_ADITIONAL_CHARGES_FROM_OTHER_PRICELIST
} from "../utils/queries";
import { PriceListUIData } from "/imports/utils/priceList/grid__class_data";

const debug = require("debug")("priceList:list");

interface ModalState {
  show: boolean;
  priceListId: PriceListUIData;
  isLocked: boolean;
  rate?: Object;
}

interface ConfirmState {
  show: boolean;
  id?: string;
}

const PriceListRatesListSegment = ({ ...props }) => {
  const client = useApolloClient();
  const { priceListId, security = {}, priceList } = props;
  const canEdit = security.canEditRateInList;
  const { carrierId: priceListCarrierId } = priceList;
  const [copyAdditionalCharges] = useMutation(
    COPY_ADITIONAL_CHARGES_FROM_OTHER_PRICELIST,
    {
      refetchQueries: [
        {
          query: GET_PRICELIST_RATES,
          variables: { priceListId, query: {}, inGrid: false }
        }
      ]
    }
  );

  // new/edit rate modal
  const [modalState, setModalState] = useState<ModalState>({
    show: false,
    priceListId,
    isLocked: !canEdit
  });
  const showModal = (show: boolean) => setModalState({ ...modalState, show });

  // confirm modal
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    show: false
  });
  const showConfirm = (show: boolean) =>
    setConfirmState({ ...confirmState, show });

  // copy rates from modal
  const [selectPLState, setSelectPLState] = useState<boolean>(false);

  const { data = {}, loading, error } = useQuery(GET_PRICELIST_RATES, {
    variables: { priceListId, query: {}, inGrid: false }
  });
  debug("apollo rates for list ,%o", { data, loading, error });

  const rates = (data.results?.rates || [])
    .map(r => removeEmpty(r, true))
    .sort(({ name: a = "" }, { name: b = "" }) => a.localeCompare(b));

  async function onSaveRate({ update, selector }, cb?: () => void) {
    const { id } = selector;
    try {
      const { errors } = await client.mutate({
        mutation: UPDATE_RATE_IN_LIST,
        variables: {
          input: {
            priceListId,
            id,
            update
          }
        },
        refetchQueries: [
          {
            query: GET_PRICELIST_RATES,
            variables: { priceListId, query: {}, inGrid: false }
          }
        ]
      });

      if (errors) throw errors;
      if (typeof cb === "function") cb();
    } catch (error) {
      console.error({ error });
      toast.error("Could not save rate update");
    }
  }

  function copyRatesFromOtherPriceList({
    priceListId: sourcePriceListId
  }: {
    priceListId: string;
  }) {
    copyAdditionalCharges({
      variables: { input: { priceListId, sourcePriceListId } }
    })
      .then(() => setSelectPLState(false))
      .catch(error => {
        console.error({ error });
        toast.error("Could not copy charges");
      });
  }

  function onConfirmDelete() {
    const { id } = confirmState;
    onSaveRate({ selector: { id }, update: null }, () => showConfirm(false));
  }

  function copyRate({ rate }) {
    const { id, ...rateToCopy } = rate;
    onSaveRate({ selector: {}, update: rateToCopy });
  }

  return (
    <Segment padded="very" className="ratesAdditional">
      <ReactTable
        isLoading={loading}
        tableClass={`ui very basic table ${canEdit ? "selectable" : ""}`}
        data={rates}
        columns={[
          {
            Header: <Trans i18nKey="price.list.rate.name" />,
            accessor: "name"
          },
          {
            Header: <Trans i18nKey="price.list.rate.amount" />,
            accessor: "amount",
            Cell: ({ value: amount = {} }) =>
              amount.unit === "%" ? (
                <NumberTag value={amount.value} suffix={amount.unit} />
              ) : (
                <CurrencyTag value={amount.value} currency={amount.unit} />
              )
          },
          {
            Header: <Trans i18nKey="price.list.rate.multiplier" />,
            accessor: "multiplier",
            Cell: ({ value: multiplier, row: { original } }) =>
              original.amount?.unit === "%" ? " - " : multiplier,
            className: "center aligned"
          },
          {
            Header: <Trans i18nKey="price.list.rate.numRules" />,
            accessor: "rules",
            Cell: ({ value }) => (value || []).length
          },
          {
            Header: <Trans i18nKey="price.list.rate.hasFilters" />,
            accessor: "filters",
            Cell: ({ value: filters }) =>
              Boolean(filters) ? <Icon name="check" /> : null,
            className: "center aligned"
          },
          {
            id: "actions",
            accessor: "id",
            Cell: ({ value: id, row: { original } }) => (
              <Button.Group>
                {!canEdit && (
                  <Button
                    icon="eye"
                    onClick={() =>
                      setModalState({
                        ...modalState,
                        show: true,
                        rate: original,
                        isLocked: true
                      })
                    }
                  />
                )}
                {canEdit && (
                  <Button
                    icon="edit"
                    onClick={() =>
                      setModalState({
                        ...modalState,
                        show: true,
                        rate: original
                      })
                    }
                  />
                )}
                {canEdit && (
                  <Button
                    icon="copy"
                    onClick={() => copyRate({ rate: original })}
                  />
                )}
                {canEdit && (
                  <Button
                    icon="trash alternate"
                    onClick={() => setConfirmState({ show: true, id })}
                  />
                )}
              </Button.Group>
            )
          }
        ]}
      />
      <Divider hidden />
      <div>
        {canEdit && (
          <Button
            basic
            icon="add"
            content={<Trans i18nKey="price.list.rate.add" />}
            onClick={() =>
              setModalState({
                ...modalState,
                show: true,
                rate: { rules: [], priceListId }
              })
            }
          />
        )}
        {canEdit && (
          <Button
            basic
            icon="copy"
            content={<Trans i18nKey="price.list.rate.copyFrom" />}
            onClick={() => setSelectPLState(true)}
          />
        )}
      </div>
      <PriceListRateModal
        {...modalState}
        priceList={priceList}
        showModal={showModal}
        onSave={onSaveRate}
      />
      <ConfirmComponent
        {...confirmState}
        showConfirm={showConfirm}
        onConfirm={onConfirmDelete}
      />
      <PriceListSelectModal
        show={selectPLState}
        showModal={setSelectPLState}
        onSave={copyRatesFromOtherPriceList}
        query={{ carrierId: priceListCarrierId, type: "contract" }}
      />
    </Segment>
  );
};

export default PriceListRatesListSegment;
