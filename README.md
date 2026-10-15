# LightWork Ops Tracker

A prototype operations agent for tracking team commitments and deadlines at LightWork AI. It's built for non-technical users (founders and a Founder's Associate): no code, no config files. Open the page and enter the team password.

**Live:** https://willgt99.github.io/ops-tracker/

## What it does

- **Board:** commitments grouped by team (Engineering, Product, Commercial, Operations), each with a status: on track, at risk, missed or done.
- **Attention needed:** flags approaching deadlines with no recent update. "Run daily check" drafts nudge messages to paste into Slack or email.
- **Log an update:** paste plain-English updates. The AI logs the note, flags risk, marks work done, and moves due dates or owners. Clear updates are applied straight away, with an Undo button. Anything unclear (an ambiguous match, a date in the past, low AI confidence) waits for you to confirm. Updates applied by the AI are tagged in each task's history.
- **Import goals:** paste goals in any format (a list, meeting notes, an email). An AI agent first reads the whole text and gathers every fact for each goal, even when owners or dates are in a separate section. It then works through the goals one at a time, creating each task (or updating an existing one) with owner, due date, team, dated progress updates, risks and completion. The app checks each action and reports errors back to the agent, which corrects itself. Before asking you anything, the agent checks its questions against the text and answers the ones it can. Everything is saved with an Undo button. Answer the remaining questions and it updates the tasks, or skip and the tasks keep what they have.
- **Teams:** an editable team list (add, rename, remove), shared by everyone. The import agent can add a team it finds in your text.
- **Weekly summary:** an AI-written summary across teams, which you can edit and copy.
- **Task pages:** click any task for its full history, stored data, edits and nudges.
- **Ask about tasks:** a chatbox that answers questions using only the tracker's data.

## How status works

Status is set by fixed rules, not by AI:

- **Missed:** past due and not done.
- **At risk:** the owner flagged a risk, or it's due within 7 days with no update for 5 or more days.
- **Needs update:** open with no update for 10 or more days.

AI only does language work: reading updates, extracting goals and writing summaries and answers. Whether an AI-read update is applied without asking is also decided by fixed checks, not by the AI alone. If the AI fails, built-in fallbacks take over, so the app never dead-ends.

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
- Groq's free tier allows 8,000 tokens a minute. The import agent handles up to 4 goals per AI call, keeps each request small, and paces itself using the remaining allowance Groq reports, so a 16-goal update takes about 5 calls (roughly 1 to 2 minutes).
- The password is remembered in the browser until you sign out, so sign out on shared computers.

## Setup

See [SETUP.md](SETUP.md) to deploy your own copy.
