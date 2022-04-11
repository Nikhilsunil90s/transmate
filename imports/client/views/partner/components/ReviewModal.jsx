import React, { useState } from "react";
import { Trans } from "react-i18next";
import { Form, Icon, List, Rating } from "semantic-ui-react";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import PropTypes from "prop-types";

// default items, we store in db on text
// only category matters for rating calculation
const DEFAULT_FORM_ITEMS = [
  {
    id: "S1",
    category: "safety",
    text: "Evidences strong commitment to safety and/or environmental compliance"
  },
  {
    id: "Q1",
    category: "quality",
    text: "Evidences a strong Quality System in place, evidence of continuous improvement programs."
  },
  {
    id: "Q2",
    category: "quality",
    text: "Maintains a concern for quality in meeting customer expectations."
  },
  { id: "Q3", category: "quality", text: "Representatives conduct business with professionalism." },
  { id: "C1", category: "cost", text: "Pricing for materials and/or services was appropriate" },
  { id: "C2", category: "cost", text: "managed work within budgetary constraints." },
  {
    id: "P1",
    category: "performance",
    text: "Met scheduling/delivery expectations and commitments."
  },
  { id: "P2", category: "performance", text: "Strong technical expertise" },
  { id: "P3", category: "performance", text: "Quality of service meets expectations." },
  {
    id: "P4",
    category: "performance",
    text:
      "Communications were appropriate, accurate, and timely. This partner is timely in responding to any complaints."
  }
];
const CATEGORIES = ["safety", "quality", "cost", "performance"];

let submitForm = () => {};
const ReviewForm = ({ onSave }) => {
  // can be used to fetch customized list that overrules the default
  const [allItems, setItems] = useState(DEFAULT_FORM_ITEMS);

  function handleRate(scoreId, rating) {
    const idx = allItems.findIndex(({ id }) => id === scoreId);
    allItems[idx].rating = rating;
    setItems([...allItems]);
  }

  submitForm = () => {
    onSave({ scoring: allItems });
  };

  return (
    <Form>
      {CATEGORIES.map((category, i) => (
        <React.Fragment key={`category-${i}`}>
          <h4>
            <Trans i18nKey={`partner.review.${category}.title`} />
          </h4>
          <List divided>
            {allItems
              .filter(({ category: cat }) => cat === category)
              .map((item, j) => (
                <List.Item key={`item-${j}`}>
                  <List.Content floated="right">
                    <div className="field">
                      <Rating
                        maxRating={5}
                        rating={2}
                        onRate={(_, { rating }) => handleRate(item.id, rating)}
                      />
                    </div>
                  </List.Content>

                  <List.Content>
                    <Icon name="chevron right" color="grey" />
                    {item.text}
                  </List.Content>
                </List.Item>
              ))}
          </List>
        </React.Fragment>
      ))}
    </Form>
  );
};

const ReviewModal = ({ show, showModal, onSave }) => {
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="partner.review.modal.title" />}
      body={<ReviewForm {...{ onSave }} />}
      actions={<ModalActions {...{ showModal, onSave: () => submitForm() }} />}
    />
  );
};

ReviewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default ReviewModal;
