# LightWork Ops Tracker

A prototype operations agent for tracking team commitments and deadlines at LightWork AI. It's built for non-technical users (founders and a Founder's Associate): no code, no config files, just open the page.

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

The board starts empty. Click **Import goals** and paste a list of goals with deadlines, then log updates against them. Use the **Today** date picker in the header to move the date forward and watch statuses change. **Clear all** deletes every commitment.

## How it's built

| Part | Tool | Why |
|---|---|---|
| App | One `index.html` on GitHub Pages | Free hosting, nothing to install |
| Data | Browser localStorage | No database or sign-in needed |
| AI | Groq free tier (`openai/gpt-oss-120b`) | Fast and free |
| Relay | Cloudflare Worker | Keeps the API key out of the public page |

## Limitations

- Data is stored in each person's own browser, so it isn't shared between users or devices.
- The daily check is a button, not a scheduled job.
- Chat history is cleared when the page reloads.
- The repo is public, and data stays in the browser only, so don't enter anything confidential on a shared computer.
