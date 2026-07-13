import app from "./app";
import { logger } from "./lib/logger";
import { startBackbone } from "./backbone/backboneRunner";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Event backbone (M4-a): dark by default; runs ONLY on the founder's exact
  // SYNDICATE_BACKBONE_ENABLED="true" opt-in. Never blocks or crashes listen.
  startBackbone();
});
