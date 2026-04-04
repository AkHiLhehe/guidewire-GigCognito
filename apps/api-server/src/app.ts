import express    from "express";
import cors       from "cors";
import policyRoutes from "./routes/policy.routes";
import claimRoutes  from "./routes/claim.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-server", ts: new Date().toISOString() });
});

app.use("/policy", policyRoutes);
app.use("/claims", claimRoutes);

export default app;
