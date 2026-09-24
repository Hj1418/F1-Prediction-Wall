/**
 * The Grid — Reusable Motorsport Hub Component
 * 
 * Architectural Invariant:
 * "The template is generic and shared across all championships (F1, MotoGP, WEC, etc.).
 *  F1 is one motorsport on The Grid; it must never become the template itself.
 *  The template adapts terminology and content strictly to the discipline."
 */

export { ChampionshipDetailPage as MotorsportHub } from '../../pages/ChampionshipDetailPage';
export { ChampionshipDetailPage as default } from '../../pages/ChampionshipDetailPage';
