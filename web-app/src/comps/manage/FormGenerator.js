import React from "react";
import {FormWithButton, rules, Field} from "../Form";
import Ui from "../Ui";

const tileColors = [
  {name: "Blue", value: "#0d6092"},
  {name: "Dark Blue", value: "#022f4a"},
  {name: "Red", value: "#ab0101"},
  {name: "Dark Red", value: "#3c0101"},
  {name: "Gray", value: "#6f7273"},
  {name: "Dark Gray", value: "#202223"},
  {name: "Green", value: "#798800"},
  {name: "Dark Green", value: "#013c14"},
  {name: "Petrol", value: "#0d9280"},
  {name: "Dark Petrol", value: "#013c14"},
  {name: "Gold", value: "#bb9503"},
  {name: "Brown", value: "#4a2804"},
  {name: "Violet", value: "#420271"},
  {name: "Dark Violet", value: "#180129"},
  {name: "Pink", value: "#8a0466"},
  {name: "Dark Pink", value: "#290120"},
];

const sharedFormFields = (
  <Field type="select" component="select" name="color" label="Color">
    {tileColors.map(({name, value}) => (
      <option key={name} value={value}>
        {name}
      </option>
    ))}
  </Field>
);

const formGenerator = ({
  name,
  rules: rawRules,
  initalForAdd,
  initialForUpdate,
  provideData: rawProvideData,
  formBody,
  addTitle,
  updateTitle,
}) => {
  const formRules = {...rawRules, color: [rules.isRequired]};
  const provideData = v => ({...rawProvideData(v), isPrivate: false, color: v.color});
  const AddForm = ({onFinish}) => (
    <FormWithButton
      buttonLabel="Save"
      rules={formRules}
      initialValues={{...initalForAdd, color: tileColors[0].value}}
      mutationName={`add${name}`}
      inputType={`Add${name}Input`}
      provideData={provideData}
      onSubmit={p => p.then(onFinish)}
    >
      {form => (
        <React.Fragment>
          <Ui.H2>{addTitle}</Ui.H2>
          {typeof formBody === "function" ? formBody(form) : formBody}
          {sharedFormFields}
        </React.Fragment>
      )}
    </FormWithButton>
  );

  const UpdateForm = ({data, color, isPrivate, onFinish}) => (
    <FormWithButton
      buttonLabel="Update"
      rules={formRules}
      initialValues={{...initialForUpdate(data), color, isPrivate}}
      mutationName={`update${name}`}
      inputType={`Update${name}Input`}
      provideData={v => ({...provideData(v), color: v.color, isPrivate: v.isPrivate, id: data.id})}
      onSubmit={p => p.then(onFinish)}
    >
      {form => (
        <React.Fragment>
          <Ui.H2>{updateTitle}</Ui.H2>
          {typeof formBody === "function" ? formBody(form) : formBody}
          {sharedFormFields}
        </React.Fragment>
      )}
    </FormWithButton>
  );

  return {AddForm, UpdateForm};
};

export default formGenerator;
