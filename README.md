# Math-Quiz-Card
This is a math quiz card prototype powered by Gemini 2.0 Flash

## 📦 Setup Instructions

### 1. Clone the Project

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

---

### 3. Set Up Your API Key

#### Get a Gemini API Key
- Go to https://aistudio.google.com/app/apikey

#### Create a `.env` file in the backend folder:
```env
GEMINI_API_KEY=your-api-key-here
```

---

### 4. Start the App

#### Start Backend
```bash
cd backend
node server.js
```

#### Start Frontend
```bash
cd ../frontend
npm start
```

---

## 💡 Example Prompts Used

### Prompt for a Hint
```
Give only a short, single-sentence hint to help a student solve the following problem.
Do not include a full explanation, solution, or answer.

Q: Evaluate ∫₀^{π/2} sin⁴(x)cos³(x) dx
Student's answer: 1/5 (or whichever answer they selected)
Correct answer: 2/35
```

---

### Prompt for Steps Displayed on the Blackboard
```
Q: Evaluate ∫₀^{π/2} sin⁴(x)cos³(x) dx
Student's answer: 1/5 (or whichever answer they selected)
Correct answer: 2/35

Give only the step-by-step math solution using LaTeX, one step per line.
```

---

### Prompt for the Full Answer
```
The student answered this math question incorrectly:

Q: Evaluate ∫₀^{π/2} sin⁴(x)cos³(x) dx
They selected: 1/5 (or whichever answer they selected)
Correct answer: 2/35

Give a funny but kind, and concise explanation of why this is incorrect and how to solve it, as if you are a tutor explaining it to the student. Don't make fun of the student's incorrect answer.
This explanation is going to be spoken out loud, so don't include any text that is not meant to be spoken and make the math expressions easy to understand when spoken aloud, such as trig functions and exponents.
```

---

### Prompt for further questions
```
The student answered this math question incorrectly:

Q: Evaluate ∫₀^{π/2} sin⁴(x)cos³(x) dx
Correct answer: 2/35

You already gave them the explanation of how to solve the question. Here is what the student said in response: ${studentAnswer}
Respond in a kind and concise manner, as if you are a tutor explaining it to the student. 
This explanation is going to be spoken out loud, so don't include any text that is not meant to be spoken and make the math expressions easy to understand when spoken aloud, such as trig functions and exponents.
Give only a short, single-sentence hint to help a student solve the following problem.
Do not include a full explanation, solution, or answer.
```

---

## 🚀 What I'd Improve With More Time

- Use a more powerful AI (that would cost money)

- Add features to track student progress and make a leaderboard

- Make the AI tutor character animated

- Let users personalize their own avatar 

---

## 🛠 Tech Stack

- **Frontend**: React, CSS
- **Backend**: Node.js + Express
- **Technologies**: Gemini 2.0 Flash, KaTeX, Web Speech API