import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { BiReset } from "react-icons/bi";

function App() {

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [promptResponses, setpromptResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_API_KEY
  );

  const startRecording = () => {
    resetTranscript();
    setpromptResponses([])
    SpeechRecognition.startListening({ language: 'en-IN', continuous: true })
  }

  const stopRecording = () => {
    setpromptResponses([])
    SpeechRecognition.stopListening();
    getResponseForGivenPrompt();
  }
  
  if (!browserSupportsSpeechRecognition) { 
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const resetAll = () => {
    resetTranscript();
    setpromptResponses([]);
  }
  const getResponseForGivenPrompt = async () => {
    try {
      setLoading(true)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", 
        temperature: 1,
        topP: 0.95,
        topK: 1,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
        systemInstruction: {
          role: "user",
          parts: [
            { text: import.meta.env.VITE_PROMPT }
          ]
        }
      });
      const result = await model.generateContent(transcript);
      // setInputValue('')
      const response = result.response;
      const text = response.text();
      console.log(text)
      setpromptResponses([...promptResponses,text]);
  
      setLoading(false)
    }
    catch (error) {
      console.log(error)
      console.log("Something Went Wrong");
      setLoading(false)
    }
  };

  return (
    <div className="container">
      <div className='top-bar'>
        <button className='btn-reset' onClick={resetAll}><BiReset size={30} onClick={resetAll} /></button>
        <h2>Nithin-in Transcriber</h2>          
      </div>
      {listening ? (
        <>
          <label className="record-label">
            <button className='box-shadow-ripples' onMouseDown={startRecording} onMouseUp={stopRecording}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", paddingRight: 2 }} >
                <FaMicrophone />
              </div>
            </button>
          </label>
          <div className="text-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Listening...</span>
            </div>
          </div>
        </>
        ) : (
          <>
          <label className="record-label">
            <button className='box-shadow-ripples' onMouseDown={startRecording} onMouseUp={stopRecording}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", paddingRight: 2 }} >
                <FaMicrophoneSlash />
              </div>
            </button>
          </label>
          <div className="text-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Hold the {<FaMicrophone />} button to record</span>
            </div>
          </div>
        </>
        )
      }

      <p>{transcript}</p>

      {loading ? (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        promptResponses.map((promptResponse, index) => (
          <div key={index} >
            <div className={`response-text ${index === promptResponses.length - 1 ? 'fw-bold' : ''}`}><span className='prompt-resp'>{promptResponse}</span></div>
          </div>
        ))
      )}
    </div>
    );

}
export default App;