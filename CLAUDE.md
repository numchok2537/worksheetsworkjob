# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A weekly worksheet (ใบงาน) web app for a Thai vocational college (ปวช.) computer technician program at วิทยาลัยเทคนิคนครสวรรค์. Lets a teacher and students pick a subject and week, preview the worksheet, and print it. A separate, unlinked teacher view shows the same worksheets with answer keys filled in.

Plain static site — no build step, no backend, no framework. Open `index.html` directly through a local static file server (e.g. `python3 -m http.server`) since worksheet data is loaded via `fetch()`, which requires HTTP rather than `file://`.

## Structure

- `index.html` / `js/app.js` — student-facing worksheet browser (subject/week select → preview → print).
- `teacher.html` / `js/teacher.js` — same browser but renders answer keys. Deliberately not linked from `index.html`; reachable only by direct URL. This is a low-security convenience measure, not real access control — anyone with the URL can view it.
- `js/render.js` — shared rendering: `renderWorksheet()` for lesson-type worksheets (objectives/content/questions, with an `examWeek` short-circuit for final-exam placeholder weeks), `renderLogWorksheet()` for the internship subject's weekly activity-log format.
- `css/style.css` — all styling, including print rules (`@media print` hides the toolbar) and the embedded TH Sarabun PSK font (`assets/fonts/`, SIL OFL licensed).
- `data/subjects.json` — the subject list. Each entry has `code`, `name`, `type` (`"lesson"` or `"log"`), `totalWeeks`. Add a subject here to make it selectable — no code changes needed.
- `data/worksheets/{subjectCode}-week{NN}.json` — one file per worksheet, `NN` zero-padded. Lesson-type schema: `subjectCode, subjectName, week, title, objectives[], content, questions[{type, prompt}], answerKey[]` (same length/order as `questions`). Log-type schema: `subjectCode, subjectName, week, title, objectives[], guidance, reflectionPrompts[]`. Exam-week placeholder: `subjectCode, subjectName, week, title, examWeek: true, content`.
- `assets/images/college-logo.png` — official college seal, sourced from the college's site.

## Content notes

The 6 subjects and their 18-week topic breakdowns follow the official หลักสูตร ปวช. 2567 curriculum (สาขาช่างเทคนิคคอมพิวเตอร์, รหัสสาขา 21909) for objectives/scope, but the official curriculum does not publish a week-by-week schedule — the per-week topics and all worksheet content (questions, answers, activity-log prompts) were drafted and should be treated as a first draft for the teacher to review, not verbatim official material.

## Running / testing

No build or test tooling. To check a change:
```
python3 -m http.server 8811 --directory .
```
then open `http://localhost:8811/index.html` (and `/teacher.html` for the answer-key view).
