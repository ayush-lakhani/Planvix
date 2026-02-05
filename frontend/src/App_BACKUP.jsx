import { useState } from 'react';

function App() {
  const [status, setStatus] = useState('✅ React is Working!');
  
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        background: 'linear-gradient(to right, #7C3AED, #EC4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '20px'
      }}>
        🧪 AgentForge - Emergency Diagnostic
      </h1>
      
      <div style={{
        padding: '20px',
        background: '#f3f4f6',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '1.2rem', margin: 0 }}>
          <strong>Status:</strong> {status}
        </p>
      </div>
      
      <button 
        onClick={() => setStatus('🎉 Button Click Works!')}
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(to right, #7C3AED, #EC4899)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        Test Button
      </button>
      
      <button 
        onClick={async () => {
          try {
            const res = await fetch('http://localhost:8000/api/health');
            const data = await res.json();
            setStatus(`✅ Backend Connected: ${JSON.stringify(data)}`);
          } catch (err) {
            setStatus(`❌ Backend Error: ${err.message}`);
          }
        }}
        style={{
          padding: '12px 24px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Test Backend
      </button>
      
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#fef3c7',
        borderRadius: '12px',
        borderLeft: '4px solid #f59e0b'
      }}>
        <h3 style={{ marginTop: 0 }}>🔧 Diagnostic Info:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>React: Rendering ✅</li>
          <li>State Management: Working ✅</li>
          <li>Event Handlers: Working ✅</li>
          <li>Frontend URL: http://localhost:5173</li>
          <li>Backend URL: http://localhost:8000</li>
        </ul>
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#dbeafe',
        borderRadius: '8px'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          <strong>Next Steps:</strong> If you see this page, React is working. 
          The issue was likely in one of the complex components. 
          Check browser console (F12) for errors.
        </p>
      </div>
    </div>
  );
}

export default App;
