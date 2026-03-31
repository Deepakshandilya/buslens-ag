# BusLens: Interview Prep & Architectural Deep Dive

This document serves as an in-depth reference answering the "Why" and "How" questions regarding **BusLens**. It's drafted to thoroughly convey your mastery of full-stack engineering, error handling, SQL constraint planning, and modern React methodologies.

---

## 🏗️ 1. Architectural Decisions

**Q: Why choose FastAPI over Django or Flask?**
> **A:** FastAPI is incredibly performant and was built precisely for asynchronous API ecosystems. By prioritizing explicitly typed structures through Pydantic v2, we catch schema validation errors early. While Django includes an ORM and admin panel natively, BusLens benefits from FastAPI's microservice-styled agility, which pairs perfectly with Next.js, and automatic Swagger docs out of the box.

**Q: Why use Raw SQL via SQLAlchemy instead of just the ORM?**
> **A:** ORMs abstracted logic can become heavily unoptimized (the "N+1 Query" problem). By relying on the `Repository Pattern`, I isolated raw `text()` SQL queries securely behind the framework. This allowed me to inject `SQLAlchemy` purely as a connection pooling manager while keeping direct control over how joins were formatted across transit tables (e.g., matching traversing bus-stops and dynamically mapping `.mappings().all()` strictly into dicts).

**Q: Why combine Zustand and TanStack React Query on the frontend?**
> **A:** It separates "Server State" from "Client State". 
> - **React Query (Server):** Handles caching `/stops`, `/routes`, and mutations. I don't write complex `useEffect` data-fetching loops anymore. React query manages the loading/error bounds seamlessly. 
> - **Zustand (Client):** Is exclusively handling the global JWT App Session (`useAuthStore`). It's significantly lighter than Redux and has native `persist` capabilities allowing user session hydration from `localStorage` the micro-second the browser opens.

**Q: Why use App Router and Client Components tightly mixed?**
> **A:** Next.js App router separates Server and Client logically. Since BusLens involves highly interactive form states (dynamic gradient tracking, animated framer-motion cards), most routes required `"use client"`. However, to prioritize SEO, we cleverly preserved Next.js Server properties by shifting page-level static parameters into `layout.tsx` layouts specifically exporting `generateMetadata` bindings dynamically over client routes.

**Q: Why extract `PageBackground`? Doesn't a simple CSS class do the job?**
> **A:** Keeping it DRY. We had a complex series of layered, pointer-event-ignoring nested `<div>`s that represented glowing blur orbs. Rather than copying 15 lines of gradient tailwind logic into 5 separate pages, encapsulating it directly into `PageBackground.tsx` unified the design system, allowing us to patch layout aesthetics from a single file later.

---

## 🛠️ 2. Challenges & Errors Faced (and How You Solved Them)

**Q: What was the hardest bug you squashed during authentication routing?**
> **A:** **Infinite Loop API Re-routing.** 
> When users had an expired JWT in their LocalStorage, every `useQuery` call hitting `/me/favorites` logged a 401 error. My Axios interceptor was built to gracefully route them to `/login`, but since React Query defaults to retrying failed requests 3 times, it repeatedly hammered the backend before redirecting the User. I solved this centrally by attaching `enabled: !!isAuthenticated` inside the custom query hooks. No auth token = no pointless network requests = lower backend payload.

**Q: Tell me about a database constraint issue you faced during testing.**
> **A:** **The `pytest` MySQL Auto_Increment Teardown Bug.** 
> I was creating an end-to-end `pytest` environment utilizing `Session` dependency overrides injecting a mock-database. During tests, the cleanup script ran `DELETE FROM stops;` intending to wipe rows to give tests a blank slate. However, `DELETE FROM` doesn't reset the `AUTO_INCREMENT` IDs, which meant test #1 used Stop ID 1, but test #3 expected Stop ID 1 and got Stop ID 14!
> 
> *The Solution:* Instead of blindly inserting stops, I explicitly programmed the Test Environment Fixtures in `conftest.py` to hardcode IDs `(1, 'Kharar')`. Simultaneously, I had to momentarily wrap `SET FOREIGN_KEY_CHECKS = 0;` across our teardown scope to force-drop dependency tables (`users`, `favorites`, `search_history`) allowing clean execution resets between test suites reliably.

**Q: What was a validation discrepancy you found between Client and Server?**
> **A:** FastAPI accepts blank payloads as optional (`{}`), yet NextJS forms were dispatching validations manually expecting `422 Unprocessable Entities`. Specifically, in our favorites API, since both `route_id` and `stop_id` were optional independently, standard Pydantic validation bypassed empty bodies returning `200` blindly. I had to explicitly catch the null combinations in Python and manually raise `HTTPException(status_code=400, detail="Must provide either route_id or stop_id")`, bringing our Backend strict logic in sync with how our Zod Frontend caught errors.

---

## 🔐 3. Security Fundamentals Explained

**Q: How do you handle secrets currently?**
> **A:** Previously, there was a default fallback allowing `SECRET_KEY` to load insecurely in Python configurations causing a data-bleed if unmonitored. Now, the FastAPI `config.py` forcefully expects explicit `.env` allocations on initialization. If `APP_ENV != 'local'` without a valid key, the app hard crashes immediately preventing misconfigured pods/servers from launching publicly.

**Q: Are passwords safe in your database?**
> **A:** Yes, users' plain-text passwords never touch the DB. The `create_user` auth flow converts the password via `passlib` context generating a `bcrypt` salt and hash natively. Even if the DB is compromised, reversing bcrypt hashes takes exhaustive computational power protecting user accounts.

---

## ⚡ 4. Frontend Resilience

**Q: How do you handle frontend API errors to ensure users aren't left staring at blank screens?**
> **A:** Three distinct layers:
> 1.  **Forms (Pre-Flight):** Zod constraints embedded inside `react-hook-form` physically stop users parsing dirty POST requests (e.g. wrong email regex).
> 2.  **React Query (In-Flight):** Leveraging `isLoading`, `isError`, and graceful retry configurations rendering beautiful Shadcn Skeleton cards while awaiting the backend.
> 3.  **Toasts (Post-Flight):** Global sonner popups relay the exact backend error payload via `toast.error(err.response.data.detail)` so users precisely know what to fix.
