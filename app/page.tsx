"use client";

import { useState, useEffect, useRef } from 'react';
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
  3: `🍮 De crème brûlée-crisis
  
  Je loopt naar Bram, een topchef met een witte koksmuts en een indrukwekkende snor. Hij staat in de keuken van het dorpshuis, wanhopig naar een lege ovenschaal te staren.

  Op het aanrecht liggen gebroken suikerlaagjes en lege kommetjes — de overblijfselen van wat ooit een feestelijk dessert moest zijn.

  Bram zucht diep. "Ik probeer al de hele ochtend crème brûlées te maken voor het kerstdiner, maar Lila en Lolly... die katten... ze sluipen steeds binnen en eten alles op voordat ik ze kan serveren."

  Je hoort zacht gespin onder de tafel. Lila en Lolly liggen daar tevreden te dutten, hun buikjes rond van room en suiker.

  Bram kijkt je aan met een sprankje hoop. "Misschien... als we samen leren hoe je ze maakt, kunnen we er genoeg maken voor iedereen — zelfs voor die twee snoepkatten.
  
  `
};

const chapterBackgrounds: Record<number, string> = {
  1: '/Chapter1.png',
  2: '/Chapter2.png',
  3: '/Chapter3.png'
};

const musicTracks = [
  "/audio/I don't want a lot for Christmas.mp3",
  "/audio/I'm driving home for Lilly.mp3",
  "/audio/lillylilly.mp3",
  "/audio/Snowflakes fall on holly leaves, the gar.mp3",
  "/audio/Verse 1.mp3",
  "/audio/River Wonderland.mp3",
  "/audio/Christmas in Nijmegen.mp3"
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [chapterLogs, setChapterLogs] = useState<Record<number, string[]>>({});
  const [chapter, setChapter] = useState<number>(1);
  const [chapterCompleted, setChapterCompleted] = useState(false);
  const [welkomOpen, setWelkomOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<string[]>([]);
  const trackIndexRef = useRef<number>(0);

  // Load saved state on mount
  useEffect(() => {
    const savedChapter = localStorage.getItem('chapter');
    const savedLogs = localStorage.getItem('chapterLogs');
    const savedWelkom = localStorage.getItem('welkomOpen');
    if (savedChapter) {
      let chapter = JSON.parse(savedChapter)
      setChapter(chapter);
      if (chapter > 3) {
        const handleUserInteraction = () => {
          startMusic();
          window.removeEventListener('click', handleUserInteraction);
          window.removeEventListener('keydown', handleUserInteraction);
        };

        window.addEventListener('click', handleUserInteraction);
        window.addEventListener('keydown', handleUserInteraction);
      }
    }
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
    sendMessageWithText(input)
    setInput('');
  };

  const sendMessageWithText = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch('https://kerstkaart2025-backend.vercel.app/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: text,
          chapter,
          history: chapterLogs[chapter] ?? []
        })
      });

      const data = await res.json();
      const newLog = [...(chapterLogs[chapter] ?? []), text, data.reply];

      const isSuccess = data.reply?.includes('GESLAAGD');
      if (isSuccess) {
        setChapterCompleted(true);

        if (chapter === 3 && !audioRef.current) {
          startMusic();
        }
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
  }

  const startMusic = () => {
    if (playlistRef.current.length === 0) {
      playlistRef.current = [...musicTracks].sort(() => Math.random() - 0.5);
      trackIndexRef.current = 0;
    }

    const track = playlistRef.current[trackIndexRef.current];
    const audio = new Audio(track);
    audio.volume = 0.5;
    audio.play();
    audio.onended = () => {
      trackIndexRef.current = (trackIndexRef.current + 1) % playlistRef.current.length;
      startMusic(); // speel volgende track
    };

    audioRef.current = audio;
  };

  if (chapter >= 4) {
    return (
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#f0f0f0',
        fontFamily: 'monospace',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎄 Fijne kerst vanuit Tellytown!</h1>
        <p style={{ maxWidth: '600px', marginBottom: '2rem' }}>
          Je hebt alle hoofdstukken voltooid en de magie van kerst teruggebracht. Robert, Linda en Bram vieren feest — en jij bent de held van het dorp.
        </p>
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            localStorage.clear();
            setChapter(1);
            setChapterLogs({});
            setChapterCompleted(false);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🔄 Opnieuw spelen
        </button>
      </main>
    )
  }

  return (
    <main style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'monospace',
      backgroundColor: '#121212',
      color: '#f0f0f0'
    }}>
      {chapter >= 4 && <div style={{width: '100%', height: '100%'}}>Gefeliciteerd!</div>}
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
          {(chapterCompleted && chapter == 3) ? (
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
              Klaar!! Ga door naar de kerstkaart
            </button>
          ) : chapterCompleted ? (
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
          ): (
            <section>
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
            </section>
          )}
        </form>
        {!chapterCompleted && (<button
          onClick={() => {
            sendMessageWithText("Have I completed the current chapter? Make sure to respond with 'GESLAAGD' if I did complete the chapter")
          }}
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >🤔 Check game status</button>)
      }
      </section>
    </main>
  );
}