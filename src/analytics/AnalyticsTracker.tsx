import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from './analytics';
import {
  trackExploreViewed,
  trackCalendarViewed,
  trackPredictionPageViewed,
  trackLeaderboardViewed,
  trackProfileViewed,
} from './events';

export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    // Schedule page view tracking slightly asynchronously to allow document.title to update
    const timer = setTimeout(() => {
      const fullPath = `/#${location.pathname}${location.search}`;
      const pageTitle = document.title;

      trackPageView({
        page_location: window.location.href,
        page_path: fullPath,
        page_title: pageTitle,
      });

      const path = location.pathname;
      if (path === '/explore') {
        trackExploreViewed();
      } else if (path === '/calendar' || path === '/schedule' || path === '/races') {
        trackCalendarViewed();
      } else if (path === '/predictions') {
        trackPredictionPageViewed();
      } else if (path === '/leaderboard') {
        trackLeaderboardViewed();
      } else if (path === '/profile' || path.startsWith('/profile/')) {
        trackProfileViewed({ is_own_profile: path === '/profile' });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};
