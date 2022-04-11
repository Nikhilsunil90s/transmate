import React, { useState } from "react";
import { Trans } from "react-i18next";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import { Button, Card, Grid, Header, Icon, Rating, Segment, Table } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import ReviewModal from "../components/ReviewModal";

import { ADD_SCORING } from "../utils/queries";

const ReviewTab = () => null;

/*
[
  {
    "label": "Cost",
    "rating": 5,
    "value": "5.00",
    "count": 27
  },
  {
    "label": "Performance",
    "rating": 4,
    "value": "4.25",
    "count": 27
  },
  {
    "label": "Quality",
    "rating": 4,
    "value": "4.33",
    "count": 27
  },
  {
    "label": "Safety",
    "rating": 5,
    "value": "5.00",
    "count": 27
  }
]*/

const Score = ({ score }) => {
  const arr = score || [];
  const avgScore = (
    arr.reduce((acc, curr) => {
      return acc + Number(curr.value);
    }, 0) / arr.length
  ).toFixed(2);
  return (
    <Card centered className="score">
      <Card.Content>
        <Header as="h1">
          <Icon name="empty start" />
          <div className="content">{avgScore}</div>
        </Header>
      </Card.Content>
    </Card>
  );
};

const PartnerScoreCard = ({ score, personal }) => {
  return (
    <div>
      {score ? (
        <Grid>
          <Grid.Row>
            <Grid.Column width={6}>
              <Table>
                <Table.Header>
                  <Table.HeaderCell>
                    <div className="header">{personal ? "My Score" : "Global Score"}</div>
                  </Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell width={1}>
                      <Score score={score} />
                    </Table.Cell>
                    <Table.Cell width={15}>
                      <Segment.Group horizontal>
                        {score.map((item, i) => (
                          <Segment key={i}>
                            <Header>{item.label}</Header>
                            <p>({item.value})</p>
                            <Rating
                              icon="star"
                              disabled="true"
                              size="large"
                              rating={item.rating}
                              maxRating={5}
                            />
                          </Segment>
                        ))}
                      </Segment.Group>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      ) : (
        <Trans i18nKey="partner.review.empty" />
      )}
    </div>
  );
};

// todo ! tie the review form up
export const PartnerReviewTab = ({ partner, partnerId, refetch }) => {
  const client = useApolloClient();
  const [show, showModal] = useState(false);

  function saveScoring({ scoring }) {
    client
      .mutate({
        mutation: ADD_SCORING,
        variables: {
          partnerId,
          scoring
        }
      })
      .then(({ errors }) => {
        if (errors) throw errors;

        toast.success("Scoring saved");
        showModal(false);
        refetch();
      })
      .catch(error => toast.error(error));
  }
  return (
    <>
      <IconSegment
        name="score"
        icon="star"
        title={<Trans i18nKey="partner.review.title" />}
        body={
          <>
            <PartnerScoreCard score={partner.scoring} personal />
            <PartnerScoreCard score={partner.scoring} personal={false} />
          </>
        }
        footer={
          <div>
            <Button primary icon="plus" content={<Trans i18nKey="partner.review.add" />} />
          </div>
        }
      />
      <ReviewModal {...{ show, showModal, onSave: saveScoring }} />
    </>
  );
};

export default ReviewTab;
