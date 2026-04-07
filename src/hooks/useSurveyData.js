import { useState, useEffect } from 'react';
import { parseAllSurveys } from '../data/parseCSVs';
import { buildTransforms } from '../data/transforms';

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
const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour — re-fetch when a new survey is live

export function useSurveyData() {
  const [state, setState] = useState({
    surveys: null,
    transforms: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    function fetchData() {
      parseAllSurveys()
        .then(surveys => {
          if (cancelled) return;
          const transforms = buildTransforms(surveys);
          setState({ surveys, transforms, loading: false, error: null });
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

    fetchData();
    const timer = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  return state;
}
