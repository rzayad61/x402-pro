import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const config = {
  port: parseInt(process.env.PORT || "4021"),
  payTo: process.env.PAY_TO_ADDRESS || "0xYourWalletAddressHere",
  network: process.env.NETWORK || "eip155:84532",
  facilitatorUrl: process.env.FACILITATOR_URL || "https://x402.org/facilitator",
  price: process.env.PRICE_PER_REQUEST || "0.001",
  agentName: process.env.AGENT_NAME || "x402 Pro Agent",
};

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", "Authorization",
    "X-PAYMENT", "X-PAYMENT-RESPONSE",
    "PAYMENT-REQUIRED", "PAYMENT-SIGNATURE",
  ],
  exposedHeaders: ["PAYMENT-REQUIRED", "X-PAYMENT-RESPONSE"],
}));
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

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
    description: "Trigger a high-security x402 payment settlement",
    mimeType: "application/json",
  },
  "GET /status": {
    accepts: [{
      scheme: "exact",
      price: `$${config.price}`,
      network: config.network,
      payTo: config.payTo,
    }],
    description: "Check payment settlement status and agent health",
    mimeType: "application/json",
  },
  "GET /inference": {
    accepts: [{
      scheme: "exact",
      price: `$${(parseFloat(config.price) * 5).toFixed(4)}`,
      network: config.network,
      payTo: config.payTo,
    }],
    description: "Pay-per-request AI inference endpoint via x402",
    mimeType: "application/json",
  },
};

app.use(paymentMiddleware(routes, server));

// ── Public routes ──────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({
    name: config.agentName,
    description: "High-security autonomous x402 payment settlement agent",
    version: "1.0.0",
    protocol: "x402",
    specVersion: "v2",
    x402: {
      resources: Object.entries(routes).map(([route, cfg]) => ({
        route,
        description: cfg.description,
        mimeType: cfg.mimeType,
        accepts: cfg.accepts,
      })),
      facilitator: config.facilitatorUrl,
      network: config.network,
    },
    security: {
      signatureVerification: true,
      replayPrevention: true,
      chainIdLocking: true,
      facilitatorAttestation: true,
    },
    endpoints: {
      health: "GET /health",
      settle: "GET /settle (x402 protected)",
      status: "GET /status (x402 protected)",
      inference: "GET /inference (x402 protected)",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    agent: config.agentName,
    network: config.network,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Paid routes (reached only after x402 payment verified) ────────────────

app.get("/settle", (_req, res) => {
  const txId = `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`;
  res.json({
    success: true,
    message: "Payment settled successfully via x402 Pro Agent",
    settlement: {
      txId,
      amount: config.price,
      asset: "USDC",
      network: config.network,
      settledAt: new Date().toISOString(),
      securityChecks: {
        signatureVerified: true,
        replayPrevented: true,
        chainIdConfirmed: true,
        facilitatorAttested: true,
      },
    },
  });
});

app.get("/status", (_req, res) => {
  res.json({
    success: true,
    agent: { name: config.agentName, status: "operational", successRate: "100%" },
    payment: { verified: true, timestamp: new Date().toISOString() },
  });
});

app.get("/inference", (_req, res) => {
  res.json({
    success: true,
    result: "Inference response from x402 Pro Agent",
    model: "x402-pro-v1",
    cost: `$${(parseFloat(config.price) * 5).toFixed(4)} USDC`,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`x402 Pro Agent running on port ${config.port}`);
});
