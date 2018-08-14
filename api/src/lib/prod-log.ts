import * as split from "split2";
import reportError from "./reportError";

const parse = (arg: string) => {
  try {
    const obj = JSON.parse(arg);
    if (typeof obj.level === "number" && obj.level < 40) return;
    if (typeof obj.level === "number" && obj.level >= 50) {
      const errStack = (obj.err && obj.err.stack) || obj.stack || [];
      const message = obj.message || obj.msg || (obj.err && (obj.err.message || obj.err.error));
      // tslint:disable-next-line:no-floating-promises
      reportError(message, errStack);
      console.error(arg);
    } else {
      console.log(arg);
    }
  } catch {
    console.log(arg);
  }
};

const prodLog = split((arg: string) => parse(arg));

export default prodLog;
