import React from "react";
import Ui from "../Ui";
import {Field, rules, FormWithButton} from "../Form";

const formRules = {username: [rules.isRequired]};

export const AddTwitterUser = ({onFinish}) => (
  <FormWithButton
    buttonLabel="Save"
    rules={formRules}
    initialValues={{username: ""}}
    mutationName="addTwitterUser"
    inputType="AddTwitterUserInput"
    provideData={value => ({
      username: value.username,
      isPrivate: false,
    })}
    onSubmit={p => p.then(onFinish)}
  >
    <React.Fragment>
      <Ui.H2>Track Twitter User</Ui.H2>
      <Field name="username" label="Twitter Handle" />
    </React.Fragment>
  </FormWithButton>
);

export const UpdateTwitterUser = ({twitterUser, onFinish}) => (
  <FormWithButton
    buttonLabel="Update"
    rules={formRules}
    initialValues={{
      username: twitterUser.username,
    }}
    mutationName="updateTwitterUser"
    inputType="UpdateTwitterUserInput"
    provideData={value => ({
      id: twitterUser.id,
      username: value.username,
    })}
    onSubmit={p => p.then(onFinish)}
  >
    <React.Fragment>
      <Ui.H2>Edit Twitter Handle</Ui.H2>
      <Field name="username" label="Twitter Handle" />
    </React.Fragment>
  </FormWithButton>
);
