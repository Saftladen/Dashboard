import React from "react";
import {Field, rules} from "../Form";
import formGenerator from "./FormGenerator";

const toMinutesFromNow = date => Math.round((date.getTime() - new Date().getTime()) / (1000 * 60));

const {AddForm: AddCountdown, UpdateForm: UpdateCountdown} = formGenerator({
  name: "Countdown",
  rules: {label: [rules.isRequired], minutes: [rules.isRequired]},
  initalForAdd: {label: "Lunch", minutes: "10"},
  initialForUpdate: data => ({
    label: data.label,
    minutes: toMinutesFromNow(new Date(data.endsAt)),
  }),
  provideData: value => ({
    label: value.label,
    endsAt: new Date(new Date().getTime() + 1000 * 60 * (parseInt(value.minutes, 10) || 0)),
  }),
  formBody: (
    <React.Fragment>
      <Field name="label" label="Label" />
      <Field name="minutes" label="Minutes to go" type="number" />
    </React.Fragment>
  ),
  addTitle: "Create Countdown",
  updateTitle: "Edit Countdown",
});

export {AddCountdown, UpdateCountdown};
