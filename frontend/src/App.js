import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const rawOptions = [
  { label: <InlineMath math={"\\frac{2}{35}"} />, value: "2/35" },
  { label: <InlineMath math={"\\frac{1}{7}"} />, value: "1/7" },
  { label: <InlineMath math={"\\frac{1}{5}"} />, value: "1/5" },
  { label: <InlineMath math={"0"} />, value: "0" }
];

function App() {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hintText, setHintText] = useState("");
  const [solutionSteps, setSolutionSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [options, setOptions] = useState([]);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const speechRef = useRef(null);

  const correctAnswer = "2/35";
  const questionText = "Evaluate ∫₀^{π/2} sin⁴(x)cos³(x) dx";
  const questionLatex = "\\int_0^{\\frac{\\pi}{2}} \\sin^4(x) \\cos^3(x)\\, dx";

  const speechSupported = typeof window !== 'undefined' &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    setOptions(shuffle(rawOptions));
  }, []);

  useEffect(() => {
    if (solutionSteps.length > 0 && showSteps) {
      animateSteps();
    }
  }, [solutionSteps, showSteps]);

  function shuffle(array) {
    return array
      .map(item => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  function speak(text, onEnd) {
    if (!speechSupported) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\\/g, ""));
    utterance.lang = "en-US";
    utterance.rate = 1.5;
    speechRef.current = utterance;
    utterance.onend = () => {
      setIsVoicePlaying(false);
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
    setIsVoicePlaying(true);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    speechRef.current = null;
    setIsVoicePlaying(false);
  }

  function toggleVoice() {
    stopSpeaking();
  }

  function handleSubmit() {
    setSubmitted(true);
    const correct = options[selected]?.value === correctAnswer;
    setIsCorrect(correct);
    setShowResultPopup(true);
    setHintText("");
    setFeedback("");
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    setShowSteps(correct);
  }

  async function getHint() {
    setLoading(true);
    const res = await axios.post("http://localhost:5000/api/feedback", {
      question: questionText,
      studentAnswer: options[selected]?.value,
      correctAnswer,
      type: "hint"
    });
    setHintText(res.data);
    setLoading(false);
  }

  async function getFullSolution() {
    setLoading(true);
    const basePayload = {
      question: questionText,
      studentAnswer: options[selected]?.value,
      correctAnswer
    };

    const [fbRes, stRes] = await Promise.all([
      axios.post("http://localhost:5000/api/feedback", { ...basePayload, type: "full" }),
      axios.post("http://localhost:5000/api/feedback", { ...basePayload, type: "steps" })
    ]);

    setFeedback(fbRes.data);
    setSolutionSteps(stRes.data.split(/\r?\n/).map(line => line.trim()).filter(Boolean));
    setCurrentStepIndex(0);
    setShowSteps(true);
    setLoading(false);
    speak(fbRes.data);
  }

  async function askFollowUp() {
    setIsListening(true);
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onstart = () => setIsListening(true);
    rec.onresult = async (event) => {
      const userQuestion = event.results[0][0].transcript;
      const res = await axios.post("http://localhost:5000/api/feedback", {
        question: questionText,
        studentAnswer: userQuestion,
        correctAnswer,
        type: "followup"
      });
      setFeedback(res.data);
      speak(res.data);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  }

  function animateSteps() {
    setCurrentStepIndex(0);
    let index = 0;
    const interval = setInterval(() => {
      setCurrentStepIndex(i => {
        if (i >= solutionSteps.length - 1) {
          clearInterval(interval);
          return solutionSteps.length;
        }
        return i + 1;
      });
      index++;
    }, 2000); // slowed to 2 seconds per step
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", position: "relative" }}>
      {/* Loading Spinner */}
      {loading && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 3000
        }}>
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px" }}>⏳ Loading...</div>
        </div>
      )}

      {/* Result Popup */}
      {showResultPopup && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
        }}>
          <div style={{
            background: "white", padding: "2rem", borderRadius: "8px",
            textAlign: "center", maxWidth: "500px", position: "relative"
          }}>
            <button style={{ position: "absolute", top: "10px", right: "10px" }}
              onClick={() => setShowResultPopup(false)}>✖</button>
            <h2>{isCorrect ? "✅ Correct!" : "❌ Incorrect!"}</h2>
            {!isCorrect && (
              <>
                <p>Need help?</p>
                <button onClick={() => { getHint(); setShowResultPopup(false); }}>Hint</button>
                <button onClick={() => { getFullSolution(); setShowResultPopup(false); }} style={{ marginLeft: "1rem" }}>Full Solution</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Layout */}
      <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
        {/* Quiz Card */}
        <div style={{
          flex: 1, background: "white", padding: "1.5rem", borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)", paddingBottom: "3rem", paddingLeft: "2rem",
        }}>
          <h2>Math Quiz</h2>
          <p><strong>Q:</strong> <InlineMath math={questionLatex} /></p>

          {options.map((opt, idx) => (
            <div key={idx} style={{ marginBottom: "0.75rem" }}>
              <input
                type="radio"
                id={`opt-${idx}`}
                name="options"
                checked={selected === idx}
                onChange={() => setSelected(idx)}
              /> <label htmlFor={`opt-${idx}`}>{opt.label}</label>
            </div>
          ))}

          <button onClick={handleSubmit} disabled={selected === null} style={{ marginTop: "1rem" }}>
            Submit
          </button>

          {hintText && (
            <div style={{
              marginTop: "1rem", background: "#f5f5f5", padding: "1rem",
              borderRadius: "8px"
            }}>
              <strong>Hint:</strong>{" "}
              {hintText.includes("\\") ? <InlineMath math={hintText} /> : <span>{hintText}</span>}
            </div>
          )}

          {/* Controls */}
          <div style={{ marginTop: "2rem"}}>
            {isVoicePlaying && (
              <button onClick={toggleVoice}>⏹ Stop Voice</button>
            )}
          </div>
            <br />
          <div style={{ }}>
            <label>
              <input
                type="checkbox"
                checked={showSubtitles}
                onChange={() => setShowSubtitles(!showSubtitles)}
              /> Show Subtitles
            </label>
          </div>

          {!isCorrect && showSteps && (
            <div style={{ marginTop: "1rem" }}>
              <button onClick={askFollowUp} disabled={isListening}>
                {isListening ? "Listening..." : "Ask a Question"}
              </button>
            </div>
          )}
        </div>

        {/* Blackboard */}
        <div style={{
          flex: 1, background: "#1e1e1e", color: "#fff", padding: "1.5rem",
          borderRadius: "16px", border: "15px solid burlywood", boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ color: "white" }}>Solution:</h2>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {showSteps && solutionSteps.slice(0, currentStepIndex).map((step, idx) => (
              <BlockMath key={idx} math={step} />
            ))}
          </div>
        </div>
      </div>

      {/* Subtitles */}
      {showSubtitles && feedback && (
        <div style={{
          position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.75)", color: "white", padding: "0.5rem 1rem",
          borderRadius: "8px", maxWidth: "60%", maxHeight: "80px", overflowY: "auto",
          textAlign: "center", fontSize: "1rem"
        }}>
          <span>{feedback}</span>
        </div>
      )}

      <img
        src="pig tutor.png"
        alt="Pig Teacher"
        style={{
          position: "fixed",
          bottom: "50px",
          left: "50px",
          width: "250px",
          height: "auto",
          zIndex: 1000,
          pointerEvents: "none",
          borderStyle: "solid",
          borderColor: "lime",
          borderRadius: "8px",
        }}
      />

    </div>
  );
}

export default App;