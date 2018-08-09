import React from "react";
import Loader from "./Loader";
import styled from "react-emotion";
import Ui from "./Ui";
import FormState from "./FormState";
import {SigninWithSlack} from "./AuthBar";
import DoAction from "./DoAction";

const AddCountdown = () => (
  <FormState initialModel={{label: "Lunch", minutes: "10"}}>
    {({model, changeField}) => (
      <DoAction
        name="create-countdown"
        data={{
          label: model.label,
          isPrivate: false,
          endsAt: new Date(new Date().getTime() + 1000 * 60 * (parseInt(model.minutes, 10) || 0)),
        }}
      >
        {({performFn, isLoading}) => (
          <form onSubmit={performFn}>
            <Ui.H2>Create Countdown</Ui.H2>
            <Ui.Field
              label="Label"
              value={model.label || ""}
              onChange={e => changeField("label", e.target.value)}
            />
            <Ui.Field
              label="Minutes to go"
              type="number"
              value={model.minutes || ""}
              onChange={e => changeField("minutes", e.target.value)}
            />
            <Ui.FullButton disabled={isLoading}>Create Countdown</Ui.FullButton>
          </form>
        )}
      </DoAction>
    )}
  </FormState>
);

const ShowLogin = () => (
  <Ui.FullHeight css={{minHeight: "100vh", alignItems: "center", justifyContent: "center"}}>
    <div css={{
      marginBottom: "1em"
    }}>You're not logged in</div>
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
