import React, { useState } from "react";
import { Table, Button, Card, Icon } from "semantic-ui-react";

import { DropdownCountryFlag } from "/imports/client/components/forms/uniforms/DropdownCountryFlag";
import { CountryFlag } from "/imports/client/components/tags";
import { REGION_MAP } from "../utils/countryRegionMap";
import Grid from "/node_modules/semantic-ui-react/dist/commonjs/collections/Grid/Grid";
import LocationModal from "./modals/LocationModal";
import { ConfirmComponent } from "/imports/client/components/modals";

const continents = [...new Set([...REGION_MAP.map(([continent]) => continent)])];

const LanesTab = ({ profile, canEdit, onSave }) => {
  const [modalState, setModalState] = useState({ show: false });
  const [confirmState, setConfirmState] = useState({ show: false });

  const showModal = show => setModalState({ ...modalState, show });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const [manualCC, setManualCC] = useState();
  const [destinations, setDestinations] = useState(profile.destinations || []);
  const [locations, setLocations] = useState(profile.locations || []);

  const hasLocations = locations.length > 0;
  const hasDestinations = destinations.length > 0;
  const destinationCCs = destinations.map(({ cc }) => cc);

  function onSaveLocation(location, idx) {
    const mod = [...locations];
    if (idx > -1) {
      mod[idx] = location;
    } else {
      mod.push(location);
    }
    setLocations(mod);
    onSave({ locations: mod }, () => showModal(false));
  }

  function confirmRemoveLocation() {
    const mod = [...locations].filter((l, i) => i !== confirmState.index);
    setLocations(mod);
    onSave({ locations: mod }, () => showConfirm(false));
  }

  function addFromRegion(region) {
    const mod = [...destinations];
    REGION_MAP.filter(([, r]) => r === region).forEach(([, , , , cc]) => {
      if (!destinationCCs.includes(cc)) {
        mod.push({ cc });
      }
    });
    setDestinations(mod);
    onSave({ destinations: mod });
  }

  function addCC() {
    const cc = manualCC;
    if (!cc) return;
    const mod = [...destinations];
    if (!destinationCCs.includes(cc)) {
      mod.push({ cc });
    }
    setDestinations(mod);
    onSave({ destinations: mod });
    setManualCC();
  }

  function removeCC(ccToRemove) {
    const mod = destinations.filter(({ cc }) => cc !== ccToRemove);
    setDestinations(mod);
    onSave({ destinations: mod });
  }

  return (
    <>
      <h3>Locations</h3>
      {hasLocations ? (
        <Card.Group>
          {locations.map((location, i) => (
            <Card key={i} raised>
              <Card.Content>
                <Card.Header>{location.name}</Card.Header>
                <Card.Meta>
                  {location.street} {location.number} {location.number} <br />
                  {location.zip} {location.city} <br />
                  <CountryFlag countryCode={location.cc} />
                </Card.Meta>
                <Card.Description />
              </Card.Content>
              {canEdit && (
                <Card.Content extra>
                  <div className="ui two mini buttons">
                    <Button
                      basic
                      content="Edit"
                      onClick={() => setModalState({ show: true, index: i, location })}
                    />
                    <Button
                      basic
                      color="red"
                      content="Remove"
                      onClick={() => setConfirmState({ show: true, index: i })}
                    />
                  </div>
                </Card.Content>
              )}
            </Card>
          ))}
        </Card.Group>
      ) : (
        <div className="empty">No locations given</div>
      )}
      {canEdit && (
        <Button
          content="Add"
          onClick={() => setModalState({ show: true })}
          style={{ marginTop: "20px" }}
        />
      )}
      <LocationModal {...modalState} showModal={showModal} onSave={onSaveLocation} />
      <ConfirmComponent
        {...confirmState}
        showConfirm={showConfirm}
        onConfirm={confirmRemoveLocation}
      />
      <h3>Destinations</h3>

      {hasDestinations ? (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell content="Country" width={10} />
              <Table.HeaderCell content="" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {destinations.map((destination, i) => (
              <Table.Row key={`destination-${i}`}>
                <Table.Cell content={<CountryFlag countryCode={destination.cc} />} />
                <Table.Cell
                  content={
                    canEdit && (
                      <Icon
                        name="trash"
                        onClick={() => removeCC(destination.cc)}
                        style={{ cursor: "pointer" }}
                      />
                    )
                  }
                />
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <p>No destinations added yet.</p>
      )}
      {canEdit && (
        <Grid>
          <Grid.Row verticalAlign="bottom">
            <Grid.Column width={8}>
              <DropdownCountryFlag label="Add country" value={manualCC} onChange={setManualCC} />
            </Grid.Column>
            <Grid.Column>
              <Button content="add" primary onClick={addCC} disabled={!manualCC} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )}
      <br />

      {canEdit && (
        <Table>
          <Table.Body>
            {continents.map((continent, i) => {
              const regions = [
                ...new Set([
                  ...REGION_MAP.filter(([c]) => c === continent).map(([, region]) => region)
                ])
              ];
              return (
                <Table.Row key={`continent-${i}`}>
                  <Table.Cell content={continent} />
                  <Table.Cell
                    content={regions.map((region, j) => (
                      <Button
                        size="tiny"
                        key={`region-${j}`}
                        basic
                        content={region}
                        onClick={() => addFromRegion(region)}
                        style={{ marginLeft: "2px" }}
                      />
                    ))}
                  />
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </>
  );
};

export default LanesTab;
