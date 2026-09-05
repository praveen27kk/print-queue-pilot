# Print Queue Pilot

Build a Print Job Scheduler web app for an office.

Users can:

- Submit a print job with: document name, number of pages, and a priority

  (Urgent, Normal, Low)

- See a live queue of all pending jobs, sorted so Urgent jobs always

  appear above Normal, and Normal above Low. Within the same priority,

  older jobs appear first (first-in-first-out).

- Cancel their own job while it's still "Queued" (not yet "Printing"

  or "Completed")

- See job status change: Queued -> Printing -> Completed

- An admin view with a "Process Next Job" button that takes the

  highest-priority, oldest job in the queue and marks it Printing,

  then Completed after a few seconds (simulating the printer)

Design: clean, minimal dashboard style, a table/list for the queue,

color-coded priority badges (red=Urgent, yellow=Normal, gray=Low).

Do not set up the database yet — just build the UI with mock/sample

data for now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6768be8b-1b46-4c66-bf8e-40968a3bb13f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
