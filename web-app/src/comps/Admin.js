import React from "react";
import Loader from "./Loader";
import B from "glamorous";
import Ui from "./Ui";
import {SigninWithSlack} from "./AuthBar";
import DoAction from "./DoAction";

const AddCountdown = () =>
  <DoAction
    name="create-countdown"
    data={{label: "Mittag", isPrivate: false, endsAt: new Date(new Date().getTime() + 1000 * 3600)}}
  >
    {({performFn, isLoading}) =>
      <form onSubmit={performFn}>
        <button disabled={isLoading}>Create Countdown</button>
      </form>}
  </DoAction>;

const ShowLogin = () =>
  <Ui.FullHeight css={{minHeight: "100vh", alignItems: "center", justifyContent: "center"}}>
    <B.Div marginBottom="1em">You're not logged in</B.Div>
    <SigninWithSlack height="1.5em" />
  </Ui.FullHeight>;

const Admin = () =>
  <Loader url="/admin/home" onError={{401: ShowLogin}}>
    {data =>
      <div>
        <h1>Admin</h1>
        <AddCountdown />
      </div>}
  </Loader>;

export default Admin;
