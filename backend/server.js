import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post('/api/feedback', async (req, res) => {
  const { question, studentAnswer, correctAnswer, type } = req.body;

  let prompt = "";

  if (type === "hint") {
    prompt = `
Give only a short, single-sentence hint to help a student solve the following problem.
Do not include a full explanation, solution, or answer.

Q: ${question}
Student's answer: ${studentAnswer}
Correct answer: ${correctAnswer}
Hint:
    `;
  } else if (type === "steps") {
    prompt = `
Q: ${question}
Student's answer: ${studentAnswer}
Correct answer: ${correctAnswer}

Give only the step-by-step math solution with no necessary words, one step per line.
    `;
  } else if (type === "full") {
    prompt = `
The student answered this math question incorrectly:

Q: ${question}
They selected: ${studentAnswer} from a list of multiple choice answers.
Correct answer: ${correctAnswer}

Give a funny but kind, and concise explanation of why this is incorrect and how to solve it, as if you are a tutor explaining it to the student. Don't make fun of the student's incorrect answer.
This explanation is going to be spoken out loud, so don't include any text that is not meant to be spoken and make the math expressions easy to understand when spoken aloud, such as trig functions and exponents.
    `;
  } else {
    prompt = `
The student answered this math question incorrectly:

Q: ${question}
Correct answer: ${correctAnswer}

You already gave them the explanation of how to solve the question. Here is what the student said in response: ${studentAnswer}
Respond in a kind and concise manner, as if you are a tutor explaining it to the student. 
This explanation is going to be spoken out loud, so don't include any text that is not meant to be spoken and make the math expressions easy to understand when spoken aloud, such as trig functions and exponents.
    `
  }

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.candidates[0].content.parts[0].text;
    res.send(response);
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).send("Error generating feedback");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});