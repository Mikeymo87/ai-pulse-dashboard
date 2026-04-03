import './index.css';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSurveyData } from './hooks/useSurveyData';
import Nav from './components/Nav';
import Hero from './components/Hero';
import GrowthStory from './components/GrowthStory';
import StoryNarrative from './components/StoryNarrative';
import StruggleMap from './components/StruggleMap';
import TrendCharts from './components/TrendCharts';
import OpportunitySpotlight from './components/OpportunitySpotlight';
import ChatPanel from './components/ChatPanel';
import DeepDive from './components/DeepDive';
import Archetypes from './components/Archetypes';
import ConvictionMoment from './components/ConvictionMoment';
import PresentationMode from './components/PresentationMode';
import OpenTextIntelligence from './components/OpenTextIntelligence';
import ParticipationStory from './components/ParticipationStory';
import NumbersSubNav from './components/NumbersSubNav';
import SurveySnapshot from './components/SurveySnapshot';
import HowWeDidIt from './components/HowWeDidIt';

export default function App() {
  const { surveys, transforms, loading, error } = useSurveyData();
  const [chatOpen, setChatOpen]         = useState(false);
  const [presentMode, setPresentMode]   = useState(false);
  const [activeTab, setActiveTab]         = useState('story');
  const [numbersSubTab, setNumbersSubTab] = useState('overview');
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultPrompt, setVaultPrompt]   = useState(false);
  const [vaultInput, setVaultInput]     = useState('');
  const [vaultError, setVaultError]     = useState(false);

  const VAULT_PASSWORD = import.meta.env.VITE_VAULT_PASSWORD ?? 'TGSD26';

  function tryUnlockVault() {
    if (vaultInput.trim() === VAULT_PASSWORD) {
      setVaultUnlocked(true);
      setVaultPrompt(false);
      setVaultInput('');
      setVaultError(false);
    } else {
      setVaultError(true);
      setVaultInput('');
    }
  }

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
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'DM Sans, sans-serif',
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
      <p style={{ color: 'var(--text-support)', fontSize: 13 }}>Loading survey data…</p>
    </div>
  );

  if (error) return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <p style={{ color: '#E5554F' }}>Error loading data — check console.</p>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav
        onOpenChat={() => setChatOpen(true)}
        onPresent={() => setPresentMode(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab content — fade transition on tab change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'story' && (
            <>
              <Hero transforms={transforms} />
              <StoryNarrative />
              <GrowthStory transforms={transforms} />
              <ConvictionMoment transforms={transforms} />
              <div className="pad-section" style={{ padding: '0 32px', maxWidth: 1360, margin: '0 auto' }}>
                <StruggleMap transforms={transforms} />
              </div>
            </>
          )}
          {activeTab === 'numbers' && (
            <>
              <div style={{ paddingTop: 24 }}>
                <NumbersSubNav active={numbersSubTab} onChange={setNumbersSubTab} />
              </div>
              {numbersSubTab === 'overview' && <TrendCharts transforms={transforms} />}
              {numbersSubTab === 's1' && <SurveySnapshot wave="s1" transforms={transforms} />}
              {numbersSubTab === 's2' && <SurveySnapshot wave="s2" transforms={transforms} />}
              {numbersSubTab === 's3' && <SurveySnapshot wave="s3" transforms={transforms} />}
            </>
          )}
          {activeTab === 'team' && (
            <>
              <ParticipationStory transforms={transforms} />
              <Archetypes transforms={transforms} />

              {/* Leadership Vault — password-protected */}
              <div style={{ padding: '0 32px 64px', maxWidth: 1360, margin: '0 auto' }}>
                {!vaultUnlocked ? (
                  <button
                    onClick={() => { setVaultPrompt(true); setVaultError(false); setVaultInput(''); }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(125,230,155,0.15)',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-support)',
                      cursor: 'pointer',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 9, opacity: 0.6 }}>◈</span>
                    Leadership Vault
                    <span style={{ fontSize: 10, opacity: 0.4 }}>🔒</span>
                  </button>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--accent-mint)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        <span style={{ fontSize: 9 }}>◈</span>
                        Leadership Vault
                        <span style={{ fontSize: 10 }}>🔓</span>
                      </span>
                      <button
                        onClick={() => setVaultUnlocked(false)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-support)',
                          fontSize: 10,
                          cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif',
                          padding: '2px 6px',
                        }}
                      >
                        lock
                      </button>
                    </div>
                    <DeepDive surveys={surveys} transforms={transforms} />
                  </>
                )}
              </div>

              {/* Vault password modal */}
              <AnimatePresence>
                {vaultPrompt && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'fixed', inset: 0, zIndex: 9000,
                      background: 'rgba(6,6,15,0.85)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={e => { if (e.target === e.currentTarget) { setVaultPrompt(false); setVaultInput(''); setVaultError(false); } }}
                  >
                    <motion.div
                      initial={{ scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.92, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: 'var(--surface-green)',
                        border: '1px solid rgba(125,230,155,0.25)',
                        borderRadius: 16,
                        padding: '36px 40px',
                        width: 360,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, color: 'var(--accent-mint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>◈ Leadership Vault</p>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Enter access code</h3>
                        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-support)', lineHeight: 1.5 }}>
                          This section contains role and function-level data. For leadership conversations only.
                        </p>
                      </div>
                      <input
                        type="password"
                        value={vaultInput}
                        autoFocus
                        onChange={e => { setVaultInput(e.target.value); setVaultError(false); }}
                        onKeyDown={e => e.key === 'Enter' && tryUnlockVault()}
                        placeholder="Access code"
                        style={{
                          background: 'var(--card-bg-dark)',
                          border: `1px solid ${vaultError ? '#E5554F' : 'rgba(125,230,155,0.2)'}`,
                          borderRadius: 8,
                          padding: '11px 14px',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          letterSpacing: '0.1em',
                        }}
                      />
                      {vaultError && (
                        <p style={{ margin: '-12px 0 0', fontSize: 12, color: '#E5554F' }}>Incorrect access code.</p>
                      )}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={tryUnlockVault}
                          style={{
                            flex: 1,
                            background: 'rgba(125,230,155,0.12)',
                            border: '1px solid rgba(125,230,155,0.3)',
                            borderRadius: 8,
                            padding: '10px 0',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'var(--accent-mint)',
                            cursor: 'pointer',
                          }}
                        >
                          Unlock
                        </button>
                        <button
                          onClick={() => { setVaultPrompt(false); setVaultInput(''); setVaultError(false); }}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            padding: '10px 18px',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 13,
                            color: 'var(--text-support)',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
          {activeTab === 'whats-next' && (
            <>
              <OpenTextIntelligence transforms={transforms} />
              <OpportunitySpotlight transforms={transforms} />
            </>
          )}
          {activeTab === 'playbook' && (
            <HowWeDidIt transforms={transforms} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        marginTop: 64,
        padding: '32px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          margin: 0,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 12,
          color: 'var(--text-support)',
          letterSpacing: '0.02em',
        }}>
          &copy; {new Date().getFullYear()} Baptist Health Marketing &amp; Communications
        </p>
      </div>

      {/* Always-mounted overlays — available from any tab */}
      <ChatPanel transforms={transforms} open={chatOpen} setOpen={setChatOpen} vaultUnlocked={vaultUnlocked} />

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
