import { useEffect } from 'react';
import { alertUtils } from '../utils/alertUtils';

export default function RateLimitBanner({ error }) {
  useEffect(() => {
    if (error && error.exceeded === true) {
      alertUtils.warning(
        "Free Limit Reached",
        `You have used ${error.used}/${error.limit} strategies. Please try again later or upgrade to unlock unlimited generation.`
      );
    }
  }, [error]);

  return null;
}
