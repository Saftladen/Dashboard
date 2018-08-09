import React from "react";
import Loader from "./Loader";
import styled from "react-emotion";
import Ui from "./Ui";
import {SigninWithSlack} from "./AuthBar";
import {Field, rules, FormWithButton} from "./Form";

const AddCountdown = () => (
  <FormWithButton
    buttonLabel="Create Countdown"
    rules={{label: [rules.isRequired], minutes: [rules.isRequired]}}
    initialValues={{label: "Lunch", minutes: "10"}}
    onSubmitSend={{
      to: "create-countdown",
      data: value => ({
        label: value.label,
        isPrivate: false,
        endsAt: new Date(new Date().getTime() + 1000 * 60 * (parseInt(value.minutes, 10) || 0)),
      }),
    }}
  >
    {() => (
      <React.Fragment>
        <Ui.H2>Create Countdown</Ui.H2>
        <Field name="label" label="Label" />
        <Field name="minutes" label="Minutes to go" type="number" />
      </React.Fragment>
    )}
  </FormWithButton>
);

const ShowLogin = () => (
  <Ui.FullHeight css={{minHeight: "100vh", alignItems: "center", justifyContent: "center"}}>
    <div
      css={{
        marginBottom: "1em",
      }}
    >
      You're not logged in
    </div>
    <SigninWithSlack height="1.5em" />
  </Ui.FullHeight>
);

const Container = styled("div")({
  padding: "2rem",
  maxWidth: 1000,
  width: "100%",
  margin: "0 auto",
});

const Admin = () => (
  <Loader url="/admin/home" onError={{401: ShowLogin}}>
    {data => (
      <Container>
        <Ui.H1>Admin</Ui.H1>
        <AddCountdown />
      </Container>
    )}
  </Loader>
);

export default Admin;
