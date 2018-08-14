import React from "react";
import styled from "react-emotion";
import Ui from "./Ui";
import AuthBar, {SigninWithSlack} from "./AuthBar";
import {Field, rules, FormWithButton} from "./Form";
import ConnectLoader from "./Loader";
import gql from "graphql-tag";

const AddCountdown = () => (
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

const AdminQuery = gql`
  query {
    currentUser {
      id
    }
    ...AuthBarQuery
  }
  ${AuthBar.fragment}
`;

const Admin = () => (
  <ConnectLoader query={AdminQuery}>
    {(style, data) => (
      <Container style={style}>
        {data.currentUser ? (
          <React.Fragment>
            <AuthBar data={data} />
            <Ui.H1>Admin</Ui.H1>
            <AddCountdown />
          </React.Fragment>
        ) : (
          <ShowLogin />
        )}
      </Container>
    )}
  </ConnectLoader>
);

export default Admin;
