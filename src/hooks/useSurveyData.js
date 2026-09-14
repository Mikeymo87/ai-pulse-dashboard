import { useState, useEffect } from 'react';
import { parseAllSurveys } from '../data/parseCSVs';
import { buildTransforms, splitHelpHinder } from '../data/transforms';
import { classifyWithClaude } from '../data/classifyOpenText';

/**
 * Loads all 3 survey CSVs, normalizes every row, and returns
 * both the raw per-survey arrays and the pre-built transforms
 * needed for charts and analysis.
 *
 * Returns: { surveys, transforms, loading, error }
 *   surveys.survey1  — 97  normalized rows
 *   surveys.survey2  — 106 normalized rows
 *   surveys.survey3  — 89  normalized rows
 *   surveys.all      — 292 combined rows
 *   transforms       — aggregated stats for every chart (see transforms.js)
 */
const POLL_INTERVAL_MS      = 60 * 60 * 1000; // 1 hour when no survey is in the field
const POLL_INTERVAL_LIVE_MS =  5 * 60 * 1000; // 5 minutes while Survey 4 is collecting (Google republishes the CSV about every 5 min)

export function useSurveyData() {
  const [state, setState] = useState({
    surveys: null,
    transforms: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    let cancelled = false;

    let timer = null;
    function fetchData() {
      parseAllSurveys()
        .then(surveys => {
          if (cancelled) return;
          const transforms = buildTransforms(surveys);
          setState({ surveys, transforms, loading: false, error: null, lastUpdated: new Date() });
          readOpenTextWithClaude(surveys, transforms);
          // Re-arm the poll at the live cadence once we know Survey 4 is configured
          const wanted = surveys.s4Configured ? POLL_INTERVAL_LIVE_MS : POLL_INTERVAL_MS;
          if (timer && timer.interval !== wanted) {
            clearInterval(timer.id);
            timer = { id: setInterval(fetchData, wanted), interval: wanted };
          }
        })
        .catch(error => {
          if (cancelled) return;
          console.error('[useSurveyData] Failed to load survey CSVs:', error);
          setState(prev =>
            prev.surveys
              ? { ...prev, error: null }  // silent — keep existing data on retry failure
              : { surveys: null, transforms: null, loading: false, error }
          );
        });
    }

    // Survey 4's open question is read by Claude (one call per batch of new answers, cached by
    // answer text). Until the verdicts land, and if the API is unavailable, the keyword sorter's
    // split stands and the card says so (split.source = 'rules').
    let reading = false;
    function readOpenTextWithClaude(surveys, transforms) {
      const texts = (surveys.survey4 || []).map(r => r.openEnded).filter(t => t && t.trim());
      if (!texts.length || reading) return;
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) { console.warn('[useSurveyData] no API key in the build: Survey 4 open text uses the keyword fallback'); return; }
      reading = true;
      classifyWithClaude(texts, { apiKey })
        .then(({ verdictOf, asked }) => {
          if (cancelled) return;
          const split = splitHelpHinder(texts, verdictOf, 'claude');
          setState(prev => prev.transforms === transforms ? { ...prev, transforms: { ...transforms, openEndedSplitS4: split } } : prev);
          if (asked) console.info(`[useSurveyData] Claude read ${asked} new Survey 4 answer(s); split = ${split.helpingN} helping / ${split.hinderingN} in the way / ${split.mixedN} both / ${split.noneN} no answer`);
        })
        .catch(err => console.error('[useSurveyData] Claude could not read the Survey 4 open text; keyword fallback stays on:', err))
        .finally(() => { reading = false; });
    }

    fetchData();
    timer = { id: setInterval(fetchData, POLL_INTERVAL_MS), interval: POLL_INTERVAL_MS };
    return () => { cancelled = true; if (timer) clearInterval(timer.id); };
  }, []);

  return state;
}
