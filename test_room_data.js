// Test suite for room_data.js integrity, 1-to-1 physical object invariants,
// clue uniqueness, and wheel solvability across all difficulty levels.
const fs = require('fs');
const path = require('path');

// Load room_data.js in a sandbox
const roomDataPath = path.join(__dirname, 'room_data.js');
if (!fs.existsSync(roomDataPath)) {
  console.error(`FAIL: room_data.js not found at ${roomDataPath}`);
  process.exit(1);
}

const roomDataCode = fs.readFileSync(roomDataPath, 'utf8');
const moduleContext = {};
const evalFn = new Function('exports', 'module', roomDataCode);
evalFn(moduleContext, { exports: moduleContext });

const { ROOM_OBJECTS, getValidLastLetters, findMatchingObjects, getWordSlots, getLetterCount, getObjectsForDifficulty } = moduleContext;

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Testing Room Data Integrity ---');

assert(Array.isArray(ROOM_OBJECTS), 'ROOM_OBJECTS is an array');
assert(ROOM_OBJECTS.length >= 50, `ROOM_OBJECTS has at least 50 distinct physical objects (found ${ROOM_OBJECTS.length})`);

const BANNED_NON_OBJECT_WORDS = new Set([
  'wood', 'gold', 'glass', 'sand', 'paper', 'ink', 'art', 'toy',
  'ornament', 'zodiac', 'chess', 'handle', 'lens', 'gear', 'star',
  'coin', 'utensil', 'print', 'rope', 'shade', 'page', 'note'
]);

const seenIds = new Set();
const seenGroups = new Map();
const seenClueSignatures = new Map();
const startingLetters = new Set();
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

ROOM_OBJECTS.forEach((obj, idx) => {
  // Check required fields
  assert(typeof obj.id === 'string' && obj.id.length > 0, `Item ${idx} has a valid string id`);
  assert(!seenIds.has(obj.id), `Item ${obj.id} has a unique id`);
  seenIds.add(obj.id);

  assert(
    !BANNED_NON_OBJECT_WORDS.has(obj.id.toLowerCase()) && !BANNED_NON_OBJECT_WORDS.has(obj.name.toLowerCase()),
    `Item ${obj.id} (${obj.name}) is a concrete physical object (not a material/abstract word)`
  );

  assert(typeof obj.name === 'string' && obj.name.length > 0, `Item ${obj.id} has a valid name`);

  const cleanName = obj.name.trim();
  const expectedFirst = cleanName[0].toUpperCase();
  const expectedLast = cleanName[cleanName.length - 1].toUpperCase();

  assert(
    obj.firstLetter === expectedFirst,
    `Item ${obj.id} (${obj.name}) firstLetter '${obj.firstLetter}' matches expected '${expectedFirst}'`
  );
  assert(
    obj.lastLetter === expectedLast,
    `Item ${obj.id} (${obj.name}) lastLetter '${obj.lastLetter}' matches expected '${expectedLast}'`
  );

  startingLetters.add(obj.firstLetter);

  assert(typeof obj.x === 'number' && obj.x >= 0 && obj.x <= 1376, `Item ${obj.id} x=${obj.x} within bounds`);
  assert(typeof obj.y === 'number' && obj.y >= 0 && obj.y <= 768, `Item ${obj.id} y=${obj.y} within bounds`);
  assert(typeof obj.hint === 'string' && obj.hint.length > 0, `Item ${obj.id} has a descriptive hint`);
  assert(typeof obj.group === 'string' && obj.group.length > 0, `Item ${obj.id} has a valid hit group`);
  assert(
    !seenGroups.has(obj.group),
    `Item ${obj.id} has a unique visual hotspot group '${obj.group}' (not shared with ${seenGroups.get(obj.group)})`
  );
  seenGroups.set(obj.group, obj.id);

  const clueSig = `${obj.firstLetter}_${obj.lastLetter}_${getLetterCount(obj.name)}`;
  assert(
    !seenClueSignatures.has(clueSig),
    `Item ${obj.id} (${obj.name}) has a unique (first, last, length) clue signature '${clueSig}' (not shared with ${seenClueSignatures.get(clueSig)})`
  );
  seenClueSignatures.set(clueSig, obj.id);

  assert(obj.shape && typeof obj.shape.type === 'string', `Item ${obj.id} has an explicit SVG shape outline`);
});

