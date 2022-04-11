/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
// import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { expect } from "chai";

import { promises as fs } from "fs";
import { uploadFileToAws } from "../aws";
import { testJpg } from "./testBase64.json";

const { v4: uuidv4 } = require("uuid");
const debug = require("debug")("aws:test");
const fetch = require("node-fetch").default;
const https = require("https");

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// you can only run this test if the meteor settings contain the aws keys!
if (typeof process.env.AWS_SECRET_ACCESS_KEY === "string") {
  describe("aws upload", function() {
    before(async () => {});

    it("allows buffer upload", async function() {
      const result = await uploadFileToAws({
        base64data: testJpg,
        fileName: "testTruck.jpg"
      });
      debug("aws buffer result %o", result);
      expect(result).to.be.an("object");
      expect(result.url).to.be.an("string");
    });

    it("not a real buffer =error", async function() {
      let result;
      try {
        result = await uploadFileToAws({
          base64data: "123",
          fileName: "testTruck.jpg"
        });
      } catch (e) {
        result = e;
      }
      debug("aws fake buffer result %o", result);
      expect(result).to.be.an("error");
      expect(result.message).to.equal("base64data is not valid");
    });

    it("allows file upload", async function() {
      const uniqueId = uuidv4();
      debug("write file with uniqueId:%s", uniqueId);
      const filePath = "testFile.txt";
      await fs.writeFile(filePath, uniqueId, { flag: "w" });
      const result = await uploadFileToAws({ filePath });
      debug("aws buffer result %o", result);
      expect(result).to.be.an("object");
      expect(result.fullUrl).to.be.an("string");
      await sleep(500); // wait for the file to exist + make url unique, the short version is cached by cloudflare, don't try...
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false
      });
      const response = await fetch(result.fullUrl, {
        agent: httpsAgent,
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
      });

      expect(response.ok).to.eql(true);
      const body = await response.text();
      expect(body).to.equal(uniqueId);
    });
  });
}
