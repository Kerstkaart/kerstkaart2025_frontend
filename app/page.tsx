"use client";

import { useState, useEffect } from 'react';

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
  1: "🎄 Hoofdstuk 1: De kerstlichtjes zijn uitgevallen. Robert heeft hulp nodig om de stroom weer aan te sluiten.",
  2: "🎁 Hoofdstuk 2: Linda probeert de cadeaus te organiseren, maar raakt steeds afgeleid. Kun jij haar helpen?",
  3: "🎶 Hoofdstuk 3: Bram zou de muziek regelen, maar hij is verdwaald in zijn afspeellijsten. Tijd voor een kerstklassieker!"
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [chapterLogs, setChapterLogs] = useState<Record<number, string[]>>({});
  const [chapter, setChapter] = useState<number>(1);

  // Load saved state on mount
  useEffect(() => {
    const savedChapter = localStorage.getItem('chapter');
    const savedLogs = localStorage.getItem('chapterLogs');
    if (savedChapter) setChapter(JSON.parse(savedChapter));
    if (savedLogs) setChapterLogs(JSON.parse(savedLogs));
  }, []);

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
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Kerst Text Adventure 🎄</h1>

      {/* Vaste introductie */}
      <section style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
        {welcomeLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </section>

      {/* Hoofdstukintro */}
      <section style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        {chapterIntro[chapter]}
      </section>

      {/* Chatlog */}
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
        {currentLog.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="spinner" />
        </div>
      )}

      {/* Input */}
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