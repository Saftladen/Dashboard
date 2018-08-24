import React from "react";
import formGenerator from "./FormGenerator";
import {rules, Field} from "../Form";

const {AddForm: AddTwitterUser, UpdateForm: UpdateTwitterUser} = formGenerator({
  name: "TwitterUser",
  rules: {username: [rules.isRequired]},
  initalForAdd: {username: ""},
  initialForUpdate: data => ({username: data.username}),
  provideData: val => val,
  formBody: <Field name="username" label="Twitter Handle" />,
  addTitle: "Track Twitter User",
  updateTitle: "Edit Twitter Handle",
});

export {AddTwitterUser, UpdateTwitterUser};
