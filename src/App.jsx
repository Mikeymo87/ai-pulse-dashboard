import './index.css';
import { useSurveyData } from './hooks/useSurveyData';
import Nav from './components/Nav';
import Hero from './components/Hero';
import GrowthStory from './components/GrowthStory';
import TrendCharts from './components/TrendCharts';
import OpportunitySpotlight from './components/OpportunitySpotlight';

export default function App() {
  const { transforms, loading, error } = useSurveyData();

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
      <Nav />
      <Hero transforms={transforms} />
      <GrowthStory transforms={transforms} />
      <TrendCharts transforms={transforms} />
      <OpportunitySpotlight transforms={transforms} />
    </div>
  );
}
