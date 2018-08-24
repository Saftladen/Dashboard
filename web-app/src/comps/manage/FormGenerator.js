import React from "react";
import {FormWithButton, rules, Field} from "../Form";
import Ui from "../Ui";

const tileColors = [{name: "Blue", value: "#47c"}, {name: "Red", value: "#c47"}];

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
