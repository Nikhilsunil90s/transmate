export interface FileStoreType {
  store: {
    service: "s3";
    region?: string;
    bucket: string;
    key: string;
    url?: string;
  };
  meta: {
    type: string;
    size: number;
    name?: string;
    lastModifiedDate?: Date;
  };
}

export interface FileStoreWithLink extends FileStoreType {
  link: string;
}

export interface FileStoreWithId extends FileStoreType {
  id: string;
}
