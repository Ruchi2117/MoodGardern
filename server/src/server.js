import "dotenv/config";
import { access } from "node:fs/promises";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { readEnvironment } from "./config/environment.js";
import User from "./models/User.js";
import Ritual from "./models/Ritual.js";
import MoodEntry from "./models/MoodEntry.js";
const config = readEnvironment();
if (config.serveClient)
  await access(new URL("../../client/dist/index.html", import.meta.url));
await connectDatabase(config.mongodbUri);
await Promise.all([User.init(), MoodEntry.init(), Ritual.init()]);
const server = createApp(config).listen(config.port, config.host, () =>
  console.log(`MoodGarden API listening on ${config.host}:${config.port}`),
);
server.on("error", async (error) => {
  console.error(`API could not start: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
let shuttingDown = false;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    const deadline = setTimeout(() => {
      server.closeAllConnections();
      void mongoose.disconnect();
    }, 10000);
    deadline.unref();
    server.close(async () => {
      clearTimeout(deadline);
      await mongoose.disconnect();
    });
  });
