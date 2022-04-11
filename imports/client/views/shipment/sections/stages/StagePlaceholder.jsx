import React from "react";
import { Segment, Grid, Form, Placeholder } from "semantic-ui-react";

const Paragraph = () => (
  <Placeholder
    content={
      <Placeholder.Paragraph
        content={
          <>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </>
        }
      />
    }
  />
);

const StagePlaceholder = () => {
  return (
    <Segment padded="very" className="stage">
      <Placeholder content={<Placeholder.Header />} />

      <Form>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <Paragraph />
            </Grid.Column>
            <Grid.Column>
              <Paragraph />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Placeholder content={<Placeholder.Line />} />
            </Grid.Column>
            <Grid.Column>
              <Placeholder content={<Placeholder.Line />} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Placeholder content={<Placeholder.Line />} />
            </Grid.Column>
            <Grid.Column>
              <Placeholder content={<Placeholder.Line />} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Segment>
  );
};

export default StagePlaceholder;
