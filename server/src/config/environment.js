export function readEnvironment(env = process.env) {
  const production = env.NODE_ENV === "production";
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT must be a valid port number.");
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32)
    throw new Error(
      "Set JWT_SECRET to a random secret of at least 32 characters.",
    );
  if (!env.MONGODB_URI)
    throw new Error("Set MONGODB_URI before starting the API.");
  const clientOrigin =
    env.CLIENT_ORIGIN || (production ? "" : "http://127.0.0.1:5173");
  try {
    const url = new URL(clientOrigin);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== clientOrigin
    )
      throw new Error();
  } catch {
    throw new Error(
      "CLIENT_ORIGIN must be one exact http(s) origin, without a path or trailing slash. It is required in production.",
    );
  }
  const trustProxy = env.TRUST_PROXY ? Number(env.TRUST_PROXY) : false;
  if (
    trustProxy !== false &&
    (!Number.isInteger(trustProxy) || trustProxy < 1 || trustProxy > 10)
  )
    throw new Error(
      "TRUST_PROXY must be the known number of reverse-proxy hops (1–10), or omitted.",
    );
  const serveClient = env.SERVE_CLIENT === "true";
  return {
    serveClient,
    port,
    host: env.HOST || (production ? "0.0.0.0" : "127.0.0.1"),
    clientOrigin,
    trustProxy,
    mongodbUri: env.MONGODB_URI,
  };
}
