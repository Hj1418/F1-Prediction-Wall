import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllGlobalCalendarEvents } from '../src/services/calendar/globalCalendarService.js';
import { generateIcsFeed } from '../src/services/calendar/calendarFeedGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🏁 GENERATING "THE GRID — ALL MOTORSPORT" ICALENDAR FEED (.ics)...');

try {
  // 1. Authoritative Event Source
  const events = getAllGlobalCalendarEvents();
  console.log(`  ✓ Aggregated ${events.length} authoritative events across all supported championships.`);

  // 2. Generate RFC 5545 Compliant Feed
  const icsContent = generateIcsFeed(events, {
    calendarName: 'The Grid — All Motorsport',
    calendarDescription: 'Official race calendar for The Grid covering Formula 1, MotoGP, WEC, WRC, IndyCar, and more.',
  });

  // 3. Write to public/calendar/the-grid.ics
  const publicCalendarDir = path.join(rootDir, 'public', 'calendar');
  fs.mkdirSync(publicCalendarDir, { recursive: true });

  const publicFilePath = path.join(publicCalendarDir, 'the-grid.ics');
  fs.writeFileSync(publicFilePath, icsContent, 'utf-8');

  const stats = fs.statSync(publicFilePath);
  const lineCount = icsContent.split('\r\n').length;
  console.log(`  ✓ Output written to: ${publicFilePath}`);
  console.log(`  ✓ File size: ${(stats.size / 1024).toFixed(2)} KB (${stats.size} bytes, ${lineCount} CRLF lines)`);

  // 4. If dist exists, also sync to dist/calendar/the-grid.ics
  const distCalendarDir = path.join(rootDir, 'dist', 'calendar');
  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.mkdirSync(distCalendarDir, { recursive: true });
    const distFilePath = path.join(distCalendarDir, 'the-grid.ics');
    fs.writeFileSync(distFilePath, icsContent, 'utf-8');
    console.log(`  ✓ Deployed copy synced to: ${distFilePath}`);
  }

  console.log('🏆 iCalendar feed generation completed successfully!\n');
} catch (err) {
  console.error('❌ Failed to generate iCalendar feed:', err);
  process.exit(1);
}
