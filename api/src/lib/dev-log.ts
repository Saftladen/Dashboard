import chalk from "chalk";
import * as prettyMs from "pretty-ms";
import * as split from "split2";

const cwd = process.cwd();

const convertLogNumber = (obj: any) => {
  if (!obj.message) obj.message = obj.msg;
  if (obj.level === 10) obj.level = "trace";
  if (obj.level === 20) obj.level = "debug";
  if (obj.level === 30) obj.level = "info";
  if (obj.level === 40) obj.level = "warn";
  if (obj.level === 50) obj.level = "error";
  if (obj.level === 60) obj.level = "fatal";
};

export const formatDate = () => {
  const date = new Date();
  const toS = (n: number) => n.toString().padStart(2, "0");
  const hours = toS(date.getHours());
  const minutes = toS(date.getMinutes());
  const seconds = toS(date.getSeconds());
  const prettyDate = hours + ":" + minutes + ":" + seconds;
  return chalk.gray(prettyDate);
};

const formatMessageName = (message: string) => {
  if (message === "incoming request") return "<--";
  if (message === "request completed") return "-->";
  return message;
};

const formatMessage = (obj: any) => {
  const msg = formatMessageName(obj.message);
  if (obj.level === "error") return chalk.dim.red(msg);
  if (obj.level === "trace") return chalk.dim.white(msg);
  if (obj.level === "warn") return chalk.dim.magenta(msg);
  if (obj.level === "debug") return chalk.dim.yellow(msg);
  if (obj.level === "fatal") return chalk.bgRed(msg);
  if (obj.level === "info") return chalk.green.dim(msg);
};

const formatUrl = (url: string) => chalk.white(url);

const formatMethod = (method: string) => chalk.white(method);

const formatStatusCode = (statusCode: string) => chalk.white(statusCode || "xxx");

const formatLoadTime = (elapsedTime: string) => {
  const elapsed = parseInt(elapsedTime, 10);
  const time = prettyMs(elapsed);
  return chalk[elapsed < 100 ? "green" : elapsed < 500 ? "yellow" : "red"](time);
};

const formatErrStack = (stack: string) => {
  const prettyStack = stack
    .replace(new RegExp(cwd, "g"), "<CWD>")
    .split("\n")
    .map((line, i) => {
      if (i === 0) return chalk.bold(line);
      if (line.includes("<CWD>") && !line.includes("/node_modules/")) return line;
      return chalk.dim(line);
    })
    .join("\n");
  return `\n${prettyStack}`;
};

const format = (obj: any): string => {
  const output = [];

  output.push(formatDate());
  output.push(formatMessage(obj));

  const req = obj.req;
  const res = obj.res;
  const statusCode = res ? res.statusCode : obj.statusCode;
  const responseTime = obj.responseTime || obj.elapsed;
  const method = req ? req.method : obj.method;
  const url = req ? req.url : obj.url;
  const errStack = (obj.err && obj.err.stack) || obj.stack;

  if (method) output.push(formatMethod(method));
  if (statusCode && !obj.err) output.push(formatStatusCode(statusCode));

  if (url) output.push(formatUrl(url));
  if (responseTime) output.push(formatLoadTime(responseTime));

  if (errStack) output.push(formatErrStack(errStack));

  return output.filter(Boolean).join(" ");
};

const parse = (arg: string) => {
  try {
    const obj = JSON.parse(arg);
    if (!obj.level) return arg + "\n";
    if (typeof obj.level === "number") convertLogNumber(obj);
    obj.message = obj.message || obj.msg || (obj.err && (obj.err.message || obj.err.error));
    return format(obj);
  } catch {
    return arg + "\n";
  }
};

const devLog = split((arg: string) => console.log(parse(arg)));

export default devLog;
