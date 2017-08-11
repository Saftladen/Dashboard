import React from "react";
import Loader from "./Loader";
import B from "glamorous";
import Ui from "./Ui";
import {SigninWithSlack} from "./AuthBar";

const ShowLogin = () =>
  <Ui.FullHeight css={{minHeight: "100vh", alignItems: "center", justifyContent: "center"}}>
    <B.Div marginBottom="1em">You're not logged in</B.Div>
    <SigninWithSlack height="1.5em" />
  </Ui.FullHeight>;

const Admin = () =>
  <Loader url="/admin/home" onError={{401: ShowLogin}}>
    {data => <span>Admin</span>}
  </Loader>;

export default Admin;
