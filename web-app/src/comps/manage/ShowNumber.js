import React from "react";
import {Field, rules} from "../Form";
import TestNumber from "../TestNumber";
import formGenerator from "./FormGenerator";

const isJson = v => {
  try {
    JSON.parse(v);
    return true;
  } catch (e) {
    return false;
  }
};

const formRules = {
  label: [rules.isRequired],
  url: [rules.isRequired],
  method: [rules.isRequired],
  headers: [rules.isRequired, [isJson, "needs to be valid json"]],
  body: [],
  valueExtractor: [rules.isRequired],
};

const {AddForm: AddShowNumber, UpdateForm: UpdateShowNumber} = formGenerator({
  name: "ShowNumber",
  rules: formRules,
  initalForAdd: {
    label: "",
    url: "",
    method: "GET",
    headers: "{}",
    body: "",
    valueExtractor: "",
  },
  initialForUpdate: data => ({
    label: data.label,
    url: data.url,
    method: data.method,
    headers: JSON.stringify(data.headers, null, 2),
    body: data.body,
    valueExtractor: data.valueExtractor,
  }),
  provideData: value => ({
    label: value.label,
    url: value.url,
    method: value.method,
    headers: value.headers,
    body: value.body || null,
    valueExtractor: value.valueExtractor,
  }),
  formBody: form => (
    <React.Fragment>
      <Field name="label" label="Label" />
      <Field name="url" label="Url" />
      <Field type="select" component="select" name="method" label="Method">
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </Field>
      <Field type="textarea" name="headers" label="Headers as json" />
      {form.values.method === "POST" && (
        <Field type="textarea" name="body" label="Body (optional)" />
      )}
      <Field
        name="valueExtractor"
        label="Path to extract value from json"
        placeholder="e.g. data[0].user.followerCount"
      />
      {/* <TestNumber
        data={{
          url: "https://api.bitcoincharts.com/v1/weighted_prices.json",
          method: "get",
          headers: "{}",
          valueExtractor: "EUR.24h",
        }}
      /> */}
      <TestNumber data={form.values} />
    </React.Fragment>
  ),
  addTitle: "Track Number from JSON Response",
  updateTitle: "Edit Number Fetcher",
});

export {AddShowNumber, UpdateShowNumber};
