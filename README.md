Expenso: Production-Grade Personal Finance Tracker

Live Application: [https://expenso-fenmo.vercel.app/]

🚀 Overview

Expenso is a minimal full-stack expense management tool built to handle real-world network conditions while maintaining strict financial data correctness. This project was developed as part of the Fenmo Technical Assessment.
🛠 Tech Stack

    Frontend: Next.js 15 (App Router), Tailwind CSS v4, shadcn/ui.

    Backend/Database: Convex (Type-safe Serverless Database & Real-time RPC).

    Utilities: UUID (Idempotency), Sonner (Toast Notifications).

🧠 Key Design Decisions
1. Financial Data Integrity (The "Money" Problem)

To avoid JavaScript's floating-point precision issues (e.g., 0.1 + 0.2 !== 0.3), Expenso treats money as a first-class citizen:

    Integer Storage: All amounts are converted to the smallest currency unit (Paise) and stored as integers in the database.

    Conversion Logic: Floats are only used at the "edge" (UI input and display formatting). All backend logic and storage utilize amountInPaise.

2. Network Resiliency & Idempotency

As per the requirement to handle "unreliable networks and multiple clicks," I implemented a robust idempotency layer:

    Unique Keys: Every new expense form generates a unique UUID idempotencyKey on mount.

    Database Enforcement: The backend mutation checks an index for this key before performing an insert. If a client retries a request due to a network timeout or rapid button-mashing, the system identifies the duplicate and returns the existing record rather than creating a second charge.

3. Real-time Reactivity

Using Convex allowed for an "Optimistic UI" pattern. State updates (Totals, History) happen instantly via WebSockets. If a background sync or refresh occurs, the data remains consistent without manual state management boilerplate.
⚖️ Trade-offs & Constraints

    Convex vs. SQL: I chose Convex (BaaS) over a traditional PostgreSQL setup to maximize the 4-hour window. This allowed me to deliver a production-ready UI and bulletproof API logic rather than spending time on database migrations and ORM configuration.

    Authentication: Per the "minimal feature set" instructions, authentication was intentionally omitted to focus on data correctness and production-level API behavior.

    Testing: While I verified the build with npm run build and performed manual edge-case testing for negative values and idempotency, I prioritized end-to-end functionality over a comprehensive Jest suite given the timebox.

🚦 Features Implemented

    ✅ Create Expense: Validated positive amounts and required fields.

    ✅ Real-time Totals: Dynamically calculated based on the current filtered view.

    ✅ Category Filtering: Smooth server-side filtering.

    ✅ Date Sorting: Newest expenses always appear first.

    ✅ Mobile Responsive: Custom dark-themed UI optimized for all screen sizes.