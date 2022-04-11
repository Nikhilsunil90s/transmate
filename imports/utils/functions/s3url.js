// export const s3url = ({ bucket, key }) => {
//   const encodeS3 = keyRef => {
//     return encodeURIComponent(keyRef)
//       .replace(/%2F/g, "/")
//       .replace(/%20/g, "+");
//   };
//   if (bucket === "files.transmate.eu") {
//     return `//${bucket}/${encodeS3(key)}`;
//   }
//   return `//${bucket}.s3.amazonaws.com/${encodeS3(key)}`;
// };

export const s3url = ({ region, bucket, key }) => {
  const regionString = region === "us-east-1" ? "" : `.${region}`;
  if (bucket === "files.transmate.eu") {
    return `https://${bucket}/${key}`;
  }
  return `https://${bucket}.s3${regionString}.amazonaws.com/${key}`;
};
