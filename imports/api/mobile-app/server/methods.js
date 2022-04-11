import sanitize from "sanitize-filename";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { gets3Settings } from "/imports/api/zz_utils/aws.js";

import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { updateStage } from "../../stages/services/stage-update";
import SecurityChecks from "/imports/utils/security/_security.js";

import { Stage } from "/imports/api/stages/Stage";
import { NonConformance } from "/imports/api/nonConformances/NonConformance";

// ok
export const confirm = new ValidatedMethod({
  name: "app.confirm",
  validate: new SimpleSchema({
    stageId: String,
    stop: { type: String, allowedValues: ["pickup", "delivery"] },
    event: { type: String, allowedValues: ["arrival", "departure"] }
  }).validator(),
  run({ stageId, stop, event }) {
    SecurityChecks.checkLoggedIn(this.userId);
    const stage = Stage.first(stageId);
    const shipment = stage && stage.shipment();

    SecurityChecks.checkIfExists(stage);
    SecurityChecks.checkIfExists(shipment);

    updateStage({
      updates: { [`dates.${stop}.${event}.actual`]: new Date() },
      shipment,
      stage
    });
  }
});

// ok
export const addIssue = new ValidatedMethod({
  name: "app.issue",
  validate: new SimpleSchema({
    stageId: String,
    issue: String,
    delay: {
      type: SimpleSchema.oneOf(Number, Boolean),
      optional: true
    }
  }).validator(),
  run({ stageId, issue, delay = false }) {
    SecurityChecks.checkLoggedIn(this.userId);
    const stage = Stage.first(stageId);
    if (!stage) return;

    NonConformance.create({
      date: new Date(),
      shipmentId: stage.shipmentId,
      comment: issue
    });

    if (delay) {
      stage.getShipment().addDelay(delay);
    }
  }
});

// ok
export const upload = new ValidatedMethod({
  name: "app.upload.sign",
  validate: new SimpleSchema({
    filename: String,
    type: String,
    meta: { type: Object, blackbox: true }
  }).validator(),
  run({ filename, type, meta }) {
    SecurityChecks.checkLoggedIn(this.userId);

    const bucket = process.env.AWS_S3_BUCKET;

    const awsSettings = gets3Settings();
    const s3 = new S3Client(awsSettings);

    // const s3 = new S3({ region, bucket, accessKeyId, secretAccessKey });

    const sFilename = sanitize(filename);
    const key = `documents/shipment/${meta.shipmentId}/${sFilename}`;

    // const signedUrl = s3.getSignedUrl("putObject", {
    //   Bucket: bucket,
    //   Key: key,
    //   Expires: 300,
    //   ContentType: type,
    //   ACL: "public-read"
    // });
    const s3Params = {
      Bucket: bucket,
      Key: key,
      ContentType: type,
      ACL: "public-read"
    };
    const command = new PutObjectCommand(s3Params);
    const signedUrl = getSignedUrl(s3, command, {
      Expires: 300
    });
    if (signedUrl) {
      return { signedUrl, filename, region: awsSettings.region, bucket, key };
    }
    return undefined;
  }
});
