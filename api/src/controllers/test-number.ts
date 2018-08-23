import * as fastify from "fastify";
import {Server, IncomingMessage, ServerResponse} from "http";
import connectPg from "../middlewares/pg";
import {getNumberData} from "../models/tiles/ShowNumber";

const testNumberController: fastify.Plugin<Server, IncomingMessage, ServerResponse, {}> = async (
  instance,
  options,
  next
) => {
  connectPg(instance);

  instance.post("/test-number", async request => {
    const {url, method, headers, body} = request.body;
    const {data, status} = await getNumberData({
      url,
      method,
      headers: JSON.parse(headers),
      body,
    }).catch(e => {
      if (e.response) {
        return {status: e.response.status || 500, data: e.response.data};
      } else {
        return {data: e.message, status: 500};
      }
    });
    return {data, status};
  });

  if (next) next();
};

export default testNumberController;
