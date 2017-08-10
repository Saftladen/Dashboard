import Token from "../models/token";

const NAME = "auth";

const plugin = (server, options, next) => {
  server.ext({
    type: "onPreHandler",
    method: function(request, reply) {
      if (request.path.startsWith("/public/")) {
        reply.continue();
      } else {
        const token =
          request.headers["x-auth-token"] ||
          request.query["auth-token"] ||
          request.params["auth-token"];
        if (token) {
          Token.getVerifiedData(request.pg, Token.Type.AuthToken, token)
            .then(({userId, accountId}) => {
              request.userId = userId;
              request.accountId = accountId;
              return;
            })
            .then(
              () => reply.continue(),
              () => {
                reply({ok: false, error: "unauthenticated"}).code(401);
              }
            );
        } else {
          reply({ok: false, error: "unauthenticated"}).code(401);
        }
      }
    },
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;
