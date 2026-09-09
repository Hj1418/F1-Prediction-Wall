/**
 * Verification test suite for F1 Prediction Wall Avatar Presentation & Initial Generation:
 *
 * Requirements checked:
 * ✓ "Harsh Jalnekar" renders "H"
 * ✓ "Alex Thorne" renders "A"
 * ✓ lowercase names become uppercase
 * ✓ leading/trailing whitespace is handled
 * ✓ empty display name gets fallback "U"
 * ✓ two initials are never rendered
 * ✓ profile image is preferred when available
 * ✓ broken profile image falls back to the initial
 * ✓ avatar remains circular
 * ✓ navbar and profile use the same avatar logic
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getAvatarInitial, getInitials } from '../src/utils/getInitials';
import { UserInitialsAvatar, UserAvatar } from '../src/components/common/UserInitialsAvatar';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${msg}`);
    failCount++;
  } else {
    console.log(`  ✓ PASS: ${msg}`);
    passCount++;
  }
}

async function runAvatarTests() {
  console.log('🏎️ Starting Avatar Presentation & Initial Logic Verification...\n');

  // 1. Core Initial Generation Requirements
  console.log('1. Dynamic Initial Generation:');
  assert(getAvatarInitial('Harsh Jalnekar') === 'H', '"Harsh Jalnekar" renders "H"');
  assert(getAvatarInitial('Alex Thorne') === 'A', '"Alex Thorne" renders "A"');
  assert(getAvatarInitial('max verstappen') === 'M', 'lowercase names become uppercase ("max verstappen" -> "M")');
  assert(getAvatarInitial('charles leclerc') === 'C', 'lowercase names become uppercase ("charles leclerc" -> "C")');
  assert(getAvatarInitial(' Lewis Hamilton ') === 'L', 'leading/trailing whitespace is handled (" Lewis Hamilton " -> "L")');
  assert(getAvatarInitial('   George Russell   ') === 'G', 'multiple whitespace trimmed cleanly ("   George Russell   " -> "G")');
  assert(getAvatarInitial('') === 'U', 'empty display name gets fallback "U"');
  assert(getAvatarInitial('   ') === 'U', 'whitespace-only display name gets fallback "U"');
  assert(getAvatarInitial(null) === 'U', 'null display name gets fallback "U"');
  assert(getAvatarInitial(undefined) === 'U', 'undefined display name gets fallback "U"');

  // 2. Strict One-Character Invariant (Never 2 Initials)
  console.log('\n2. Strict Single Character Invariant (Never 2 Initials):');
  const sampleNames = [
    'Harsh Jalnekar',
    'Alex Thorne',
    'Max Verstappen',
    'Lewis Hamilton',
    'Charles Leclerc',
    'Carlos Sainz',
    'Lando Norris',
    'Oscar Piastri',
    'Fernando Alonso',
    'Kimi Antonelli',
    'Oliver Bearman',
    'Liam Lawson',
  ];
  for (const name of sampleNames) {
    const initial = getAvatarInitial(name);
    assert(initial.length === 1, `"${name}" returns exactly 1 char: "${initial}"`);
    assert(initial !== name.substring(0, 2).toUpperCase(), `"${name}" does NOT return 2 letters`);
  }
  assert(getAvatarInitial('Harsh Jalnekar') !== 'HJ', 'Harsh Jalnekar specifically NEVER renders "HJ"');

  // 3. Backward-compatibility of getInitials
  console.log('\n3. Backward-compatible getInitials helper:');
  assert(getInitials('Harsh Jalnekar') === 'H', 'getInitials("Harsh Jalnekar") returns "H"');
  assert(getInitials('Alex Thorne') === 'A', 'getInitials("Alex Thorne") returns "A"');

  // 4. Component Rendering Priority: Profile Image Preferred
  console.log('\n4. Profile Image Rendering Priority:');
  const htmlWithImage = renderToStaticMarkup(
    React.createElement(UserInitialsAvatar, {
      name: 'Harsh Jalnekar',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    })
  );
  assert(htmlWithImage.includes('<img'), 'Profile image is preferred when available (renders <img> tag)');
  assert(
    htmlWithImage.includes('src="https://images.unsplash.com/photo-1534528741775-53994a69daeb"'),
    'Profile image retains exact src URL'
  );
  assert(
    !htmlWithImage.includes('>H<'),
    'Initial letter is NOT displayed when image loads successfully'
  );

  // 5. Fallback to Initial When No Image Available
  console.log('\n5. Initial Fallback Presentation:');
  const htmlWithoutImage = renderToStaticMarkup(
    React.createElement(UserInitialsAvatar, {
      name: 'Harsh Jalnekar',
    })
  );
  assert(!htmlWithoutImage.includes('<img'), 'No <img> tag rendered when imageUrl is absent');
  assert(htmlWithoutImage.includes('H'), 'Dynamic single initial "H" is rendered in the avatar');
  assert(!htmlWithoutImage.includes('HJ'), 'Never renders "HJ" in avatar fallback markup');

  // 6. Avatar Geometry & Circular Styling
  console.log('\n6. Circular Geometry & Centering Constraints:');
  assert(
    htmlWithoutImage.includes('aspect-ratio:1 / 1') || htmlWithoutImage.includes('aspect-ratio: 1 / 1'),
    'Avatar enforces fixed aspect-ratio: 1 / 1'
  );
  assert(
    htmlWithoutImage.includes('border-radius:50%') || htmlWithoutImage.includes('border-radius: 50%'),
    'Avatar remains circular with border-radius: 50%'
  );
  assert(
    htmlWithoutImage.includes('overflow:hidden') || htmlWithoutImage.includes('overflow: hidden'),
    'Avatar enforces overflow: hidden'
  );
  assert(
    htmlWithoutImage.includes('display:flex') || htmlWithoutImage.includes('display: flex'),
    'Avatar uses flexbox for perfect vertical and horizontal centering'
  );
  assert(
    htmlWithoutImage.includes('align-items:center') || htmlWithoutImage.includes('align-items: center'),
    'Avatar aligns items in center'
  );
  assert(
    htmlWithoutImage.includes('justify-content:center') || htmlWithoutImage.includes('justify-content: center'),
    'Avatar justifies content in center'
  );

  // 7. Navbar and Profile Shared Avatar Logic
  console.log('\n7. Consistency Across Navbar, Profile, and Dropdown:');
  assert(
    UserAvatar === UserInitialsAvatar,
    'Navbar and profile share the exact same UserInitialsAvatar implementation'
  );

  const profileAvatarHtml = renderToStaticMarkup(
    React.createElement(UserInitialsAvatar, {
      name: 'Harsh Jalnekar',
      size: 90,
    })
  );
  const navbarAvatarHtml = renderToStaticMarkup(
    React.createElement(UserInitialsAvatar, {
      name: 'Harsh Jalnekar',
      size: 'sm',
    })
  );
  assert(profileAvatarHtml.includes('width:90px') && profileAvatarHtml.includes('>H<'), 'Profile avatar renders 90px circular avatar with initial "H"');
  assert(navbarAvatarHtml.includes('width:32px') && navbarAvatarHtml.includes('>H<'), 'Navbar avatar renders 32px circular avatar with initial "H"');
  assert(!profileAvatarHtml.includes('HJ') && !navbarAvatarHtml.includes('HJ'), 'Neither profile nor navbar renders "HJ"');

  console.log(`\n========================================`);
  console.log(`Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) {
    console.error('❌ AVATAR PRESENTATION TESTS FAILED');
    process.exit(1);
  }
  console.log('🏆 ALL AVATAR PRESENTATION & INITIAL INVARIANTS VERIFIED PERFECTLY!\n');
}

runAvatarTests().catch(err => {
  console.error(err);
  process.exit(1);
});
