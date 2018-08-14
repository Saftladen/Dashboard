import axios from "axios";

const errorTimer: {[err: string]: Date} = {};

function rawReportError(err: string, stack: string[]) {
  const lastReported = errorTimer[err];
  if (lastReported && lastReported.getTime() + 1000 * 3600 * 2 > new Date().getTime()) {
    return Promise.resolve(null);
  }
  errorTimer[err] = new Date();
  if (process.env.SLACK_ERROR_HOOK) {
    return axios.post(process.env.SLACK_ERROR_HOOK, {
      text: `*${process.env.ENV_NAME}* says: '${err}'`,
      icon_emoji: ":scream:",
      attachments: stack
        ? [
            {
              fallback: "stacktrace",
              color: "danger",
              fields: stack.map(s => ({value: s, short: false})),
            },
          ]
        : [],
    });
  } else {
    console.warn("no SLACK_ERROR_HOOK configured");
    console.log(err, stack);
    return Promise.resolve(null);
  }
}

export default function reportError(err: Error): Promise<any>;
export default function reportError(err: string, stack: string): Promise<any>;
export default function reportError(err: string, stack: string[]): Promise<any>;
export default function reportError(
  err: string | Error,
  rawStack?: string | string[]
): Promise<any> {
  const stack = rawStack && (Array.isArray(rawStack) ? rawStack : rawStack.split("\n"));

  // annoying uncatchable error when browser disconnects from websocket
  if (err === "client error" && stack && stack.length && stack[0].includes("ECONNRESET")) {
    return Promise.resolve(null);
  }
  if (err instanceof Error) {
    return rawReportError(
      `${err.name}: ${err.message}`,
      (err.stack && err.stack.split("\n")) || []
    );
  } else {
    return rawReportError(err, stack || []);
  }
}

export function jobError(err: Error) {
  if (process.env.NODE_ENV === "development" || !process.env.SLACK_ERROR_HOOK) {
    console.error(err);
  } else {
    return reportError(err);
  }
}
