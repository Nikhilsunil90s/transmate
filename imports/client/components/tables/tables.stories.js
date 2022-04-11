import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { Button } from "semantic-ui-react";
import https from "https";

import { ReactTable, ReactTableWithRowResizer, EditableTableCell } from ".";

const debug = require("debug")("react-table:stories");

const columns = [
  { Header: "Name", accessor: "name" },
  { Header: "Model", accessor: "model" },
  { Header: "Year", accessor: "year" }
];

const data = [
  { name: "SUV", model: "Honda", year: 2019 },
  { name: "Sedan", model: "Hyundai", year: 2020 },
  { name: "Sedan", model: "Sonata", year: 2003 },
  { name: "Sedan", model: "Halman", year: 2009 },
  { name: "Sedan", model: "Famra", year: 2029 }
];

const lotOfCars = [
  { name: "SUV", model: "Honda", year: 2001 },
  { name: "SUV", model: "Honda", year: 2002 },
  { name: "SUV", model: "Honda", year: 2003 },
  { name: "SUV", model: "Honda", year: 2004 },
  { name: "SUV", model: "Honda", year: 2005 },
  { name: "SUV", model: "Honda", year: 2006 },
  { name: "SUV", model: "Honda", year: 2007 },
  { name: "SUV", model: "Honda", year: 2008 },
  { name: "SUV", model: "Honda", year: 2009 },
  { name: "SUV", model: "Honda", year: 2010 },
  { name: "SUV", model: "Honda", year: 2011 },
  { name: "SUV", model: "Honda", year: 2012 },
  { name: "SUV", model: "Honda", year: 2013 },
  { name: "SUV", model: "Honda", year: 2014 },
  { name: "SUV", model: "Honda", year: 2015 },
  { name: "SUV", model: "Honda", year: 2016 },
  { name: "SUV", model: "Honda", year: 2017 },
  { name: "SUV", model: "Honda", year: 2018 },
  { name: "SUV", model: "Honda", year: 2019 }
];

