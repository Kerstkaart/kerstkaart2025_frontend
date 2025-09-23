"use client";

import { useState, useEffect } from 'react';

type NpcStatus = {
  taskComplete: boolean,
  state: string
}

type GameState = {
  location: string;
  inventory: string[];
  npcStatus: {
    Robert: NpcStatus,
    Linda: NpcStatus,
    Bram: NpcStatus
  }
}

const welcomeLines = [
  "Welkom in Tellytown — een besneeuwd dorpje waar normaal gesproken het kerstfeest bruist van lichtjes, muziek en lekkernijen.",
  "Maar dit jaar is er iets mis...",
  "",
  "De drie dorpsbewoners (Robert, Linda en Bram) die het feest zouden organiseren zijn afgeleid, verward en... vastgeplakt aan hun telefoons.",
  "Het is aan jou om hen te helpen, de magie van kerst terug te brengen, en Tellytown weer te laten stralen.",
  "",
  "🌟 Kies je pad, praat met de inwoners, verzamel voorwerpen en los puzzels op.",
  "🎁 Kun jij ervoor zorgen dat iedereen zijn telefoon weglegt en samen kerst viert?",
  "",
  "Typ je eerste actie hieronder om het avontuur te beginnen. Bijvoorbeeld:",
  '👉 "Ik loop naar het dorpsplein"',
  '👉 "Ik praat met Robert over de lichtjes"',
  "",
  "Veel plezier — en vergeet niet: in Tellytown begint kerst met jou!"
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    location: 'op de grens van het dorp',
    inventory: [],
    npcStatus: {
      Robert: {
        taskComplete: false,
        state: "zit op telefoon te kijken"
      },
      Linda: {
        taskComplete: false,
        state: "zit muziek te luisteren via headset"
      },
      Bram: {
        taskComplete: false,
        state: "zit op telefoon te kijken"
      }
    }
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

  // attempt to fade logs away
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < welcomeLines.length) {
        setLog((prev) => [...prev, welcomeLines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300); // 500ms tussen regels
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    setLoading(true);
    setInput('');
    try {
      const res = await fetch('https://kerstkaart2025-backend.vercel.app/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input, gameState })
      });

      const data = await res.json();

      if (data.reply.includes("**GAME_STATE**")) {
        const userReply = data.reply.split("**GAME_STATE**")[0]
        const newGameState = data.reply.split("**GAME_STATE**")[1]
      
        console.log('received game state: \n', JSON.stringify(JSON.parse(newGameState), null, 2))

        if (gameState.npcStatus?.Robert?.taskComplete === true) {
          newGameState.npcStatus.Robert.TaskComplete = true
        }
        if (gameState.npcStatus?.Linda?.taskComplete === true) {
          newGameState.npcStatus.Linda.TaskComplete = true
        }
        if (gameState.npcStatus?.Bram?.taskComplete === true) {
          newGameState.npcStatus.Bram.TaskComplete = true
        }
        
        localStorage.setItem('gameState', newGameState);
        setGameState(JSON.parse(newGameState));
        data.reply = userReply
      }
      console.log('received reply: ', data.reply)

      setLog([...log, input, data.reply]);
    } catch (error) {
      console.error('Fout bij ophalen AI-antwoord:', error);
      setLog((prev) => [...prev, '⚠️ Er ging iets mis. Probeer het opnieuw.']);
    } finally {
      setLoading(false);
    }
    
    // Optioneel: parse status_update uit data.reply en update gameState
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Kerst Text Adventure 🎄</h1>
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
        {log.map((line, i) => (
          <div key={i} className="fade-line" style={{ animationDelay: `${i * 100}ms` }}>
            {line}
          </div>
        ))}
      </div>
      {loading && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="spinner" />
        </div>
      )}
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