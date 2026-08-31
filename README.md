# Skill Navigator

Update the existing Skill Maps project based on these requirements.

Main goal

The current interface feels too cluttered and contains too much information at once.

Simplify it significantly.

The product should feel like a clean AI career navigator where the user can quickly understand:

Where am I → Where do I want to go → What should I do next?

Do not redesign the entire concept. Keep the existing Skill Maps direction, but simplify the experience.

1. Reduce clutter

Remove unnecessary cards, statistics, duplicate information and unused sections.

Do not show detailed analytics directly on the main dashboard.

Show only important information.

Detailed information should appear only after the user clicks an action.

Remove unused files, components and redundant code from the current project.

Keep the project structure simple.

2. Connect Profiles

Keep a single Connect Profiles action.

When clicked, open a small tab/modal/window within the same page.

Show:

GitHub

LinkedIn

LeetCode

HackerRank

Each should have:

Connect

Connected

Disconnect

Implement the actual backend connection/integration for these four platforms where official authentication/API access is available.

The profile data should later be available to Skill Maps for analysis.

Do not build the rest of the backend logic. I will implement the remaining backend myself.

3. Create Career Path

Create one major button called:

Create Career Path

It should allow the user to enter:

Target career

Timeline

Available learning time

Example:

Data Engineer
2 months
6 hours/week

After submission, display a simple personalized learning path.

Do not show too much information at once.

4. I'm Confused

Create another major button:

I'm Confused

Use it for career and skill decisions.

Options:

Which career should I choose?

Which programming language should I focus on?

What am I good at?

What should I learn next?

The recommendation should be based on the user's connected profile data and current learning information.

The system should recommend, not force the user.

5. Understand Me

Keep an Understand Me action.

This should allow the user to understand and modify their generated path.

It should support:

Change career path

Change preferred programming language

Skip a learning step

Add/remove a learning step

Ask why something was recommended

Regenerate the learning path

Keep this interaction simple.

6. Learning Path

Show the generated career path as a simple progression:

Completed → Current → Next → Upcoming

Do not display every course, explanation and statistic directly.

Clicking a step can open its details.

7. Weekly Goals

Show only the current week's important goals.

Example:

Week 3

✓ Complete SQL
✓ Solve 20 problems
✓ Build ETL project
○ Push project to GitHub

Keep it compact.

8. Weekend Review

Have a simple weekend review section showing:

Goals completed

Pending goals

Weekly progress

Skill improvement

Next week's main goal

Example:

3/4 goals completed
Complete the ETL project before Sunday.

Do not turn this into a large analytics dashboard.

9. AI Mentor

Keep one simple AI input box.

It should contain:

"Ask your mentor..."

Include a small microphone icon inside the input box for voice input.

Keep this section visually simple.

10. Important buttons

The two most important actions should be:

Create Career Path

and

I'm Confused

Make both buttons rounded/pill-shaped and visually prominent using a tasteful red + pink multi-color gradient.

Do not use this strong gradient everywhere. Reserve it for these two primary actions.

11. Navigation

Keep navigation extremely simple.

Avoid:

Too many tabs

Multiple dashboards

Unnecessary pages

Repeated information

Large collections of cards

The main experience should be:

Dashboard → Connect Profiles → Understand Me → Create Career Path → Learning Path → Weekly Goals → Weekend Review

12. Backend scope

Implement only the backend required for:

GitHub connection

LinkedIn connection

LeetCode connection

HackerRank connection

Use proper official authentication/API mechanisms where available.

Do not implement the complete recommendation engine, AI engine, database architecture or other backend systems yet. Those will be implemented separately.

Final requirement

Keep the existing Skill Maps concept, but make the application feel:

Simple

Clean

Focused

Less crowded

Action-oriented

Easy to understand

The user should never feel overwhelmed by information.

One screen should communicate one clear decision or action.

Do not add unnecessary features just to make the interface look complete.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/45b93c16-b72e-4757-8465-c725efcc133c).

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
