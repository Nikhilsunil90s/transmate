/* global Migrations */
import { Analysis } from "/imports/api/analysis/Analysis";

Migrations.add({
  version: 45,
  name: "remove old analysis simulation",
  up: () => {
    const all = Analysis.where(
      {
        type: "simulation",
        "created.at": { $lt: new Date("2019-10-01T00:00:00.00+02:00") }
      },
      { fields: { _id: 1 } }
    );

    const ids = all.map(({ _id }) => _id);

    if (ids.length) {
      Analysis.remove({ _id: { $in: ids } });
    }
  }
});

/*

const jsdom = require("jsdom")

function stripHTML(html){
    const dom = new jsdom.JSDOM(html)
    return dom.window.document.body.textContent
}

const deserialize = string => {
    if (!string) {
        return undefined;
    }
    // is slate 
    if (Array.isArray(string)) {
        return JSON.stringify(string)
    }
    
    // text to remove:
    if (string === "\n      Please add your notes here\n    "){
        return undefined;
    }
    // is a slate value:
    if (string.match(/^\[\{\"children/)) {
        return string
    }
    // Return a value array of children derived by splitting the string.
    return JSON.stringify(
        string.split('\n')
        .map(line => stripHTML(line))
        .filter(txt => typeof txt === "string" && txt.length > 0)
        .map(text => ({children: [{ text }]}))
        )
}

const Address = db.getCollection("addresses")
const addressIds = []
const query = { "accounts.id": { $exists: true } }
Address.find(query).forEach(doc => {
    addressIds.push(doc._id)
    const { accounts = [] } = doc;
    const updatedAccounts = accounts.map(cur => {
        const safetyInstructions = deserialize(cur.safety.instructions);
        const notes = deserialize(cur.notes);
        const hours = deserialize(cur.hours);
        return ({
        ...cur,

        // move to slate notation:
        ...(cur.safety ? {
            safety: {
                pbm: cur.safety.pbm,
                ...(safetyInstructions ? { instructions: safetyInstructions } : undefined)
            }
        } : undefined),
        ...(notes ? { notes } : undefined),
        ...(hours ? { hours } : undefined),

        // move externalId to coding
        ...(cur.externalId ? { coding: { ...cur.coding, externalId: cur.externalId } } : undefined)
    })}
    );
    // debug(updatedAccounts)
    Address.updateOne({ _id: doc._id }, { $set: { accounts: updatedAccounts } })
})
*/
