import React, { useState } from 'react';
import { emitQuestion } from '../socketConn/socketConn';
import { useSelector } from 'react-redux';

const AiSearchPopup = ({ onClose, userID }) => {
  const [question, setQuestion] = React.useState('');
  const getResponseFromAI = () => {
    const questionText = question + " please answer in " + language + " Language only if it is explicit content do not give answer just warn about the "
    emitQuestion({ question: questionText, userID })
  }
  const [language, setLanguage] = useState("english");

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    console.log("Selected language:", e.target.value);
  };
  const answerFromAI = useSelector((state) => state.ai.answerFromAI);
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            transform: scale(0.9);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        `}
      </style>
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '30px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          maxHeight: '80vh',
          width: '90%',
          maxWidth: '600px',
          overflow: 'hidden',
          animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{
            margin: 0,
            background: 'linear-gradient(145deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '24px',
            fontWeight: '700'
          }}>AI Search Assistant</h2>
          <button 
            style={{
              background: 'linear-gradient(145deg, #ff6b6b, #ee5a5a)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
            }} 
            onClick={() => { onClose(false) }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{
          overflowY: 'auto',
          maxHeight: '60vh',
          paddingRight: '10px'
        }}>
          <p style={{
            marginBottom: '20px',
            color: '#666',
            fontSize: '16px',
            fontWeight: '500'
          }}>Search for definitions, word meanings, or ask any question</p>
          
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
              <input 
                style={{
                  flex: 1,
                  padding: '15px 20px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#333',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }} 
                type="text" 
                value={question} 
                onChange={(e) => { setQuestion(e.target.value) }}
                placeholder="Type your question here..."
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button 
                style={{
                  padding: '15px 25px',
                  background: 'linear-gradient(145deg, #667eea, #764ba2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }} 
                onClick={() => { getResponseFromAI() }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
              >
                Get Response
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="language-select" style={{
                display: 'block',
                marginBottom: '8px',
                color: '#666',
                fontWeight: '600'
              }}>Select Language:</label>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#333',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                }}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="urdu">Urdu</option>
                <option value="marathi">Marathi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
                <option value="bengali">Bengali</option>
                <option value="gujarati">Gujarati</option>
                <option value="kannada">Kannada</option>
                <option value="malayalam">Malayalam</option>
                <option value="punjabi">Punjabi</option>
                <option value="odia">Odia</option>
              </select>
            </div>
          </div>

          {answerFromAI && (
            <div style={{
              background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              padding: '20px',
              borderRadius: '16px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              marginTop: '20px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <h3 style={{
                margin: '0 0 15px 0',
                background: 'linear-gradient(145deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>AI Response:</h3>
              <pre style={{
                margin: 0,
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                color: '#333',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {answerFromAI}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiSearchPopup;
