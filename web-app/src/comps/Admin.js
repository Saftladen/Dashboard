import React from "react";
import Loader from "./Loader";
import B from "glamorous";
import Ui from "./Ui";
import {SigninWithSlack} from "./AuthBar";

const IsLoggedIn = ({data, children}) =>
  data.me
    ? children
    : <Ui.FullHeight css={{minHeight: "100vh", alignItems: "center", justifyContent: "center"}}>
        <B.Div marginBottom="1em">You're not logged in</B.Div>
        <SigninWithSlack height="1.5em" />
      </Ui.FullHeight>;

const Admin = () =>
  <Loader url="/public/home">
    {data =>
      <IsLoggedIn data={data}>
        <span>Admin</span>
      </IsLoggedIn>}
  </Loader>;

export default Admin;
