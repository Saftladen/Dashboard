import React from "react";
import Ui from "../Ui";
import {Field, rules, FormWithButton} from "../Form";
import TestNumber from "../TestNumber";

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

export const AddShowNumber = ({onFinish}) => (
  <FormWithButton
    buttonLabel="Save"
    rules={formRules}
    initialValues={{
      label: "",
      url: "",
      method: "GET",
      headers: "{}",
      body: "",
      valueExtractor: "",
    }}
    mutationName="addShowNumber"
    inputType="AddShowNumberInput"
    provideData={value => ({
      label: value.label,
      url: value.url,
      method: value.method,
      headers: value.headers,
      body: value.body || null,
      valueExtractor: value.valueExtractor,
      isPrivate: false,
    })}
    onSubmit={p => p.then(onFinish)}
  >
    {form => (
      <React.Fragment>
        <Ui.H2>Track Number from JSON Response</Ui.H2>
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
    )}
  </FormWithButton>
);

export const UpdateShowNumber = ({showNumber, onFinish}) => (
  <FormWithButton
    buttonLabel="Update"
    rules={formRules}
    initialValues={{
      label: showNumber.label,
      url: showNumber.url,
      method: showNumber.method,
      headers: JSON.stringify(showNumber.headers, null, 2),
      body: showNumber.body,
      valueExtractor: showNumber.valueExtractor,
    }}
    mutationName="updateShowNumber"
    inputType="UpdateShowNumberInput"
    provideData={value => ({
      id: showNumber.id,
      label: value.label,
      url: value.url,
      method: value.method,
      headers: value.headers,
      body: value.body || null,
      valueExtractor: value.valueExtractor,
    })}
    onSubmit={p => p.then(onFinish)}
  >
    {form => (
      <React.Fragment>
        <Ui.H2>Edit Number</Ui.H2>
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
        <TestNumber data={form.values} />
      </React.Fragment>
    )}
  </FormWithButton>
);
