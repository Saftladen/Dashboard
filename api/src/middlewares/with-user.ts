import {FastifyInstance} from "fastify";
import {getUserIdFromToken} from "../lib/token";

declare module "fastify" {
  interface FastifyRequest {
    meId: number | null;
  }
}

export default function withUser(fastify: FastifyInstance, idOnly: boolean = false) {
  fastify.addHook("preHandler", async function(this: FastifyInstance, req, reply) {
    const token = req.req.headers["x-auth-token"] || req.query["auth-token"];
    if (!token) {
      (req as any).meId = null;
    } else {
      const res = await getUserIdFromToken(req.db, token);
      req.meId = res.ok ? res.data.userId : null;
    }
    return;
  });
}
