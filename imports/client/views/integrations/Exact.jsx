import React, { useState, useEffect } from "react";
import { Container, Image, Segment, Header, Checkbox, Card, Flag, Button } from "semantic-ui-react";
import { toast } from "react-toastify";
import useRoute from "../../router/useRoute";

const REST_API_URL =
  "https://eu-de.functions.appdomain.cloud/api/v1/web/3baf9da3-9053-4895-9966-5a1b7b19031a/exactOnline/api/setDivisions";

const debug = require("debug")("exactOnline:integration");

export const ExactIntegration = ({ id, divisions = [], error }) => {
  debug("data %o", { id, divisions });
  const { Code: currentDivision } = divisions.find(({ Current }) => Current) || {};
  debug("currentDivision %o", currentDivision);
  const { goRoute } = useRoute();

  const [selected, setSelected] = useState([currentDivision]);
  const toggle = (code, checked) => {
    let mod = selected || [];
    if (checked) {
      mod = [...mod, code];
    } else {
      mod = mod.filter(cur => cur !== code);
    }
    debug("mod %o", mod);
    setSelected(mod);
  };

  const onClick = () => {
    if (!(selected.length > 0)) return toast.error("no divisions selected");
    debug("confirm with id %s divisions to link %o", id, selected);
    const request = new Request(REST_API_URL, {
      method: "POST",
      body: JSON.stringify({
        id,
        selectedDivisions: selected
      }),
      headers: { "Content-Type": "application/json" }
    });

    debug("call request ", request);
    return fetch(request)
      .then(response => response.json())
      .then(data => {
        debug("response api %o", data);
        if (data.success) {
          return goRoute("connectSuccess");
        }

        return toast.error("not able to set divisions");
      })

      .catch(error => console.error(error));
  };

  return (
    <Container text>
      <Segment raised padded>
        <Image
          src="https://assets.transmate.eu/app/logo_transmate_transparent_full.png"
          centered
          size="small"
        />

        <Header as="h3" content="Select divisions" />
        {error ? (
          error.message
        ) : (
          <>
            <Button
              primary
              floated="right"
              content="Proceed"
              disabled={selected.length === 0}
              onClick={onClick}
            />
            <p>
              Please select the divisions that you want to link with Transmate
              <br />
              By confirming you also agree to our
              <a href="https://www.transmate.eu/legal/privacy" target="_blank" rel="noreferrer">
                privacy policy
              </a>
              ,
              <br />
              and agree Transmate can use and store the minmum data needed for the transport price
              mangement to function.
            </p>
          </>
        )}

        <br />

        <Card.Group>
          {divisions.map(({ Country, Code, ...division }, i) => {
            const country = (Country || "").trim().toLocaleLowerCase();
            const isSelected = selected.includes(Code);
            return (
              <Card key={i} fluid raised color={isSelected ? "blue" : undefined}>
                <Card.Content>
                  <Card.Header>{division.CustomerName}</Card.Header>
                  <Card.Meta>{division.Description}</Card.Meta>
                  <Card.Description>
                    <Flag name={country} />
                    Code: <span style={{ opacity: "0.8" }}>{Code}</span>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Checkbox
                    label="Link to Transmate"
                    checked={isSelected}
                    onChange={(_, { checked }) => toggle(Code, checked)}
                  />
                </Card.Content>
              </Card>
            );
          })}
        </Card.Group>
      </Segment>
      <div style={{ fontSize: "0.733rem", marginTop: "-15px" }}>
        <a href="https://www.transmate.eu">www.transmate.eu</a>
      </div>
    </Container>
  );
};

// take param id from the url
const ExactIntegrationLoader = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => {
    fetch(
      `https://eu-de.functions.appdomain.cloud/api/v1/web/3baf9da3-9053-4895-9966-5a1b7b19031a/exactOnline/api/getDivisions?id=${id}`
    )
      .then(response => response.json())
      .then(responseData => {
        if (!responseData || !responseData.divisions) {
          throw Error("id not valid! No divisions returned!");
        }
        return responseData;
      })
      .then(responseData => setData(responseData))
      .catch(err => {
        debug("error api :", err);
        setData({ error: { message: err.message } });
      })
      .finally(() => setLoading(false));
  }, []);

  return loading ? "Loading...." : <ExactIntegration {...data} id={id} />;
};

const ExactIntegrationInit = () => {
  const { params } = useRoute();
  const { id } = params;
  if (!id) {
    return (
      <Container text>
        <Segment raised padded>
          An error occured. Please contact support.
        </Segment>
      </Container>
    );
  }
  return <ExactIntegrationLoader id={id} />;
};

export default ExactIntegrationInit;
