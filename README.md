# LightWork Ops Tracker

A prototype operations agent for tracking team commitments and deadlines at LightWork AI. It's built for non-technical users (founders and a Founder's Associate): no code, no config files. Open the page and enter the team password.

**Live:** https://willgt99.github.io/ops-tracker/

## What it does

- **Board:** commitments grouped by team (Engineering, Product, Commercial, Operations), each with a status: on track, at risk, missed or done.
- **Attention needed:** flags approaching deadlines with no recent update. "Run daily check" drafts nudge messages to paste into Slack or email.
- **Log an update:** paste plain-English updates. AI matches each one to a commitment, and you confirm before anything changes.
- **Import goals:** paste a messy list of goals and deadlines. AI turns it into commitments you review before adding.
- **Weekly summary:** an AI-written summary across teams, which you can edit and copy.
- **Task pages:** click any task for its full history, stored data, edits and nudges.
- **Ask about tasks:** a chatbox that answers questions using only the tracker's data.

## How status works

Status is set by fixed rules, not by AI:

- **Missed:** past due and not done.
- **At risk:** the owner flagged a risk, or it's due within 7 days with no update for 5 or more days.
- **Needs update:** open with no update for 10 or more days.

AI only does language work: matching updates, extracting goals and writing summaries and answers. If the AI fails, built-in fallbacks take over, so the app never dead-ends.

## Trying it out

Sign in with the team password. Click **Import goals** and paste a list of goals with deadlines, then log updates against them. Everyone signed in sees the same board. **Clear all** deletes every commitment for everyone.

## How it's built

| Part | Tool | Why |
|---|---|---|
| App | One `index.html` on GitHub Pages | Free hosting, nothing to install |
| Data | Cloudflare D1 (free SQL database) | Shared across the team, same account as the Worker |
| AI | Groq free tier (`openai/gpt-oss-120b`) | Fast and free |
| Relay | Cloudflare Worker | Keeps the API key out of the public page, checks the team password, reads and writes the data |

## Limitations

- One shared password, not individual accounts, so there's no record of who changed what.
- If two people save at the same moment, the second change is rejected and that person is asked to redo it. Other people's changes appear within a minute, or when you return to the tab.
- The daily check is a button, not a scheduled job.
- Chat history is cleared when the page reloads.
- The password is remembered in the browser until you sign out, so sign out on shared computers.

## Setup

See [SETUP.md](SETUP.md) to deploy your own copy.
