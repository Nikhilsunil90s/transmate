import sanitize from "sanitize-filename";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { gets3Settings } from "/imports/api/zz_utils/aws.js";
import { updateStage } from "../../stages/services/stage-update";
import SecurityChecks from "/imports/utils/security/_security.js";

import { Stage } from "/imports/api/stages/Stage";
import { NonConformance } from "/imports/api/nonConformances/NonConformance";
import { getTrips } from "../services/query.getTrips";
import { getTrip } from "../services/query.getTrip";

export const resolvers = {
  Query: {
    async getTrips(root, args, context) {
      const { accountId, userId } = context;
      SecurityChecks.checkLoggedIn(userId);

      return getTrips({ accountId, userId }).get();
    },
    async getTrip(root, args, context) {
      const { accountId, userId } = context;
      const { stageId, type } = args.input;
      SecurityChecks.checkLoggedIn(userId);
      return getTrip({ accountId, userId }).get({ stageId, type });
    }
  },
  Mutation: {
    async mobileAppConfirm(root, args, context) {
      const { userId } = context;
      const { stageId, stop, event } = args.input;

      SecurityChecks.checkLoggedIn(userId);
      const stage = await Stage.first(stageId);
      const shipment = stage && (await stage.getShipment());

      SecurityChecks.checkIfExists(stage);
      SecurityChecks.checkIfExists(shipment);

      return updateStage({
        updates: { [`dates.${stop}.${event}.actual`]: new Date() },
        shipment,
        stage
      });
    },
    mobileAppUploadSign(root, args, context) {
      const { userId } = context;
      const { filename, type, meta } = args.input;

      SecurityChecks.checkLoggedIn(userId);

      const bucket = process.env.AWS_S3_BUCKET;

      const awsSettings = gets3Settings();
      const s3 = new S3Client(awsSettings);

      // const s3 = new S3({ region, bucket, accessKeyId, secretAccessKey });

      const sFilename = sanitize(filename);
      const key = `documents/shipment/${meta.shipmentId}/${sFilename}`;

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
    },
    async mobileAppAddIssue(root, args, context) {
      const { userId } = context;
      SecurityChecks.checkLoggedIn(userId);
      const { stageId, delay, issue } = args.input;
      const stage = await Stage.first(stageId);
      if (!stage) return;

      // FIXME: structure is different?? - > or at least add a code
      await NonConformance.create_async({
        date: new Date(),
        shipmentId: stage.shipmentId,
        comment: issue
      });

      if (delay) {
        const srv = await stage.getShipment();
        await srv.addDelay(delay);
      }
    }
  }
};
