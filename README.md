# NHubX SpeedX — Next-Gen Internet Speed Test

> **One Hub. Infinite Power.**  
> High-precision, zero-simulation edge bandwidth & latency testing platform powered by Cloudflare Anycast.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://speedx-8fd.pages.dev)
[![Cloudflare Workers](https://img.shields.io/badge/API-Cloudflare%20Workers-orange?style=for-the-badge&logo=cloudflareworkers&logoColor=white)](https://speedx-api.stharunindu.workers.dev)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

---

## 🌐 Live Deployments

- **Web Application**: [https://speedx-8fd.pages.dev](https://speedx-8fd.pages.dev)  
  *(Production custom domain: `https://speedx.nhubx.com`)*
- **API Worker**: [https://speedx-api.stharunindu.workers.dev](https://speedx-api.stharunindu.workers.dev)  
  *(Production custom domain: `https://api-speedx.nhubx.com`)*

---

## 🚀 Key Features

### 1. Speed Testing Engine
- **Incompressible Payloads**: Uses cryptographic high-entropy binary buffers (preventing gzip, deflate, or Brotli compression from distorting raw line speeds).
- **Parallel Chunk Streams**: Dispatches multiple concurrent download and upload streams to saturate gigabit connections without single-thread browser event loop throttling.
- **Sub-Millisecond Timing**: Measures byte throughput and RTT strictly with `performance.now()`.
- **RFC 3550 Standard Jitter**: Calculates latency variance using standard inter-arrival difference formulas ($J = \frac{\sum |RTT_i - RTT_{i-1}|}{N - 1}$).
- **Automatic Server & PoP Detection**: Identifies the nearest Cloudflare Edge Point of Presence (PoP) along with client ISP and public IP.
- **No Synthetic Simulations**: Unlike toy speed tests that render fake sine waves, SpeedX reflects 100% genuine network transit.

### 2. High-Tech UI / UX
- **Futuristic Dark Glassmorphic Design**: Clean, dark aesthetic with brand neon accents (`#ff5a00`), backdrop blurs, and responsive cards.
- **Precision Animated Speedometer**: SVG curved arc gauge with dynamic needle interpolation, active progress tracking, and digital readout.
- **Live Bandwidth Area Graph**: Time-series visualization using Recharts for instantaneous download and upload trajectories.
- **Diagnostic Cards**: Download (Mbps), Upload (Mbps), Ping (ms), and Jitter (ms) with live phase indicators.
- **Quality Scorecard**: Evaluates network suitability for Online Gaming, 4K Streaming, Video Calls, and Large File Transfers.
- **Shareable Results**: Quick one-click text/link report generator and clipboard copier.
- **Persistent History**: Results stored in Cloudflare D1 SQL database with local storage backup, exportable to CSV.

---

## 🛠️ Architecture & Technology Stack

```
SpeedX/
├── public/                 # Static assets, favicon, _redirects, _headers
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Header with logo, navigation, and edge indicator
│   │   ├── Speedometer.jsx     # Masterpiece SVG gauge & controls
│   │   ├── MetricCard.jsx      # Download, Upload, Ping, and Jitter cards
│   │   ├── SpeedGraph.jsx      # Real-time Recharts area graph
│   │   ├── ServerSelector.jsx  # Client & Edge server metadata
│   │   ├── ResultModal.jsx     # Benchmark summary & shareable report
│   │   └── Footer.jsx          # NHubX branding, links, version info
│   ├── pages/
│   │   ├── Home.jsx            # Main interactive speed test
│   │   ├── History.jsx         # Historical benchmark logs & CSV export
│   │   └── About.jsx           # Methodology & architecture details
│   ├── hooks/
│   │   └── useSpeedTest.js     # State machine for the test lifecycle
│   ├── services/
│   │   ├── speedEngine.js      # Core network measurement engine
│   │   └── api.js              # Cloudflare Worker API client
│   ├── utils/
│   │   └── formatters.js       # Units, RFC 3550 jitter, quality matrix
│   ├── App.jsx
│   ├── App.css                 # Custom glassmorphic styling
│   └── main.jsx
├── worker/
│   ├── src/
│   │   └── index.js            # Cloudflare Worker API endpoints
│   ├── schema.sql              # D1 database schema
│   └── wrangler.toml           # Worker bindings (D1, R2, Environment)
├── package.json
└── vite.config.js
```

### Cloudflare Services:
- **Cloudflare Workers**: High-performance edge compute handling `/api/ping`, `/api/download`, `/api/upload`, and `/api/history`.
- **Cloudflare R2**: Object storage for incompressible test files (`test-1mb.bin`, `test-5mb.bin`, `test-10mb.bin`).
- **Cloudflare D1**: Distributed SQLite database (`speedx-db`) storing anonymous test logs.
- **Cloudflare Pages**: Global CDN hosting the single-page React frontend.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and nearest Cloudflare data center info |
| `GET` | `/api/ping` | High-precision latency probe returning client IP, ISP, and PoP |
| `GET` | `/api/download?size=10mb` | Streams incompressible random binary data from R2 / memory stream |
| `POST` | `/api/upload` | Ingests binary upload payload, measures byte transfer rate |
| `GET` | `/api/history` | Fetches the latest 25 benchmark runs from Cloudflare D1 |
| `POST` | `/api/history` | Persists a completed speed test benchmark to Cloudflare D1 |

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the frontend dev server**:
   ```bash
   npm run dev
   ```

3. **Start local Worker with Wrangler**:
   ```bash
   npm run worker:dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🔒 Security & Privacy

- CORS restricted and origin-controlled.
- Strict Rate Limiting & Abuse Prevention (max 120 req/min per IP, max 25MB single stream).
- No personal user tracking, no third-party ad networks, and zero packet payload storage.

---

## 📄 License

MIT © [NHubX](https://nhubx.com) — *One Hub. Infinite Power.*
