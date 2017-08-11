import Token from "../models/token";

const NAME = "auth";

export const failOnNonAuth = server =>
  server.ext(
    "onPreHandler",
    (request, reply) => {
      if (request.userId) {
        reply.continue();
      } else {
        reply({ok: false, error: "unauthenticated"}).code(401);
      }
    },
    {sandbox: "plugin"}
  );

const plugin = (server, options, next) => {
  server.ext({
    type: "onPreHandler",
    method: function(request, reply) {
      const token =
        request.headers["x-auth-token"] ||
        request.query["auth-token"] ||
        request.params["auth-token"];
      if (token) {
        console.log("token", token);
        Token.getVerifiedData(request.pg, Token.Type.AuthToken, token)
          .then(({userId}) => {
            request.userId = userId;
            return;
          })
          .then(() => reply.continue(), () => reply.continue());
      } else {
        reply.continue();
      }
    },
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;
