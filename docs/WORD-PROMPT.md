# Prompt for ChatGPT: turn a question-paper PDF (with solutions) into a Word file that `docx-ingest.js` can read

Give ChatGPT the PDF (best: in parts of about 30-45 questions) and paste the prompt below. Then give the Word file(s) to the assistant.
What the tool needs in the file: question numbers, 4 options labelled (1)-(4), "Answer (n)" and "Sol." lines, subject headings, real text (not a picture of text), figures as pictures in the right place. Nothing else.

## Prompt (copy from here)
```
I am uploading a question paper PDF that has, for every question, the options, the printed answer and a solution. Convert it into ONE Word file (.docx), exactly following these rules. Accuracy matters more than speed: do NOT solve, correct, shorten, improve or reorder anything. Copy what is printed.

STRUCTURE (plain paragraphs, no text boxes, no columns):
1. A line with only the subject name when the subject changes, in capital letters: PHYSICS / CHEMISTRY / BOTANY / ZOOLOGY (or BIOLOGY if the paper says so).
2. Each question starts a new paragraph:  "<number>. <question text>"  using the number printed in the paper (1, 2, 3 ...). Keep every statement, "Statement I / Statement II", Assertion / Reason, and "List-I / List-II" text exactly.
3. The four options, each on its own line, labelled exactly "(1) ...", "(2) ...", "(3) ...", "(4) ..." (use these labels even if the paper uses A, B, C, D). Do not put anything between the question and the options except a picture (see below).
4. The printed answer on its own line:  "Answer (n)"  where n is the printed option number. If the paper prints something else (for example "No option is correct", "Bonus", "*", "2/4*"), write it exactly:  "Answer (No option is correct)".
5. The printed solution: a line starting with "Sol." followed by the first line of the solution, then every further line of the solution as its own paragraph, in the same order. Keep every step, every formula, every number. Do not add your own explanation.
6. A blank line between questions is fine. Do NOT add page numbers, headers, footers, watermarks, "Page 3", "Continued", coaching names, QR codes or advertisements.

MATHS AND CHEMISTRY WRITING (this is important):
- Write formulas as plain Unicode text, never as an image: x², vₓ, H₂SO₄, Fe³⁺, SO₄²⁻, 10⁻⁶, μ₀, ε₀, √, ×, ÷, ≈, ≤, ≥, →, ⇌, π, λ, θ, Δ, Σ, ∫, ∞, °.
- Fractions as (numerator)/(denominator), for example (μ₀I²)/(2πr). Roots as √(...). Always write the brackets.
- Do not use LaTeX, markdown, asterisks or code formatting.
- Underlined, bold or italic words may stay formatted; do not add formatting of your own.

PICTURES (circuits, graphs, ray diagrams, structures, biology figures, tables drawn as images):
- Crop each picture from the PDF page at good resolution (at least 200 dpi) and insert it as an inline picture, in the paragraph position where it appears in the paper: a picture that belongs to the question goes directly after the question text (before the options); a picture that belongs to the solution goes inside the solution, where it appears. Insert the picture as a PNG; do not redraw it and do not describe it instead of inserting it.
- If the four OPTIONS are pictures (graphs or structures), insert the picture(s) after the question text and still write the four option lines as "(1) see picture", "(2) see picture", "(3) see picture", "(4) see picture".
- A table that is real text (for example match-the-column List-I / List-II) should be a normal Word table.

IF SOMETHING IS UNCLEAR: never guess. Write [UNCLEAR: what is unclear] at that place and carry on.

AT THE END, in the chat (not in the Word file), tell me: (a) the total number of questions you put in the file and the first and last question numbers, (b) the question numbers that contain pictures, (c) any question where you were not sure, (d) any question whose printed answer is not a plain option number. Then give me the .docx file for download.
```

## Before sending the file to the assistant (30 seconds)
- Open the Word file: the first and last question numbers and the total must match the paper (180 for a NEET paper). If ChatGPT did the paper in parts, either send the parts one by one or join them in order.
- Pick 3 questions at random and compare with the PDF: options, answer, a formula, a picture.
- Look for "[UNCLEAR" and fix or tell the assistant.
- Tell the assistant: the exam name and year (for example "NEET 2025") and whether the options are (1)-(4) or (a)-(d).
