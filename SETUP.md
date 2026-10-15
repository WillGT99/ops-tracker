# Setup

Everything here is on free tiers. You need a Groq account, a Cloudflare account and a GitHub account.

## 1. Groq

Create an API key at console.groq.com (API Keys > Create). Copy it somewhere safe.

## 2. Cloudflare database

In the Cloudflare dashboard, go to **Storage & Databases > D1** and create a database called `lightwork`. You don't need to create any tables, because the Worker does that itself.

## 3. Cloudflare Worker

1. Go to **Workers & Pages**, create a Worker (or open your existing one), click **Edit code**, paste in `worker.js` and click **Deploy**.
2. In the Worker's **Settings > Bindings**, add a **D1 database** binding. Set the variable name to `DB` and pick the `lightwork` database.
3. In **Settings > Variables and Secrets**, add:

| Name | Type | Value |
|---|---|---|
| `GROQ_API_KEY` | Secret | Your Groq key |
| `APP_PASSWORD` | Secret | The team password you'll share |
| `ALLOWED_ORIGIN` | Text | Your GitHub Pages address, e.g. `https://willgt99.github.io` (no trailing slash, no path) |
| `MODEL` | Text, optional | Defaults to `openai/gpt-oss-120b` |

4. Copy the Worker's URL (shown on its overview page).

To change the password later, edit `APP_PASSWORD`. Everyone is signed out and asked for the new one.

## 4. GitHub Pages

1. In `index.html`, set `WORKER_URL` near the top of the script to your Worker URL.
2. Push the repo to GitHub, then go to **Settings > Pages** and choose **Deploy from a branch**, `main`, root folder.
3. Open the Pages address and sign in with the team password.

If `WORKER_URL` is left as the placeholder, the app still runs, but data is saved only in that browser and the AI features use the simple built-in fallbacks.

## Troubleshooting

- **"Wrong password"** even with the right one: check `APP_PASSWORD` has no extra spaces.
- **"Couldn't connect (can't reach the server)"**: usually `ALLOWED_ORIGIN` doesn't match the Pages address exactly.
- **"D1 database not bound"**: the binding's variable name must be exactly `DB`.
