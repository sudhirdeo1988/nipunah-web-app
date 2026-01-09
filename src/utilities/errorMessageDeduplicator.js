/**
 * Error Message Deduplicator
 * 
 * Prevents duplicate error messages from being displayed within a short time window.
 * Useful for preventing duplicate errors from React Strict Mode double renders
 * or multiple error handlers catching the same error.
 */

// Store last displayed error messages with timestamps
const errorMessageCache = new Map();

/**
 * Clear old error messages from cache (older than 5 seconds)
 */
const clearOldMessages = () => {
  const now = Date.now();
  for (const [message, timestamp] of errorMessageCache.entries()) {
    if (now - timestamp > 5000) {
      errorMessageCache.delete(message);
    }
  }
};

/**
 * Check if an error message should be displayed
 * 
 * @param {string} errorMessage - The error message to check
 * @param {number} dedupeWindow - Time window in milliseconds (default: 3000ms)
 * @returns {boolean} - True if message should be displayed, false if it's a duplicate
 */
export const shouldDisplayError = (errorMessage, dedupeWindow = 3000) => {
  if (!errorMessage) return false;
  
  // Clear old messages periodically
  clearOldMessages();
  
  const now = Date.now();
  const lastTimestamp = errorMessageCache.get(errorMessage);
  
  // If message was shown recently, don't display it again
  if (lastTimestamp && now - lastTimestamp < dedupeWindow) {
    console.log("⏸️ Suppressing duplicate error message:", errorMessage);
    return false;
  }
  
  // Update cache with current timestamp
  errorMessageCache.set(errorMessage, now);
  return true;
};

/**
 * Clear the error message cache (useful for testing or reset)
 */
export const clearErrorCache = () => {
  errorMessageCache.clear();
};

