import React from 'react';
// Auto-populated shared UI component imported from the monorepo workspace
import { Button } from '@riyaz-tyn/shared-ui';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>${{ values.name }}</h1>
      <p>
        Welcome to your newly scaffolded React application! 
        This app is part of the monorepo and is pre-configured to use the shared UI library.
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Shared Components Demo</h2>
        <p>The button below is imported directly from <code>@tyn/shared-ui</code>:</p>
        
        {/* Replace this with any specific component you have in @tyn/shared-ui */}
        <Button variant="primary" onClick={() => alert('Shared button clicked!')}>
          Hello from Shared UI
        </Button>
      </div>
    </div>
  );
}

export default App;
