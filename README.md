# ⚡ x402 Pro Agent

> High-security autonomous x402 payment settlement server — ready to deploy & register on [x402scan](https://www.x402scan.com).

---

## What This Is

A production-ready Express server that implements the **x402 V2 protocol**, exposing paid HTTP endpoints that:

- Return a `402 Payment Required` response with full `PAYMENT-REQUIRED` headers
- Verify payments via the CDP facilitator (on-chain, trustless)
- Serve resources only after cryptographic settlement confirmation
- Auto-register on **x402scan** via its discovery document at `GET /`

---

## Endpoints

| Endpoint | Auth | Price | Description |
|---|---|---|---|
| `GET /` | Free | — | Discovery document (x402scan reads this) |
| `GET /health` | Free | — | Health check |
| `GET /settle` | x402 | $0.001 | Payment settlement confirmation |
| `GET /status` | x402 | $0.001 | Agent status with payment proof |
| `GET /inference` | x402 | $0.005 | Pay-per-request AI inference |

---

## Quick Start (Local)

```bash
# 1. Clone / enter the folder
cd x402-pro-agent

# 2. Install deps
npm install

# 3. Configure
cp .env.example .env
# Edit .env — set PAY_TO_ADDRESS to your wallet

# 4. Run (testnet)
npm start
# → http://localhost:4021
```

---

## Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add PAY_TO_ADDRESS
vercel env add NETWORK          # eip155:8453 for mainnet
vercel env add FACILITATOR_URL  # https://api.cdp.coinbase.com/platform/v2/x402
vercel env add PRICE_PER_REQUEST

# Re-deploy with env vars
vercel --prod
```

## Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

railway login
railway init
railway up

# Set env vars in Railway dashboard
```

## Deploy with Docker

```bash
docker build -t x402-pro-agent .

docker run -d \
  -p 4021:4021 \
  -e PAY_TO_ADDRESS=0xYourWallet \
  -e NETWORK=eip155:84532 \
  -e FACILITATOR_URL=https://x402.org/facilitator \
  -e PRICE_PER_REQUEST=0.001 \
  x402-pro-agent
```

---

## Register on x402scan

Once your server is deployed and live:

1. **Go to** → https://www.x402scan.com/resources/register
2. **Enter your URL** → `https://your-deployment-url.vercel.app`
3. x402scan hits `GET /` on your server, reads the discovery JSON, and **auto-registers all your endpoints**
4. Your agent appears in the x402scan marketplace as **"x402 Pro Agent"**

### What x402scan reads from your `GET /` response:

```json
{
  "name": "x402 Pro Agent",
  "x402": {
    "resources": [...],
    "facilitator": "https://x402.org/facilitator",
    "network": "eip155:84532"
  }
}
```

---

## Go Mainnet

Edit your `.env`:

```env
NETWORK=eip155:8453
FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
CDP_API_KEY_NAME=your-key-name
CDP_API_KEY_PRIVATE_KEY=your-private-key
```

Get CDP API keys at → https://portal.cdp.coinbase.com/

---

## Security Features

| Feature | Details |
|---|---|
| 🔐 Signature verification | EIP-712 typed-data signed payloads, verified by facilitator |
| 🛡️ Replay prevention | Unique nonce + expiry window per payment |
| ⛓️ Chain ID locking | Payments bound to CAIP-2 network ID |
| ⚖️ Amount bounds | Exact amount enforced by EVM scheme |
| ✅ Facilitator attestation | On-chain confirmation before resource delivery |
| 🔁 Retry-safe | Idempotent nonces — safe to retry without double-spend |
| 🔒 Helmet headers | Security HTTP headers via `helmet` |
| 🚦 Rate limiting | 120 req/min on public endpoints |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PAY_TO_ADDRESS` | ✅ | — | Your wallet to receive USDC |
| `NETWORK` | | `eip155:84532` | CAIP-2 network ID |
| `FACILITATOR_URL` | | x402.org (testnet) | Facilitator endpoint |
| `PRICE_PER_REQUEST` | | `0.001` | USDC price per call |
| `PORT` | | `4021` | Server port |
| `AGENT_NAME` | | `x402 Pro Agent` | Name shown in discovery |
| `CDP_API_KEY_NAME` | mainnet | — | CDP API key name |
| `CDP_API_KEY_PRIVATE_KEY` | mainnet | — | CDP private key |

---

## Resources

- [x402 Docs](https://docs.cdp.coinbase.com/x402/welcome)
- [x402scan](https://www.x402scan.com)
- [x402 GitHub](https://github.com/coinbase/x402)
- [CDP Portal](https://portal.cdp.coinbase.com/)
- [x402 Discord](https://discord.gg/cdp)
