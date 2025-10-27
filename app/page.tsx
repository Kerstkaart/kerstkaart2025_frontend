"use client";

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

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

const chapterIntro: Record<number, string> = {
  1: `🎄 De kerstlichtjes

Je loopt naar Robert, een jongeman met donker krullig haar, die op een boomstam naar zijn smartphone zit te staren.

Naast hem ligt een stroomdraad die van een centrale stekkerdoos helemaal door loopt naar de lichtjes van de kerstboom.

Robert heeft alles al aangesloten, maar toch schijnt de kerstboom niet in volle glorie.

Je kijkt beter naar de stroomkabel en ziet dat er halverwege iets vreemds is met de draad, je vermoedt dat er teveel weerstand is.

Robert heeft een boek naast hem liggen.`,

  2: `🎶 De muziek

  Je loopt naar Linda. Een blonde dame die tegen een luik op de grond staat te stampen.

  Ze vertelt dat er vervelende spinnen zijn die haar muziekinstallatie hebben gestolen, en deze nu bewaken in de kelder onder het luik.

  Het luik is niet op slot, maar Linda houdt niet van spinnen en hun smerige gewoontes.

  Je ziet dat spinnen continu heen en weer lopen uit de kelder, het huis in naar wat lijkt naar de badkamer.

  Als je de spinnen volgt naar de badkamer zie je dat de spinnen een webmaker 2025 hebben geinstalleerd onder de wastafel. De spinnen brengen de haren uit het doucheputje naar de webmaker, waar vervolgens spinnenwebben van gemaakt worden. De spinnen brengen vervolgens deze webben naar de kelder om de muziekinstallatie nog vaster te zetten.
  `,
  3: "🎶 Hoofdstuk 3: ..."
};

const chapterBackgrounds: Record<number, string> = {
  1: '/Chapter1.png',
  2: '/Chapter2.png',
  3: '/Chapter3.png'
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [chapterLogs, setChapterLogs] = useState<Record<number, string[]>>({});
  const [chapter, setChapter] = useState<number>(1);
  const [chapterCompleted, setChapterCompleted] = useState(false);
  const [welkomOpen, setWelkomOpen] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const savedChapter = localStorage.getItem('chapter');
    const savedLogs = localStorage.getItem('chapterLogs');
    const savedWelkom = localStorage.getItem('welkomOpen');
    if (savedChapter) setChapter(JSON.parse(savedChapter));
    if (savedLogs) setChapterLogs(JSON.parse(savedLogs));
    if (savedWelkom) setWelkomOpen(JSON.parse(savedWelkom));
  }, []);

  // fields that will be stored in browser context so they will be remembered if you attempt the card again
  useEffect(() => {
    localStorage.setItem('chapter', JSON.stringify(chapter));
    localStorage.setItem('welkomOpen', JSON.stringify(welkomOpen));
  }, [chapter, welkomOpen]);

  const currentLog = chapterLogs[chapter] ?? [];

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('https://kerstkaart2025-backend.vercel.app/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: input,
          chapter,
          history: chapterLogs[chapter] ?? []
        })
      });

      const data = await res.json();
      const newLog = [...(chapterLogs[chapter] ?? []), input, data.reply];

      const isSuccess = data.reply?.includes('GESLAAGD');
      if (isSuccess) {
        setChapterCompleted(true);
      }

      setChapterLogs((prev) => ({
        ...prev,
        [chapter]: newLog
      }));
    } catch (error) {
      console.error('Fout bij ophalen AI-antwoord:', error);
      const errorLog = [...(chapterLogs[chapter] ?? []), '⚠️ Er ging iets mis. Probeer het opnieuw.'];
      setChapterLogs((prev) => ({
        ...prev,
        [chapter]: errorLog
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'monospace',
      backgroundColor: '#121212',
      color: '#f0f0f0'
    }}>
      {chapterCompleted && <Confetti />}
      {/* Linkerkant: vaste chapter info */}
      <aside
        className="chapter-background"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.7), rgba(0,0,0,1)), url(${chapterBackgrounds[chapter]})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          backgroundColor: '#1e1e1e',
          position: 'relative',
          zIndex: 1,
          padding: '2rem',
          borderRight: '1px solid #333'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'white', marginBottom: '1rem' }}>
            Hoofdstuk {chapter}
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem('chapter');
              localStorage.removeItem('chapterLogs');
              setChapter(1);
              setChapterLogs({});
              setChapterCompleted(false);
            }}
            style={{
              padding: '0.5rem 1rem',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Reset progress
          </button>
        </div>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {chapterIntro[chapter]}
        </p>
      </aside>

      {/* Rechterkant: chat en input */}
      <section className="chat-area"
        style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Welkomtekst */}
        <button
          onClick={() => setWelkomOpen((prev) => !prev)}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {welkomOpen ? '🔼 Verberg introductie' : '🔽 Toon introductie'}
        </button>
        {welkomOpen && (
          <section style={{
            marginBottom: '2rem',
            backgroundColor: '#1a1a1a',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            {welcomeLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </section>
        )}

        {/* Chatlog */}
        <div style={{
          whiteSpace: 'pre-wrap',
          flexGrow: 1,
          marginBottom: '1rem',
          overflowY: 'auto'
        }}>
          {currentLog.map((line, i) => (
            <div key={i} style={{ marginBottom: '0.5rem' }}>{line}</div>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div style={{ marginBottom: '1rem' }}>
            <div className="spinner" />
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{ width: '100%' }}
        >
        {chapterCompleted ? (
          <button
            onClick={() => {
              setChapter((prev) => prev + 1);
              setChapterCompleted(false);
            }}
            style={{
              padding: '0.75rem',
              backgroundColor: '#ffcc00',
              color: '#121212',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✅ Ga door naar hoofdstuk {chapter + 1}
          </button>
        ) : (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Typ je actie..."
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#1e1e1e',
              color: '#f0f0f0',
              border: '1px solid #444',
              borderRadius: '4px'
            }}
          />
        )}
        </form>
      </section>
    </main>
  );
}