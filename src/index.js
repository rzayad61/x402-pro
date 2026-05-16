import "dotenv/config";
import express from "express";
import cors from "cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const config = {
  port: parseInt(process.env.PORT || "4021"),
  payTo: process.env.PAY_TO_ADDRESS || "0xb01C4d5723ef3716a091e8D851AC9f8F78A9d88F",
  network: process.env.NETWORK || "eip155:84532",
  facilitatorUrl: process.env.FACILITATOR_URL || "https://x402.org/facilitator",
  price: process.env.PRICE_PER_REQUEST || "0.001",
  agentName: process.env.AGENT_NAME || "x402 Pro Agent",
};

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const facilitatorClient = new HTTPFacilitatorClient({
  url: config.facilitatorUrl,
});

const server = new x402ResourceServer(facilitatorClient)
  .register(config.network, new ExactEvmScheme());

const routes = {
  "GET /settle": {
    accepts: [{
      scheme: "exact",
      price: `$${config.price}`,
      network: config.network,
      payTo: config.payTo,
    }],
    description: "x402 Pro Agent payment settlement",
    mimeType: "application/json",
  },
};

app.use(paymentMiddleware(routes, server));

app.get("/", (_req, res) => {
  res.json({
    x402Version: 1,
    accepts: [{
      scheme: "exact",
      network: config.network,
      maxAmountRequired: "1000",
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      payTo: config.payTo,
      description: "x402 Pro Agent — high-security payment settlement",
      mimeType: "application/json",
      resource: "https://x402agentpro.vercel.app/settle",
    }],
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", agent: config.agentName });
});

app.get("/settle", (_req, res) => {
  res.json({
    success: true,
    message: "Payment settled via x402 Pro Agent",
    settledAt: new Date().toISOString(),
  });
});

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(config.port, () => {
  console.log(`x402 Pro Agent running on port ${config.port}`);
});