storiesOf("Tables", module)
  .add("React Table", () => <ReactTable data={data} columns={columns} />)
  .add("React Table (loading)", () => (
    <ReactTable isLoading data={data} columns={columns} />
  ))
  .add("React Table (with row click listener)", () => (
    <ReactTable data={data} columns={columns} onRowClicked={console.log} />
  ))
  .add("React Table (with no data)", () => (
    <ReactTable data={[]} columns={columns} />
  ))
  .add("React Table (with server-side pagination and sorting)", () => {
    const [isLoading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [resultLength, setResultLength] = useState(0);
    const [maxRows, setMaxRows] = useState(10);
    const [initialState, setInitialState] = useState({});

    const fetchData = ({ pageIndex }) => {
      setLoading(true);
      setInitialState({ ...initialState, pageIndex });

      const url = `https://reqres.in/api/users?page=${pageIndex + 1}`;

      https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";

        // eslint-disable-next-line no-return-assign
        res.on("data", response => (body += response));
        res.on("end", () => {
          debug("data received!");
          body = JSON.parse(body) || {};
          setTimeout(() => {
            setResults(body.data);
            setResultLength(body.total);
            setMaxRows(body.per_page);
            setLoading(false);
          }, 1000);
        });
      });
    };

    const onSelectedRows = (processed, raw) => {
      console.log({ processed, raw });
    };

    return (
      <ReactTable
        paginate
        shouldShowFooterPagination
        maxRows={maxRows}
        resultLength={resultLength}
        isLoading={isLoading}
        fetchData={fetchData}
        onSelectedRows={onSelectedRows}
        initialState={initialState}
        // eslint-disable-next-line no-alert
        onRowClicked={() => alert("clicked")}
        data={results}
        columns={[
          { Header: "Id", accessor: "id" },
          { Header: "Email", accessor: "email" },
          { Header: "First Name", accessor: "first_name" },
          { Header: "Last Name", accessor: "last_name" },
          { Header: "Avatar", accessor: "avatar" }
        ]}
      />
    );
  })
  .add("React Table (with pagination)", () => (
    <ReactTable
      paginate
      shouldShowFooterPagination
      quantifier="cars"
      data={[...data, ...data, ...data, ...data, ...data, ...data, ...data]}
      columns={columns}
      paginationContent={<Button primary>click me</Button>}
    />
  ))
  .add("React Table (resizes displayed rows on window height changes)", () => (
    <ReactTableWithRowResizer
      paginate
      shouldShowFooterPagination
      quantifier="cars"
      data={lotOfCars}
      columns={columns}
      paginationContent={<Button primary>click me</Button>}
    />
  ))
  .add("React Table (with nested Headers and editable content", () => {
    const nestedColumns = [
      {
        Header: "Status",
        accessor: "status",
        Cell: props => (
          <EditableTableCell
            {...props}
            onChangeCompleted={(item, change) =>
              // eslint-disable-next-line no-alert
              alert(`successfully updated status with value ${change}`)
            }
          />
        )
      },
      {
        Header: "Internal Reference",
        accessor: "references.internal",
        Cell: props => (
          <EditableTableCell
            {...props}
            type="dropdown"
            onChangeCompleted={(item, value) => {
              debug(item, value);
              // eslint-disable-next-line no-alert
              alert(`dropdown changed ${value}`);
            }}
            options={[
              { text: "2020", value: 2020 },
              { text: "1998", value: 1998 }
            ]}
          />
        )
      },
      {
        Header: "Carrier",
        accessor: "carrier",
        Cell: props => <EditableTableCell {...props} disabled />
      },
      { Header: "Material Supplier", accessor: "suppliers.material" },
      { Header: "Mode", accessor: "mode" },
      { Header: "Equipment", accessor: "equipment" },
      { Header: "Cooling", accessor: "cooling" },
      { Header: "License Plate/ Container Number", accessor: "licenseNo" },
      {
        Header: "Loading",
        accessor: null,
        columns: [
          {
            Header: "Date",
            accessor: "loading.date",
            Cell: props => (
              <EditableTableCell
                {...props}
                type="date"
                onChangeCompleted={(item, change) => {
                  // eslint-disable-next-line no-alert
                  alert(`Super powered date ${change}`);
                }}
              />
            )
          },
          {
            Header: "Time",
            accessor: "loading.time",
            Cell: props => (
              <EditableTableCell
                {...props}
                type="time"
                onChangeCompleted={(item, change) => {
                  // eslint-disable-next-line no-alert
                  alert(`Super powered time ${change}`);
                }}
              />
            )
          },
          { Header: "Location", accessor: "loading.location" }
        ]
      },
      {
        Header: "Unloading",
        columns: [
          { Header: "Date", accessor: "unloading.date" },
          { Header: "Time", accessor: "unloading.time" },
          { Header: "Location", accessor: "unloading.location" }
        ]
      },
      { Header: "Tendered", accessor: "isTendered" },
      {
        Header: "Total Costs",
        accessor: "costs.total"
      },
      { Header: "Added Costs", accessor: "costs.manual" }
    ];

    const sampleData = [
      {
        status: "active",
        references: {
          internal: 1998
        },
        carrier: "DHL",
        suppliers: {
          material: "Metal"
        },
        mode: "Air",
        equipment: "Machinery",
        cooling: "Gemna",
        licenseNo: "LICM34",
        loading: {
          date: "24/09/2019",
          time: "04:45 AM",
          location: "Denmark"
        },
        unloading: {
          date: "12/09/2019",
          time: "12/09/2019",
          location: "Denmark"
        },

        isTendered: true,
        costs: {
          total: 300,
          manual: 42.2
        }
      }
    ];

    return (
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          overflowX: "scroll"
        }}
      >
        <ReactTable
          paginate
          shouldShowFooterPagination
          columns={nestedColumns}
          quantifiers="cars"
          data={sampleData}
          paginationContent={<Button primary>click me</Button>}
        />
      </div>
    );
  });
