import React from "react";
import get from "lodash.get";
import { Flag, Icon, Image, Label, Table } from "semantic-ui-react";
import { useMutation } from "@apollo/client";
import { ADD_TO_FAVORITES } from "./queries";
import FavoriteField from "/imports/client/components/forms/input/FavoriteField.jsx";
import { generateRoutePath } from "../../router/routes-helpers";

const DirectoryCard = ({ account, canEdit }) => {
  const [addToFavorites] = useMutation(ADD_TO_FAVORITES);
  const toggleFavorite = isFavorite => {
    addToFavorites({ variables: { input: { partnerId: account.id, add: !!isFavorite } } });
  };

  const flag = get(account, ["profile", "locations", 0, "country"]);
  return (
    <div className="directory-card">
      <Table basic>
        <Table.Body>
          <Table.Row>
            <Table.Cell
              width={1}
              content={
                <FavoriteField isFavorite={account.isFavorite} addToFavorites={toggleFavorite} />
              }
            />
            <Table.Cell
              width={4}
              content={
                <a href={generateRoutePath("partner", { _id: account.id })}>
                  <div>
                    {account.logo && <Image size="tiny" src={account.logo} />}
                    <div className="name"> {account.name} </div>
                  </div>
                </a>
              }
            />
            <Table.Cell
              width={9}
              content={
                <>
                  {account.description && <div className="description">{account.description}</div>}

                  {account.profile?.services && (
                    <div className="tags">
                      {account.profile.services.map((service, i) => (
                        <Label key={i} content={service} />
                      ))}
                    </div>
                  )}
                </>
              }
            />
            <Table.Cell width={1} content={flag && <Flag name={flag.toLowerCase()} />} />
            <Table.Cell
              width={1}
              content={canEdit && <Icon name="delete" style={{ cursor: "pointer" }} />}
            />
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  );
};

export default DirectoryCard;
