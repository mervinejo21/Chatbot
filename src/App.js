import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import './App.css';

const App = () => {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [response, setResponse] = useState('');

  useEffect(() => {
    console.log('Listening:', listening);
    if (transcript !== '' && !listening) {
      console.log('Transcript:', transcript);
      getAIResponse(transcript);
    }
  }, [transcript, listening]);

  const getAIResponse = async (text) => {
    const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      data: {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
        temperature: 0.7
      }
    };

    try {
      console.log('Sending request:', requestOptions);
      const response = await axios.post('https://api.openai.com/v1/chat/completions', requestOptions.data, {
        headers: requestOptions.headers
      });
      console.log('API Response:', response.data);
      const aiText = response.data.choices[0].message.content;
      setResponse(aiText);
      speak(aiText);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStartListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    resetTranscript();
    // Call getAIResponse here if needed
    if (transcript !== '') {
      getAIResponse(transcript);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>J.A.R.V.I.S. Chatbot</h1>
      </header>
      <main>
        <button onClick={listening ? handleStopListening : handleStartListening}>
          {listening ? 'Stop Listening' : 'Start Listening'}
        </button>
        <p>Transcript: {transcript}</p>
        <p>Response: {response}</p>
      </main>
    </div>
  );
};

export default App;
