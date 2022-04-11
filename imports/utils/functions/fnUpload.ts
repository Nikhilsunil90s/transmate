/* eslint-disable no-use-before-define */
import { toast } from "react-toastify";
import gql from "graphql-tag";
import { queryGQL } from "../UI/queryGQL";
import { mutate } from "../UI/mutate";
import client from "/imports/client/services/apollo/client"; // root -> required
import { s3url } from "/imports/utils/functions/s3url";
import { FileStoreWithLink } from "/imports/api/documents/interfaces/files.d";

const debug = require("debug")("uploader");

const GET_SIGNED_UPLOAD_URL_QUERY = gql`
  query GetSignedUploadUrl(
    $directive: String
    $file: UploadFileMetaInput
    $meta: UploadMetaInput
  ) {
    getSignedUploadUrl(directive: $directive, file: $file, meta: $meta) {
      key
      bucket
      region
      signedUrl
      downloadUrl
    }
  }
`;

const ADD_TO_DOCUMENT_COLLECTION = gql`
  mutation addToDocumentsCollectionAfterUpload($input: DocumentInput!) {
    documentId: addDocument(input: $input)
  }
`;

interface UploadToCollectionProps {
  file: any;
  directive: string;
  type: string;
  reference?: any;
  accountId: string;
}

/** uploads document and adds it in the documents collection */
export const uploadDocumentToCollection = async ({
  file,
  directive,
  reference,
  type,
  accountId
}: UploadToCollectionProps) => {
  const { store, meta }: FileStoreWithLink = await uploadDoc({
    file,
    directive,
    reference,
    accountId
  });
  const res = await mutate({
    client,
    query: {
      mutation: ADD_TO_DOCUMENT_COLLECTION,
      variables: {
        input: {
          link: { ...reference },
          data: {
            type,
            meta,
            store
          }
        }
      }
    }
  });

  return { documentId: res.documentId, name: meta.name };
};

interface UploadDocProps {
  file: any;
  directive: string;
  reference?: any;
  afterFileStore?: (a: FileStoreWithLink) => void;
  accountId: string; // required
}

/** uploads document and allows you to handle the file separately with an afterFileStore function
 *  the resonse of S3 is returned in a promise, so you can handle this separately as well
 */
export const uploadDoc = ({
  file,
  directive,
  reference,
  afterFileStore,
  accountId
}: UploadDocProps): Promise<FileStoreWithLink> => {
  toast.info("uploading your file");
  return new Promise((resolve, reject) => {
    queryGQL(
      {
        client,
        query: {
          query: GET_SIGNED_UPLOAD_URL_QUERY,
          variables: {
            directive,
            file: { name: file.name, size: file.size, type: file.type },
            meta: {
              accountId,
              ...reference
            }
          },
          fetchPolicy: "network-only"
        }
      },
      async (err, data) => {
        debug("result of upload : ", { err, data });
        if (err) {
          return reject(err.message);
        }
        const { getSignedUploadUrl: upload } = data;
        if (!upload) {
          toast.error("uploading file fail, no permission.");
          // eslint-disable-next-line prefer-promise-reject-errors
          return reject("no permission");
        }

        // :upload
        const url = upload.signedUrl;
        await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type
          }
        });
        const link = s3url({ ...upload });

        const response: FileStoreWithLink = {
          link,
          meta: {
            type: file.type,
            size: file.size,
            name: file.name,
            lastModifiedDate: file.lastModifiedDate
          },
          store: {
            service: "s3",
            bucket: upload.bucket,
            key: upload.key
          }
        };
        debug(
          "upload %o, file %o, url: %s, response: %o",
          upload,
          file,
          url,
          response
        );
        if (typeof afterFileStore === "function") {
          afterFileStore(response);
        }
        return resolve(response);
      }
    );
  });
};
