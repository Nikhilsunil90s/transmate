import get from "lodash.get";
import {
  DOCUMENT_ICON_MAP,
  DEFAULT_DOCUMENT_ICON
} from "/imports/api/_jsonSchemas/enums/documents";

const fileIcon = type => get(DOCUMENT_ICON_MAP, type, DEFAULT_DOCUMENT_ICON);
export default fileIcon;
