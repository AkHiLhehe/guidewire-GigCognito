import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { startTriggerPoller } from "./services/trigger/trigger-poller.service";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  startTriggerPoller();
});
