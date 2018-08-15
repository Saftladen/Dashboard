import React from "react";
import Ui from "../Ui";
import {Field, rules, FormWithButton} from "../Form";

const mediaRules = {
  label: [rules.isRequired],
  url: [rules.isRequired, [v => v.indexOf("https://") === 0, "needs to start with 'https://'"]],
};

export const AddMedia = ({onFinish}) => (
  <FormWithButton
    buttonLabel="Create Media"
    rules={mediaRules}
    initialValues={{label: "Look at this!", url: "https://picsum.photos/200/300?random"}}
    mutationName="addMedia"
    inputType="AddMediaInput"
    provideData={value => ({
      label: value.label,
      url: value.url,
      isPrivate: false,
      type: "IMAGE",
    })}
    onSubmit={p => p.then(onFinish)}
  >
    <React.Fragment>
      <Ui.H2>Add Media</Ui.H2>
      <Field name="label" label="Label" />
      <Field name="url" label="URL (https only)" />
    </React.Fragment>
  </FormWithButton>
);

export const UpdateMedia = ({media, onFinish}) => (
  <FormWithButton
    buttonLabel="Update"
    rules={mediaRules}
    initialValues={{
      label: media.label,
      url: media.url,
    }}
    mutationName="updateMedia"
    inputType="UpdateMediaInput"
    provideData={value => ({
      id: media.id,
      label: value.label,
      url: value.url,
      type: media.type,
    })}
    onSubmit={p => p.then(onFinish)}
  >
    <React.Fragment>
      <Ui.H2>Edit Media</Ui.H2>
      <Field name="label" label="Label" />
      <Field name="url" label="URL (https only)" />
    </React.Fragment>
  </FormWithButton>
);
