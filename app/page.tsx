"use client";

import { useState, useEffect } from 'react';

type GameState = {
  location: string;
  inventory: string[];
  puzzle: string;
  solved: boolean;
};

export default function Home() {
  const [input, setInput] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    location: 'besneeuwde hut',
    inventory: [],
    puzzle: 'kerstwoord',
    solved: false
  });

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      setGameState(JSON.parse(savedState));
    }
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [gameState]);

  const sendMessage = async () => {
    const res = await fetch('https://kerstkaart2025-backend.vercel.app/api/ai-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput: input, gameState })
    });

    const data = await res.json();
    setLog([...log, input, data.reply]);
    setInput('');
    // Optioneel: parse status_update uit data.reply en update gameState
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Kerst Text Adventure 🎄</h1>
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
        {log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Typ je actie..."
        style={{ width: '100%', padding: '0.5rem' }}
      />
    </main>
  );
}