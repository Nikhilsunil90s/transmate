import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { s3url } from "/imports/utils/functions/s3url.js";
import { gets3Settings } from "../../zz_utils/aws";
import {
  signUploadsDirective,
  validateUploadsRestrictions
} from "../services/uploadsDirective";

const debug = require("debug")("aws:upload:resolver");

export const resolvers = {
  Query: {
    async getSignedUploadUrl(root, { directive, file, meta }, context) {
      debug("getSignedUploadUrl %o", { directive, file, meta });
      const { type: fileType } = file;

      const [passesValidation, issue] = validateUploadsRestrictions(
        directive,
        file
      );

      if (!passesValidation) {
        throw new Error(issue);
      }

      const signedResult = signUploadsDirective(
        { directive, file, meta },
        context
      );

      if (!signedResult) {
        throw new Error("notAuthorized");
      }

      const { key, acl } = signedResult;

      const bucket = process.env.AWS_S3_BUCKET;

      const awsSettings = gets3Settings();
      const { region } = awsSettings;
      const s3 = new S3Client(awsSettings);
      const s3Params = {
        Bucket: bucket,
        Key: key,
        ContentType: fileType,
        ACL: acl
      };
      const command = new PutObjectCommand(s3Params);
      const signedUrl = await getSignedUrl(s3, command, {
        Expires: 300
      });

      if (!signedUrl) {
        debug("no signedUrl");
        // eslint-disable-next-line consistent-return
        throw new Error("s3Error");
      }

      // https://stackoverflow.com/questions/44400227/how-to-get-the-url-of-a-file-on-aws-s3-using-aws-sdk
      const downloadUrl = s3url({ region, bucket, key });
      debug("getSignedUploadUrl result %o", {
        key,
        bucket,
        region,
        signedUrl,
        downloadUrl
      });
      // eslint-disable-next-line consistent-return
      return {
        key,
        bucket,
        region,
        signedUrl,
        downloadUrl
      };
    }
  },
  Mutation: {}
};
