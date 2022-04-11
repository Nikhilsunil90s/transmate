/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef } from "react";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm } from "uniforms";
import { SubmitField, AutoField } from "uniforms-semantic";
import SimpleSchema from "simpl-schema";
import PageHolder from "../../utilities/PageHolder";
import { RichTextEditor, RichTextField } from "./RichTextEditor";
import { deserializeHtml } from "./RichTextEditorHtmlConverter";

const debug = require("debug")("RichTextEditor");

export default {
  title: "Components/Forms/RichTextEditor"
};

// as part of a uniforms:
// export const slant = () => {
//   return (
//     <PageHolder main="AccountPortal">
//       <MentionExample></MentionExample>
//     </PageHolder>
//   );
// };

export const basic = () => {
  const [slateValue, setSlateValue] = useState();
  const [value1, setValue1] = useState([{ children: [{ text: "iiiii" }] }]);
  const ref = useRef();
  return (
    <PageHolder main="AccountPortal">
      <RichTextEditor
        name="1"
        onChange={data => {
          console.log("RichTextEditor:onChange", data);
          setSlateValue(data);
        }}
      />
      {/* <textarea ref={ref} value={JSON.stringify(slateValue)}></textarea>
      <button
        onClick={() => {
          const v = JSON.parse(ref.current.value);
          console.log("--=-==-=-=", v);
          setValue1(v);
        }}
      >
        Set
      </button>
      <div>---------</div>
      <RichTextEditor name="2" value={value1}></RichTextEditor> */}
    </PageHolder>
  );
};

const biddingSchema = new SimpleSchema2Bridge(
  new SimpleSchema({
    content: {
      type: Object,
      optional: true,
      blackbox: true
    },
    name: String
  })
);

// as part of a uniforms:
export const withinForm = () => {
  const [slateValue, setSlateValue] = useState();
  const [value1, setValue1] = useState([{ children: [{ text: "iiiii" }] }]);
  const ref = useRef();
  return (
    <PageHolder main="AccountPortal">
      <AutoForm
        style={{ height: 600 }}
        schema={biddingSchema}
        model={{ name: "test" }}
        onChangeModel={data => {
          debug("onChangeModel", data);
        }}
        onSubmit={data => {
          debug("onSubmit", data);
        }}
      >
        <AutoField name="name" />
        <RichTextField
          name="content"
          value={value1}
          style={{
            height: 300
          }}
        />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const serialized = () => {
  const slateValue = [
    {
      children: [{ text: "Header 1" }],
      type: "heading-one"
    },
    {
      children: [
        { text: "Test " },
        { text: "with", italic: true },
        { text: " " },
        { text: "some", underline: true },
        { text: " " },
        { text: "features", bold: true }
      ]
    },
    {
      children: [{ text: "list:" }]
    },
    {
      children: [{ children: [{ text: "test" }], type: "list-item" }],
      type: "numbered-list"
    },
    {
      children: [{ text: "list 2" }],
      type: "paragraph"
    },
    {
      children: [
        {
          children: [{ text: "bullet item" }],
          type: "list-item"
        }
      ],
      type: "bulleted-list"
    },
    {
      children: [{ text: "test" }],
      type: "block-quote"
    }
  ];
  const ref = useRef();
  return (
    <PageHolder main="AccountPortal">
      <RichTextEditor name="1" value={slateValue} disabled />
    </PageHolder>
  );
};

export const testConversion = () => {
  const htmlString = `<div><font face="Calibri"><span style="font-size: 14.6667px;">Rates based on real weight<span style="white-space:pre">	</span></span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*SBD will not accept conversion rate higher than 150kg/cubic meter.<span style="white-space:pre">	</span>YES</span></font></div><div><span style="white-space: pre; font-size: 14.6667px;"><font face="Calibri">	</font></span></div><div><font face="Calibri"><span style="font-size: 14.6667px;">Rates in Excel<span style="white-space:pre">	</span>YES</span></font></div><div><span style="white-space: pre; font-size: 14.6667px;"><font face="Calibri">	</font></span></div><div><font face="Calibri"><span style="font-size: 14.6667px;">Rates are valid for 2 years after first executed shipment<span style="white-space:pre">	</span>YES</span></font></div><div><span style="white-space: pre; font-size: 14.6667px;"><font face="Calibri">	</font></span></div><div><font face="Calibri"><span style="font-size: 14.6667px;">For Damparis &amp; Tessenderlo location we can accept 2 offers:<span style="white-space:pre">	</span></span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Current setup<span style="white-space:pre">	</span>YES</span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Door to door rate<span style="white-space:pre">	</span>NO</span></font></div><div><span style="white-space: pre; font-size: 14.6667px;"><font face="Calibri">	</font></span></div><div><font face="Calibri"><span style="font-size: 14.6667px;">Segments REDUR is quoting for<span style="white-space:pre">	</span></span></font></div><div><span style="white-space: pre; font-size: 14.6667px;"><font face="Calibri">	</font></span></div><div><font face="Calibri"><span style="font-size: 14.6667px;">Completed simulation<span style="white-space:pre">	</span>YES</span></font></div><div><span style="white-space: pre; font-size: 14.6667px;"><font face="Calibri">	</font></span></div><div><font face="Calibri"><span style="font-size: 14.6667px;">Confirmation of variable SBD fuel model<span style="white-space:pre">	</span>YES</span></font></div><div><span style="white-space: pre; font-size: 14.6667px;"><font face="Calibri">	</font></span></div><div><font face="Calibri"><span style="font-size: 14.6667px;">Confirmation to execute reporting and invoicing:<span style="white-space:pre">	</span>YES</span></font></div><div><span style="white-space: pre; font-size: 14.6667px;"><font face="Calibri">	</font></span></div><div><font face="Calibri"><span style="font-size: 14.6667px;">Company information<span style="white-space:pre">	</span></span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Company introduction<span style="white-space:pre">	</span>YES</span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Capabilities of shipping dangerous goods<span style="white-space:pre">	</span>YES</span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Process on making appointments for delivery<span style="white-space:pre">	</span>YES</span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Claims procedure<span style="white-space:pre">	</span>YES</span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Setup France (probably refering to Spain &amp; Portugal?)<span style="white-space:pre">	</span></span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;"> Hubs<span style="white-space:pre">	</span></span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;"> Own employees/subcontractors<span style="white-space:pre">	</span></span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Committed transit times.<span style="white-space:pre">	</span>YES</span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Reference and contact person (on comparable businesses)<span style="white-space:pre">	</span>YES</span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Please provide specification of label and EDI connections<span style="white-space:pre">	</span>YES</span></font></div><div><font face="Calibri"><span style="font-size: 14.6667px;">*Current performance level per department (for above provided reference)<span style="white-space:pre">	</span>YES</span></font></div>`;
  const slateValue = deserializeHtml(htmlString);
  return (
    <PageHolder main="AccountPortal">
      <RichTextEditor name="1" value={slateValue} disabled />
    </PageHolder>
  );
};
