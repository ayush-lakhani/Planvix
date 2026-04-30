/**
 * Utility to normalize strategy data structure
 * Handles different response formats from API vs DB
 */

/**
 * Normalizes strategy object to ensure consistent structure
 * @param {Object} data - Raw strategy data from API or DB
 * @returns {Object|null} - Normalized strategy object or null
 */
export function normalizeStrategy(data) {
  if (!data) return null;

  console.log('[NORMALIZE] Input data:', data);

  // Handle backend response wrapper: { success, strategy: {...}, ... }
  if (data.strategy && typeof data.strategy === 'object') {
    console.log('[NORMALIZE] Extracting from .strategy wrapper');
    return normalizeStrategy(data.strategy);
  }

  // Handle nested data wrapper: { data: {...} }
  if (data.data && typeof data.data === 'object') {
    console.log('[NORMALIZE] Extracting from .data wrapper');
    return normalizeStrategy(data.data);
  }

  // Handle final_output wrapper (legacy or stringified)
  if (data.final_output) {
    console.log('[NORMALIZE] Extracting from .final_output wrapper');
    // If final_output is a string, parse it
    if (typeof data.final_output === 'string') {
      try {
        const parsed = JSON.parse(data.final_output);
        console.log('[NORMALIZE] Parsed stringified final_output');
        return normalizeStrategy(parsed);
      } catch (error) {
        console.error('[NORMALIZE] Failed to parse final_output:', error);
        return null;
      }
    }
    // If final_output is already an object, recurse
    return normalizeStrategy(data.final_output);
  }

  // If data itself is a stringified JSON
  if (typeof data === 'string') {
    console.log('[NORMALIZE] Data is string, attempting to parse');
    try {
      const parsed = JSON.parse(data);
      return normalizeStrategy(parsed);
    } catch (error) {
      console.error('[NORMALIZE] Failed to parse string data:', error);
      return null;
    }
  }

  // If data already has the expected structure, return as-is
  if (data.strategic_overview || data.content_pillars || data.keywords) {
    console.log('[NORMALIZE] Data has expected structure, returning as-is');
    return data;
  }

  console.warn('[NORMALIZE] Unknown strategy structure, returning data:', data);
  return data;
}

/**
 * Validates that strategy has required fields
 * @param {Object} strategy - Strategy object to validate
 * @returns {boolean} - True if valid
 */
export function isValidStrategy(strategy) {
  if (!strategy) {
    console.warn('[VALIDATE] Strategy is null/undefined');
    return false;
  }
  
  // Check for at least one required field
  const hasRequiredField = !!(
    strategy.strategic_overview ||
    strategy.content_pillars ||
    strategy.content_calendar ||
    strategy.keywords ||
    strategy.roi_prediction
  );

  if (!hasRequiredField) {
    console.warn('[VALIDATE] Strategy missing all required fields:', Object.keys(strategy));
  }

  return hasRequiredField;
}
