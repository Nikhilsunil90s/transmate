import React from "react";
import { NotesSection, AttachmentSection } from "../segments";

const PriceListNotesTab = ({ ...props }) => (
  <>
    <NotesSection {...props} />
    <AttachmentSection {...props} />
  </>
);

export default PriceListNotesTab;
