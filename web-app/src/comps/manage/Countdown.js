import React from "react";
import Ui from "../Ui";
import {Field, rules, FormWithButton} from "../Form";

export const AddCountdown = ({onFinish}) => (
  <FormWithButton
    buttonLabel="Create Countdown"
    rules={{label: [rules.isRequired], minutes: [rules.isRequired]}}
    initialValues={{label: "Lunch", minutes: "10"}}
    mutationName="addCountdown"
    inputType="AddCountdownInput"
    provideData={value => ({
      label: value.label,
      isPrivate: false,
      endsAt: new Date(new Date().getTime() + 1000 * 60 * (parseInt(value.minutes, 10) || 0)),
    })}
    onSubmit={p => p.then(onFinish)}
  >
    <React.Fragment>
      <Ui.H2>Create Countdown</Ui.H2>
      <Field name="label" label="Label" />
      <Field name="minutes" label="Minutes to go" type="number" />
    </React.Fragment>
  </FormWithButton>
);
