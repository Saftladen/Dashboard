import React from "react";
import {Field, rules} from "../Form";
import formGenerator from "./FormGenerator";

const mediaRules = {
  label: [rules.isRequired],
  url: [rules.isRequired, [v => v.indexOf("https://") === 0, "needs to start with 'https://'"]],
};

const {AddForm: AddMedia, UpdateForm: UpdateMedia} = formGenerator({
  name: "Media",
  rules: mediaRules,
  initalForAdd: {label: "Look at this!", url: "https://picsum.photos/200/300?random"},
  initialForUpdate: data => ({
    label: data.label,
    url: data.url,
  }),
  provideData: val => ({...val, type: "IMAGE"}),
  formBody: (
    <React.Fragment>
      <Field name="label" label="Label" />
      <Field name="url" label="URL (https only)" />
    </React.Fragment>
  ),
  addTitle: "Add Media",
  updateTitle: "Edit Media",
});

export {AddMedia, UpdateMedia};
