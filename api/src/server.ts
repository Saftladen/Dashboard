require("source-map-support").install();
require("dotenv").config();
import app from "./app";
import {jobError} from "./lib/reportError";

process.on("unhandledRejection", r => jobError(r));

app.listen(9393, err => {
  if (err) throw err;
  const address = app.server.address();
  console.log(`server listening on ${typeof address === "string" ? address : address.port}`);
  if (process.send) process.send("ready");
});
