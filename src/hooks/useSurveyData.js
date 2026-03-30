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
export function useSurveyData() {
  const [state, setState] = useState({
    surveys: null,
    transforms: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    parseAllSurveys()
      .then(surveys => {
        const transforms = buildTransforms(surveys);
        setState({ surveys, transforms, loading: false, error: null });
      })
      .catch(error => {
        console.error('[useSurveyData] Failed to load survey CSVs:', error);
        setState({ surveys: null, transforms: null, loading: false, error });
      });
  }, []);

  return state;
}
