// Load the SDK for JavaScript
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { s3url } from "/imports/utils/functions/s3url.js";

const debug = require("debug")("aws");
const fs = require("fs");
const path = require("path");

const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");

export function gets3Settings() {
  if (
    !process.env.AWS_DEFAULT_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  )
    throw new Error("aws settings are missing!");
  return {
    apiVersion: "2006-03-01",
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  };
}

async function sizeOf(s3, key, bucket) {
  const res = await s3.send(
    new HeadObjectCommand({ Key: key, Bucket: bucket })
  );
  return res.ContentLength;
}
export const uploadFileToAws = async ({
  filePath,
  base64data,
  fileName,
  options = {
    generateUniqueFileName: false,
    Bucket: undefined,
    Key: undefined
  }
}) => {
  // Create S3 service object
  const awsSettings = gets3Settings();
  const s3 = new S3Client(awsSettings);
  debug("aws start %o", {
    filePath,
    fileName

    // settings: gets3Settings()
  });

  // configuring parameters
  if (typeof filePath !== "string" && typeof base64data !== "string")
    throw Error("filePath or base64data should be a valid string");
  if (typeof options !== "object")
    throw Error("options should be a valid object");
  if (
    base64data &&
    Buffer.from(base64data, "base64").toString("base64") !== base64data
  )
    throw Error("base64data is not valid");
  let stored;
  let awsFileName = fileName || path.basename(filePath);
  if (options.generateUniqueFileName) {
    awsFileName = `${Date.now()}_${uuidv4()}_${fileName ||
      path.basename(filePath)}`;
  }

  const params = {
    Bucket: options.Bucket || process.env.AWS_S3_BUCKET,
    Body: base64data
      ? Buffer.from(base64data, "base64")
      : fs.createReadStream(filePath),
    Key: options.Key || awsFileName,
    ACL: "public-read",
    ContentType: mime.lookup(awsFileName),
    ResponseContentDisposition: `inline; filename='${fileName ||
      path.basename(filePath)}'`
  };

  const url = s3url({ bucket: params.Bucket, key: params.Key });
  const fullUrl = s3url({
    region: awsSettings.region,
    bucket: params.Bucket,
    key: params.Key
  });
  debug("upload file  to url %o", url);
  try {
    stored = await s3.send(new PutObjectCommand(params));
    debug("uploaded, now check file size");
    stored.size = await sizeOf(s3, params.Key, params.Bucket);
    debug("Uploaded size %o", stored.size);
  } catch (err) {
    debug("aws error ", err);
    throw err;
  }

  return { url, fullUrl, stored };
};
