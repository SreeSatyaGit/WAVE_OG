# Assay Run Monitor - Engineering Assessment

## Overview

This repository is the starter codebase for a take-home full-stack engineering assessment. It includes:

- a Flask API
- a React frontend built with Vite
- a small backend test suite with intentionally limited coverage

The application is an internal tool used to submit and track analytical assay runs.

The starter code is intentionally imperfect. Part of the assessment is your ability to review existing code, identify meaningful issues, and make pragmatic improvements instead of treating the task as a narrow feature ticket.

## What We Want To Evaluate

We are using this exercise to assess:

- full-stack implementation across backend and frontend
- engineering judgment and prioritization
- API design and error handling
- testing discipline
- code quality and maintainability
- clarity of written communication and tradeoff reasoning

## Your Task

Complete the following two parts.

### 1. Code Review And Improvement

Review the existing codebase, identify the issues you think matter most, and improve the ones you consider highest priority.

We care more about your prioritization and reasoning than about fixing every possible issue. You should not rewrite the whole application unless you can justify why that is the best use of time.

### 2. Feature: Result Summary On Terminal Transitions

Implement `result_summary` capture for terminal run transitions.

When a user marks a run as `completed` or `failed`:

- they should be prompted to enter an optional result summary before the status change is submitted
- the value should be persisted on the run
- the value should be visible in the run table

Assume the expected run lifecycle is:

- `pending -> running`
- `running -> completed`
- `running -> failed`

Invalid transitions should be rejected with an appropriate error response.

### Acceptance Criteria

Your submitted solution should satisfy these user-visible and API behaviors:

- A new run starts in `pending` with no `result_summary`.
- A `pending` run can be moved to `running`.
- A `running` run can be moved to `completed` or `failed`.
- A user is prompted for an optional `result_summary` when completing or failing a run.
- The terminal transition persists the submitted `result_summary`, including an intentionally blank summary.
- The run table shows the `result_summary` for terminal runs.
- Invalid transitions, invalid statuses, missing runs, and malformed create requests return clear error responses.
- The frontend surfaces failed create/update requests to the user instead of silently ignoring them.

## Expectations

Please treat this as more than a UI wiring task.

At a minimum, your solution should demonstrate thoughtful handling of:

- backend API behavior and validation
- user-visible error handling
- tests for changed behavior
- maintainable code organization
- documented assumptions and tradeoffs

## Suggested Scope

This exercise is intended to be completed in roughly 2-4 hours.

You do not need to productionize the entire application. Favor the most important correctness and maintainability improvements and explain what you would do next if you had more time.

## Ambiguity Is Intentional

Some product and engineering decisions are intentionally left unspecified. Make reasonable assumptions, implement a coherent solution, and document the tradeoffs in `SOLUTION.md`.

Examples of acceptable judgment calls include:

- whether `result_summary` should remain editable after a run reaches a terminal state
- how strictly to validate status transitions
- what response shape to use for validation and conflict errors
- how much frontend structure to introduce for a small codebase

## Starter Code Notes

The provided code is not meant to represent production quality. It contains gaps in validation, error handling, API consistency, state management, frontend feedback, and test coverage.

The backend tests are intentionally small. Some tests may describe desired behavior that the starter implementation does not yet satisfy. You may update tests when your API contract changes, but your changes should make the intended behavior clearer rather than weaker.

## Setup

Recommended versions:

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask --app app run --debug
```

API runs at `http://127.0.0.1:5000`

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://127.0.0.1:5173`

The frontend uses Vite for the local development server and production build. By default, it expects the API at `http://127.0.0.1:5000/api/v1`.

### Running Tests

```bash
cd backend
pytest tests/
```

Improving or correcting tests is part of the exercise.

## Project Structure

```text
software-engineering-assessment/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── apis/
│   │   │   ├── health.py
│   │   │   └── runs.py
│   │   ├── config.py
│   │   └── services/
│   │       └── run_store.py
│   ├── requirements.txt
│   └── tests/
│       ├── conftest.py
│       └── test_runs.py
└── frontend/
    ├── src/
    │   ├── bootstrap.jsx
    │   ├── App.jsx
    │   ├── index.jsx
    │   ├── pages/
    │   │   └── Home.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── features/
    │       └── runs/
    │           ├── components/
    │           └── services/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Submission

1. Clone this repository
2. Create a branch named `submission/your-name` (e.g. `submission/jane-smith`)
3. Complete the assessment on your branch
4. Push your branch and open a Pull Request against `main`
5. Let us know when your PR is ready for review

---

## Deliverables

Submit your changes to this repository and include a `SOLUTION.md` at the root covering:

- your prioritized code review findings
- what you changed and why
- tests you added or updated
- commands you ran and their results
- assumptions and tradeoffs
- what you intentionally left out and why

The provided `SOLUTION.md` is a template. Replace its placeholder content with your own submission notes.

## Evaluation Criteria

We will review:

- correctness of the implemented behavior
- quality of API and UI changes
- test quality
- maintainability of the resulting code
- prioritization and engineering judgment
- clarity of your written explanation

We do not grade visual polish heavily. A simple UI is acceptable if the behavior, error handling, and code organization are sound.
