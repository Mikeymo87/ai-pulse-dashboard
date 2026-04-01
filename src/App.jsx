import './index.css';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSurveyData } from './hooks/useSurveyData';
import Nav from './components/Nav';
import Hero from './components/Hero';
import GrowthStory from './components/GrowthStory';
import TrendCharts from './components/TrendCharts';
import OpportunitySpotlight from './components/OpportunitySpotlight';
import ChatPanel from './components/ChatPanel';
import DeepDive from './components/DeepDive';
import ConvictionMoment from './components/ConvictionMoment';
import PresentationMode from './components/PresentationMode';

export default function App() {
  const { surveys, transforms, loading, error } = useSurveyData();
  const [chatOpen, setChatOpen]       = useState(false);
  const [presentMode, setPresentMode] = useState(false);

  // P key toggles presentation mode
  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName;
      // Don't hijack P when user is typing in an input/textarea
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'p' || e.key === 'P') setPresentMode(v => !v);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1a1d1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#7DE69B',
          boxShadow: '0 0 20px rgba(125,230,155,0.7)',
        }}
      />
      <p style={{ color: '#797D80', fontSize: 13 }}>Loading survey data…</p>
    </div>
  );

  if (error) return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1a1d1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <p style={{ color: '#E5554F' }}>Error loading data — check console.</p>
    </div>
  );

  return (
    <div style={{ background: '#1a1d1e', minHeight: '100vh' }}>
      <Nav onOpenChat={() => setChatOpen(true)} onPresent={() => setPresentMode(true)} />
      <Hero transforms={transforms} />
      <GrowthStory transforms={transforms} />
      <ConvictionMoment transforms={transforms} />
      <TrendCharts transforms={transforms} />
      <DeepDive surveys={surveys} transforms={transforms} />
      <OpportunitySpotlight transforms={transforms} />
      <ChatPanel transforms={transforms} open={chatOpen} setOpen={setChatOpen} />

      {/* Presentation mode overlay */}
      <AnimatePresence>
        {presentMode && (
          <PresentationMode
            transforms={transforms}
            surveys={surveys}
            onClose={() => setPresentMode(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
