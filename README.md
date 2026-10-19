# 🛠️ XPTO Tools

A collection of lightweight, high-performance developer utilities powered by Node.js, Express, and Redis.

![AI Dev Sweat & Tears](./public/xpto_tools_ai_humor.png)

> **AI-Powered Engineering at its Finest 🧠⚡**
> *This suite of tools was engineered using advanced artificial intelligence models utilizing billions of neural connections, thousands of GPU hours, and enough electrical power to light up a medium-sized city—all to deliver a super-efficient URL shortener and a Base58 utility. You're welcome.*

---

## 🚀 Included Tools

| Tool | Route | Notes |
|---|---|---|
| 🔗 URL Shortener | `/shortener` | Random collision-safe keys, http(s)-only validation, click counts and redirect logs |
| 🔠 Base58 Converter | `/base58` | Bitcoin alphabet, UTF-8 safe, runs in the browser |
| 🔑 Token Generator | `/token` | Hex / Base64 / Base62 / UUID / numeric, prefix, grouping, bulk export (Web Crypto) |
| ✂️ PDF Splitter | `/pdf-splitter` | One PDF per page + ZIP. A copy of the upload is kept server-side for admin review (auto-deleted after `PDF_RETENTION_DAYS`) |
| ✍️ PDF Signer | `/pdf-signer` | Drag/resize a signature image onto any page, fully client-side |
| 🖼️ Image to PDF | `/image-to-pdf` | Reorder images, choose page size/orientation, fully client-side |

Every tool with server-side activity has a dashboard under **`/admin`** (login required): logs, stats, and — for the shortener and PDF splitter — management actions.

---

## 🧱 Project layout

```
app.js                 Express bootstrap, security headers, route mounting
util/                  db (Redis), auth (sessions + rate limit), http helpers, log helpers
<tool>/index.js        Router for that tool: public page, API and admin endpoints
<tool>/index.html      Public UI           <tool>/admin.html   Admin UI
admin/                 Login + hub
public/xpto.css        Design system (tokens, light/dark theme, components)
public/xpto.js         Shared UI runtime: navbar, tool registry, toasts, modals, table helpers
```

New tool checklist: add an entry to `TOOLS` in `public/xpto.js`, create `<tool>/index.js` exporting a `router`, and mount it in `app.js`.

---

## 🛠️ Built With

* **Node.js** (v24+) - Core runtime
* **Express** - Fast, unopinionated web framework
* **Redis** (ioredis) - High-performance in-memory key-value database
* **HTML5 / CSS3** - Modern, custom dark-mode Glassmorphism UI (no heavy Tailwind, purely hand-crafted HSL styles)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and a Redis server running locally:
```bash
# Verify Node version
node -v

# Verify Redis is running
redis-cli ping
```

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd xpto-tools
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and set at least `ADMIN_EMAIL` and `ADMIN_PASSWORD`:
   ```bash
   cp .env.example .env
   ```

### Running the Application
To start the server:
```bash
npm start
```
The server will start on port `5000` (or your configured `PORT`).
- **Public Shortener UI**: `http://localhost:5000`
- **Admin Hub**: `http://localhost:5000/admin` (Default tools dashboard)

---

## 👨‍💻 Authors

* **Pilo Vieira** - *Initial Work & Architecture* - [GitHub](https://github.com/pilovieira) - [Website](http://pilovieira.com.br)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.