console.log('\n--- Testing Alphabet Coverage (A-Z) ---');
alphabet.forEach((letter) => {
  const count = ROOM_OBJECTS.filter((o) => o.firstLetter === letter).length;
  assert(count > 0, `Letter '${letter}' has at least 1 starting object (found ${count})`);
});

console.log('\n--- Testing Solvability Engine ---');
alphabet.forEach((letter) => {
  const validLasts = getValidLastLetters(letter);
  assert(Array.isArray(validLasts) && validLasts.length > 0, `getValidLastLetters('${letter}') returns at least 1 ending letter`);

  validLasts.forEach((lastLetter) => {
    const matches = findMatchingObjects(letter, lastLetter);
    assert(
      Array.isArray(matches) && matches.length > 0,
      `Pair (${letter}, ${lastLetter}) has at least 1 matching object in room (found ${matches.length})`
    );
  });
});

console.log('\n--- Testing Progressive Word Slot and Letter Count Engine ---');
assert(typeof getLetterCount === 'function', 'getLetterCount is a function');
assert(getLetterCount('Book') === 4, 'getLetterCount("Book") === 4');
assert(getLetterCount('Yo-yo') === 4, 'getLetterCount("Yo-yo") === 4');
assert(getLetterCount('Telescope') === 9, 'getLetterCount("Telescope") === 9');

assert(typeof getWordSlots === 'function', 'getWordSlots is a function');
const slots1 = getWordSlots('Book', [0, 3]);
assert(slots1.length === 4, 'slots for "Book" has length 4');
assert(slots1[0].revealed === true && slots1[0].char === 'B', 'Slot 0 is B (revealed)');
assert(slots1[1].revealed === false && slots1[1].displayChar === '_', 'Slot 1 is _ (hidden)');
assert(slots1[2].revealed === false && slots1[2].displayChar === '_', 'Slot 2 is _ (hidden)');
assert(slots1[3].revealed === true && slots1[3].char === 'K', 'Slot 3 is K (revealed)');

// Test revealing index 1
const slots2 = getWordSlots('Book', [0, 1, 3]);
assert(slots2[1].revealed === true && slots2[1].char === 'O', 'After hint: Slot 1 is O (revealed)');

console.log('\n--- Testing Difficulty Level Engine ---');
assert(typeof getObjectsForDifficulty === 'function', 'getObjectsForDifficulty is a function');

const validDifficulties = ['beginner', 'intermediate', 'advanced'];
ROOM_OBJECTS.forEach(obj => {
  assert(
    validDifficulties.includes(obj.difficulty),
    `Item ${obj.id} has a valid difficulty (${obj.difficulty})`
  );
});

validDifficulties.forEach(diff => {
  const diffObjects = getObjectsForDifficulty(diff);
  assert(Array.isArray(diffObjects) && diffObjects.length > 0, `Difficulty '${diff}' has objects (found ${diffObjects.length})`);

  // Check A-Z alphabet coverage for this difficulty
  alphabet.forEach(letter => {
    const validLasts = getValidLastLetters(letter, diff);
    assert(
      Array.isArray(validLasts) && validLasts.length > 0,
      `[${diff}] Letter '${letter}' has at least 1 valid ending letter in difficulty '${diff}'`
    );

    validLasts.forEach(lastLetter => {
      const matches = findMatchingObjects(letter, lastLetter, diff);
      assert(
        Array.isArray(matches) && matches.length > 0,
        `[${diff}] Pair (${letter}, ${lastLetter}) has at least 1 match in '${diff}'`
      );
    });
  });
});

console.log('\n--- Test Summary ---');
if (failures === 0) {
  console.log(`🎉 All tests passed successfully! Total objects: ${ROOM_OBJECTS.length}`);
  process.exit(0);
} else {
  console.error(`💥 Test run failed with ${failures} failure(s).`);
  process.exit(1);
}
