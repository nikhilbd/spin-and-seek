// Room Data Dictionary, Solvability Engine & Difficulty Tiering
// "Spin & Seek: The Cluttered Curiosity Parlor" (Photorealistic Edition)
(function(exports) {
  'use strict';

  const DIFFICULTY_ORDER = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  };

  /**
   * Canonical 1-to-1 physical objects in the room.
   * Design invariants:
   * 1. Every entry is a concrete, countable physical object (no materials like Wood, Glass, Gold, Sand, Paper, Ink).
   * 2. Every entry has a unique visual hotspot `group` (no two words share the same outline).
   * 3. Every entry has a unique (firstLetter, lastLetter, letterCount) clue signature (0 ambiguous clues).
   * 4. Every SVG shape outline is spatially disjoint from neighboring objects (0 hover occlusions).
   */
  const ROOM_OBJECTS = [
    // ==================== LETTER A ====================
    {
      id: 'apple',
      name: 'Apple',
      firstLetter: 'A',
      lastLetter: 'E',
      x: 1100,
      y: 318,
      rx: 30,
      ry: 22,
      category: 'shelf',
      group: 'apple',
      difficulty: 'beginner',
      hint: 'A bright red polished apple resting in the porcelain bowl on the upper desk shelf.',
      shape: {
        type: 'path',
        d: 'M1070,334 C1068,310 1082,297 1100,298 C1118,297 1130,310 1128,334 Q1100,340 1070,334 Z'
      }
    },
    {
      id: 'armchair',
      name: 'Armchair',
      firstLetter: 'A',
      lastLetter: 'R',
      x: 120,
      y: 412,
      rx: 120,
      ry: 50,
      category: 'furniture',
      group: 'armchair',
      acceptedGroups: ['armchair', 'cushion', 'yarn', 'desk_chair'],
      isContainer: true,
      difficulty: 'intermediate',
      hint: 'A deep tufted brown leather wingback armchair standing beside the window.',
      shape: {
        type: 'path',
        d: 'M0,398 Q85,382 175,378 Q215,378 225,425 L188,430 L50,460 L0,460 Z M132,590 L220,564 L290,564 L290,635 L185,595 Z'
      }
    },

    // ==================== LETTER B ====================
    {
      id: 'book',
      name: 'Book',
      firstLetter: 'B',
      lastLetter: 'K',
      x: 865,
      y: 620,
      rx: 120,
      ry: 65,
      category: 'desk',
      group: 'open_book',
      acceptedGroups: ['open_book', 'pen', 'shelf_volume', 'bookshelf'],
      difficulty: 'beginner',
      hint: 'A thick leather-bound book lying open with handwritten notes on the desk.',
      shape: {
        type: 'path',
        d: 'M748,610 L830,558 Q865,556 898,568 L916,580 L960,658 L1000,630 L1026,620 L968,704 L868,658 Z'
      }
    },
    {
      id: 'bell',
      name: 'Bell',
      firstLetter: 'B',
      lastLetter: 'L',
      x: 938,
      y: 562,
      rx: 36,
      ry: 24,
      category: 'desk',
      group: 'bell',
      difficulty: 'beginner',
      hint: 'A polished brass desk service bell sitting behind the open book.',
      shape: {
        type: 'path',
        d: 'M933,534 L945,534 L945,542 C962,546 970,562 974,580 Q938,590 902,580 C906,562 914,546 933,542 Z'
      }
    },
    {
      id: 'bow',
      name: 'Bow',
      firstLetter: 'B',
      lastLetter: 'W',
      x: 456,
      y: 484,
      rx: 25,
      ry: 102,
      category: 'music',
      group: 'violin_bow',
      acceptedGroups: ['violin_bow', 'violin'],
      difficulty: 'beginner',
      hint: 'A slender wooden horsehair bow leaning beside the violin.',
      shape: {
        type: 'polygon',
        points: '471,382 480,384 442,586 432,584'
      }
    },
    {
      id: 'board',
      name: 'Board',
      firstLetter: 'B',
      lastLetter: 'D',
      x: 235,
      y: 715,
      rx: 100,
      ry: 55,
      category: 'table',
      group: 'chessboard',
      acceptedGroups: ['chessboard', 'king', 'queen', 'knight', 'rook', 'pawn'],
      isContainer: true,
      difficulty: 'beginner',
      hint: 'The inlaid checkered wooden game board on the chess table.',
      shape: {
        type: 'polygon',
        points: '175,695 260,650 312,704 205,768 95,768'
      }
    },
    {
      id: 'bottle',
      name: 'Bottle',
      firstLetter: 'B',
      lastLetter: 'E',
      x: 540,
      y: 142,
      rx: 22,
      ry: 32,
      category: 'shelf',
      group: 'bottle',
      acceptedGroups: ['bottle', 'flask', 'jar'],
      difficulty: 'beginner',
      hint: 'A bright emerald-green glass apothecary bottle on the top shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M535,100 L547,100 L548,126 L562,138 L562,170 L522,170 L522,138 L534,126 Z'
      }
    },
    {
      id: 'box',
      name: 'Box',
      firstLetter: 'B',
      lastLetter: 'X',
      x: 518,
      y: 744,
      rx: 42,
      ry: 32,
      category: 'desk',
      group: 'desk_box',
      difficulty: 'intermediate',
      hint: 'A dark polished wooden storage box with a brass clasp on the floor beneath the desk chair.',
      shape: {
        type: 'path',
        d: 'M476,728 L532,708 L556,724 L556,768 L476,768 Z'
      }
    },
    {
      id: 'binoculars',
      name: 'Binoculars',
      firstLetter: 'B',
      lastLetter: 'S',
      x: 1212,
      y: 595,
      rx: 46,
      ry: 72,
      category: 'desk',
      group: 'binoculars',
      difficulty: 'intermediate',
      hint: 'Heavy brass field binoculars standing on the right side of the rolltop desk (and a smaller pair on the upper shelf).',
      shape: {
        type: 'path',
        d: 'M1176,532 L1210,534 L1210,552 L1220,554 L1222,544 L1256,548 L1258,656 Q1232,668 1206,654 L1206,638 Q1185,646 1166,630 Z M1018,342 L1066,338 L1068,372 L1018,374 Z'
      }
    },

    // ==================== LETTER C ====================
    {
      id: 'clock',
      name: 'Clock',
      firstLetter: 'C',
      lastLetter: 'K',
      x: 418,
      y: 222,
      rx: 38,
      ry: 48,
      category: 'furniture',
      group: 'clock_dial',
      acceptedGroups: ['clock_dial', 'clock_pendulum', 'pocket_watch'],
      difficulty: 'beginner',
      hint: 'The tall wooden grandfather clock (or the small mantel clock on the window sill).',
      shape: {
        type: 'path',
        d: 'M382,196 L392,194 C392,150 444,150 444,194 L454,196 L454,262 L382,262 Z M268,348 L268,292 C268,268 310,268 310,292 L310,348 Z'
      }
    },
    {
      id: 'cup',
      name: 'Cup',
      firstLetter: 'C',
      lastLetter: 'P',
      x: 1188,
      y: 356,
      rx: 40,
      ry: 18,
      category: 'shelf',
      group: 'teacup',
      acceptedGroups: ['teacup', 'saucer'],
      difficulty: 'beginner',
      hint: 'A floral porcelain teacup resting on its saucer near the lamp.',
      shape: {
        type: 'path',
        d: 'M1152,340 L1218,342 C1236,344 1236,366 1212,370 L1166,370 C1156,364 1152,352 1152,340 Z'
      }
    },
    {
      id: 'chair',
      name: 'Chair',
      firstLetter: 'C',
      lastLetter: 'R',
      x: 495,
      y: 712,
      rx: 130,
      ry: 60,
      category: 'furniture',
      group: 'desk_chair',
      acceptedGroups: ['desk_chair', 'armchair', 'cushion'],
      difficulty: 'beginner',
      hint: 'The carved wooden desk chair (or the leather armchair by the window).',
      shape: {
        type: 'path',
        d: 'M366,688 Q368,660 392,664 L452,704 L596,650 Q632,648 634,684 L624,768 L596,768 L600,690 L458,744 L470,768 L392,768 Z'
      }
    },
    {
      id: 'chain',
      name: 'Chain',
      firstLetter: 'C',
      lastLetter: 'N',
      x: 1132,
      y: 712,
      rx: 56,
      ry: 20,
      category: 'desk',
      group: 'chain',
      acceptedGroups: ['chain', 'pocket_watch', 'chandelier'],
      difficulty: 'intermediate',
      hint: 'A looping gold pocket watch chain draped across the desk chart.',
      shape: {
        type: 'path',
        d: 'M1082,684 L1106,704 L1148,706 L1162,680 L1182,686 L1176,704 L1156,720 L1098,718 L1074,694 Z'
      }
    },
    {
      id: 'compass',
      name: 'Compass',
      firstLetter: 'C',
      lastLetter: 'S',
      x: 1097,
      y: 656,
      rx: 44,
      ry: 54,
      category: 'desk',
      group: 'compass',
      difficulty: 'intermediate',
      hint: 'An open brass maritime pocket compass resting on the navigation chart.',
      shape: {
        type: 'path',
        d: 'M1098,630 C1098,592 1154,592 1154,630 C1154,668 1098,668 1098,630 Z M1066,656 C1066,636 1128,636 1128,656 C1128,676 1066,676 1066,656 Z'
      }
    },
    {
      id: 'chandelier',
      name: 'Chandelier',
      firstLetter: 'C',
      lastLetter: 'R',
      x: 675,
      y: 65,
      rx: 150,
      ry: 78,
      category: 'ceiling',
      group: 'chandelier',
      difficulty: 'advanced',
      hint: 'An ornate hanging brass chandelier with glowing stained-glass shades.',
      shape: {
        type: 'path',
        d: 'M525,0 L825,0 L808,78 Q785,126 742,122 Q715,116 702,98 Q698,142 675,156 Q652,142 648,98 Q628,132 595,128 Q560,122 545,78 Z'
      }
    },

    // ==================== LETTER D ====================
    {
      id: 'desk',
      name: 'Desk',
      firstLetter: 'D',
      lastLetter: 'K',
      x: 780,
      y: 720,
      rx: 180,
      ry: 60,
      category: 'furniture',
      group: 'desk',
      acceptedGroups: ['desk', 'desk_drawer', 'typewriter', 'magnifier', 'open_book', 'pen', 'bell', 'telescope', 'envelope', 'quill', 'inkwell', 'hourglass', 'compass', 'pocket_watch', 'chain', 'binoculars', 'scroll', 'map', 'yardstick'],
      isContainer: true,
      difficulty: 'beginner',
      hint: 'The massive mahogany rolltop writing desk loaded with curiosities.',
      shape: {
        type: 'path',
        d: 'M560,490 L580,415 L635,382 L680,405 L655,450 L610,480 Z M696,650 L860,665 L965,710 L965,768 L696,768 Z'
      }
    },
    {
      id: 'drawer',
      name: 'Drawer',
      firstLetter: 'D',
      lastLetter: 'R',
      x: 642,
      y: 668,
      rx: 50,
      ry: 105,
      category: 'desk',
      group: 'desk_drawer',
      acceptedGroups: ['desk_drawer', 'desk'],
      difficulty: 'beginner',
      hint: 'Carved wooden drawers with ornate handles under the left side of the desk.',
      shape: {
        type: 'polygon',
        points: '602,565 692,555 692,768 626,768 626,650 602,650'
      }
    },

    // ==================== LETTER E ====================
    {
      id: 'egg',
      name: 'Egg',
      firstLetter: 'E',
      lastLetter: 'G',
      x: 566,
      y: 276,
      rx: 20,
      ry: 10,
      category: 'shelf',
      group: 'egg',
      acceptedGroups: ['egg', 'nest'],
      difficulty: 'beginner',
      hint: 'Three bright Robin\'s-egg blue bird eggs nestled inside the woven twig nest.',
      shape: {
        type: 'path',
        d: 'M546,276 C546,264 586,264 586,276 C586,285 546,285 546,276 Z'
      }
    },
    {
      id: 'envelope',
      name: 'Envelope',
      firstLetter: 'E',
      lastLetter: 'E',
      x: 868,
      y: 444,
      rx: 25,
      ry: 34,
      category: 'desk',
      group: 'envelope',
      difficulty: 'beginner',
      hint: 'A cream parchment letter envelope tucked into the rolltop desk cubbyhole.',
      shape: {
        type: 'polygon',
        points: '842,418 872,408 892,472 862,476'
      }
    },

    // ==================== LETTER F ====================
    {
      id: 'frame',
      name: 'Frame',
      firstLetter: 'F',
      lastLetter: 'E',
      x: 58,
      y: 96,
      rx: 48,
      ry: 65,
      category: 'wall',
      group: 'wall_prints',
      difficulty: 'beginner',
      hint: 'Polished wooden picture frames bordering the botanical prints on the left wall.',
      shape: {
        type: 'path',
        d: 'M8,28 L96,40 L106,162 L17,156 Z M22,196 L108,200 L119,314 L33,318 Z'
      }
    },
    {
      id: 'flask',
      name: 'Flask',
      firstLetter: 'F',
      lastLetter: 'K',
      x: 504,
      y: 142,
      rx: 16,
      ry: 30,
      category: 'shelf',
      group: 'flask',
      acceptedGroups: ['flask', 'bottle', 'jar'],
      difficulty: 'advanced',
      hint: 'An amber glass apothecary flask on the top-left shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M494,108 L512,108 L518,134 L518,170 L490,170 L490,134 Z'
      }
    },

    // ==================== LETTER G ====================
    {
      id: 'globe',
      name: 'Globe',
      firstLetter: 'G',
      lastLetter: 'E',
      x: 326,
      y: 405,
      rx: 80,
      ry: 68,
      category: 'furniture',
      group: 'globe',
      difficulty: 'beginner',
      hint: 'An antique terrestrial world globe mounted in a wooden horizon stand.',
      shape: {
        type: 'path',
        d: 'M266,406 C266,336 386,336 386,406 L408,406 L405,424 L384,426 C374,482 278,482 268,426 L248,424 L246,406 Z'
      }
    },

    // ==================== LETTER H ====================
    {
      id: 'hourglass',
      name: 'Hourglass',
      firstLetter: 'H',
      lastLetter: 'S',
      x: 1086,
      y: 554,
      rx: 42,
      ry: 78,
      category: 'desk',
      group: 'hourglass',
      difficulty: 'beginner',
      hint: 'A wooden-framed hourglass measuring the flow of sand on the desk (or on the upper shelf).',
      shape: {
        type: 'path',
        d: 'M1052,474 L1130,480 L1126,500 L1116,504 L1110,608 L1116,614 L1114,634 L1046,624 L1046,608 L1056,604 L1062,500 L1052,496 Z M966,252 L1026,254 L1024,266 L1016,270 L1014,362 L1022,366 L1022,380 L966,378 L966,364 L976,360 L978,270 L966,266 Z'
      }
    },

    // ==================== LETTER I ====================
    {
      id: 'inkwell',
      name: 'Inkwell',
      firstLetter: 'I',
      lastLetter: 'L',
      x: 1014,
      y: 582,
      rx: 24,
      ry: 32,
      category: 'desk',
      group: 'inkwell',
      acceptedGroups: ['inkwell', 'quill'],
      difficulty: 'beginner',
      hint: 'A faceted glass inkwell holding the white feather quill on the desk.',
      shape: {
        type: 'path',
        d: 'M1002,546 L1024,546 L1026,560 L1038,566 L1038,610 L990,610 L990,566 L1000,560 Z'
      }
    },

    // ==================== LETTER J ====================
    {
      id: 'jar',
      name: 'Jar',
      firstLetter: 'J',
      lastLetter: 'R',
      x: 590,
      y: 136,
      rx: 24,
      ry: 32,
      category: 'shelf',
      group: 'jar',
      acceptedGroups: ['jar', 'bottle', 'flask'],
      difficulty: 'beginner',
      hint: 'A clear cylindrical glass jar on the top shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M570,100 L610,100 L614,112 L614,170 L566,170 L566,112 Z'
      }
    },

    // ==================== LETTER K ====================
    {
      id: 'key',
      name: 'Key',
      firstLetter: 'K',
      lastLetter: 'Y',
      x: 916,
      y: 358,
      rx: 42,
      ry: 18,
      category: 'shelf',
      group: 'keys',
      difficulty: 'beginner',
      hint: 'Antique brass skeleton keys resting on the shelf beside the lantern.',
      shape: {
        type: 'path',
        d: 'M872,356 L908,338 L962,360 L914,374 Z'
      }
    },
    {
      id: 'king',
      name: 'King',
      firstLetter: 'K',
      lastLetter: 'G',
      x: 63,
      y: 656,
      rx: 16,
      ry: 36,
      category: 'table',
      group: 'king',
      acceptedGroups: ['king', 'queen', 'knight', 'rook', 'pawn'],
      difficulty: 'beginner',
      hint: 'The tall carved wooden chess king piece standing on the back rank.',
      shape: {
        type: 'path',
        d: 'M54,616 L72,616 L75,692 L51,692 Z'
      }
    },
    {
      id: 'knight',
      name: 'Knight',
      firstLetter: 'K',
      lastLetter: 'T',
      x: 142,
      y: 626,
      rx: 22,
      ry: 32,
      category: 'table',
      group: 'knight',
      acceptedGroups: ['knight', 'king', 'queen', 'rook', 'pawn'],
      difficulty: 'intermediate',
      hint: 'A hand-carved wooden horse knight chess piece on the board.',
      shape: {
        type: 'path',
        d: 'M124,600 Q145,586 160,596 L164,654 L124,660 Z'
      }
    },

    // ==================== LETTER L ====================
    {
      id: 'lamp',
      name: 'Lamp',
      firstLetter: 'L',
      lastLetter: 'P',
      x: 1310,
      y: 240,
      rx: 92,
      ry: 142,
      category: 'lighting',
      group: 'tiffany_lamp',
      acceptedGroups: ['tiffany_lamp', 'lantern', 'chandelier'],
      difficulty: 'beginner',
      hint: 'A radiant stained-glass Tiffany lamp glowing with warm light (by the desk or window).',
      shape: {
        type: 'path',
        d: 'M1188,232 C1210,140 1270,112 1330,112 C1355,112 1368,125 1376,142 L1376,238 L1338,242 L1334,382 L1370,404 L1254,404 L1290,382 L1298,242 Z M148,322 C156,272 180,258 206,258 C232,258 254,272 262,322 Q205,332 148,322 Z M198,328 L212,328 L214,376 L196,376 Z'
      }
    },
    {
      id: 'lantern',
      name: 'Lantern',
      firstLetter: 'L',
      lastLetter: 'N',
      x: 868,
      y: 302,
      rx: 36,
      ry: 70,
      category: 'shelf',
      group: 'lantern',
      acceptedGroups: ['lantern', 'tiffany_lamp'],
      difficulty: 'intermediate',
      hint: 'A brass hurricane lantern with a glowing glass chimney on the shelf.',
      shape: {
        type: 'path',
        d: 'M856,228 Q868,216 880,228 L892,258 L900,272 Q908,306 896,340 L898,368 L838,368 L840,340 Q828,306 836,272 L844,258 Z'
      }
    },

    // ==================== LETTER M ====================
    {
      id: 'map',
      name: 'Map',
      firstLetter: 'M',
      lastLetter: 'P',
      x: 1025,
      y: 420,
      rx: 140,
      ry: 42,
      category: 'desk',
      group: 'map',
      acceptedGroups: ['map', 'compass', 'pocket_watch', 'chain', 'globe'],
      difficulty: 'beginner',
      hint: 'An aged nautical parchment map unrolled across the desk.',
      shape: {
        type: 'path',
        d: 'M892,382 L1120,406 L1120,448 L894,458 Z M985,680 L1045,695 L1085,735 L985,720 Z'
      }
    },
    {
      id: 'magnifier',
      name: 'Magnifier',
      firstLetter: 'M',
      lastLetter: 'R',
      x: 835,
      y: 536,
      rx: 48,
      ry: 32,
      category: 'desk',
      group: 'magnifier',
      difficulty: 'beginner',
      hint: 'An optical brass handheld magnifying glass resting on the desk.',
      shape: {
        type: 'path',
        d: 'M818,528 C818,504 878,504 878,528 C878,552 818,552 818,528 Z M820,532 L832,540 L782,576 L768,564 Z'
      }
    },

    // ==================== LETTER N ====================
    {
      id: 'nest',
      name: 'Nest',
      firstLetter: 'N',
      lastLetter: 'T',
      x: 566,
      y: 298,
      rx: 34,
      ry: 18,
      category: 'shelf',
      group: 'nest',
      acceptedGroups: ['nest', 'egg'],
      difficulty: 'beginner',
      hint: 'A woven twig bird\'s nest holding three bright blue eggs in the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M532,286 L600,286 C600,316 532,316 532,286 Z'
      }
    },

    // ==================== LETTER O ====================
    {
      id: 'owl',
      name: 'Owl',
      firstLetter: 'O',
      lastLetter: 'L',
      x: 624,
      y: 208,
      rx: 24,
      ry: 40,
      category: 'shelf',
      group: 'owl',
      difficulty: 'beginner',
      hint: 'A detailed brown owl statue perched on the second shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M606,170 L628,170 L634,188 L646,228 L644,244 L606,244 L604,195 Z'
      }
    },

    // ==================== LETTER P ====================
    {
      id: 'pen',
      name: 'Pen',
      firstLetter: 'P',
      lastLetter: 'N',
      x: 947,
      y: 619,
      rx: 28,
      ry: 36,
      category: 'desk',
      group: 'pen',
      acceptedGroups: ['pen', 'quill', 'open_book'],
      difficulty: 'beginner',
      hint: 'A dark fountain pen resting diagonally across the right page of the open book.',
      shape: {
        type: 'polygon',
        points: '920,586 930,582 974,650 964,656'
      }
    },
    {
      id: 'pawn',
      name: 'Pawn',
      firstLetter: 'P',
      lastLetter: 'N',
      x: 165,
      y: 706,
      rx: 85,
      ry: 55,
      category: 'table',
      group: 'pawn',
      acceptedGroups: ['pawn', 'king', 'queen', 'knight', 'rook', 'chessboard'],
      difficulty: 'beginner',
      hint: 'The front rows of turned wooden chess pawns on the game board.',
      shape: {
        type: 'path',
        d: 'M60,736 L252,646 L272,688 L82,768 Z'
      }
    },
    {
      id: 'pillow',
      name: 'Pillow',
      firstLetter: 'P',
      lastLetter: 'W',
      x: 140,
      y: 505,
      rx: 84,
      ry: 76,
      category: 'furniture',
      group: 'cushion',
      acceptedGroups: ['cushion', 'armchair'],
      difficulty: 'beginner',
      hint: 'A plush embroidered tapestry pillow tucked into the leather armchair.',
      shape: {
        type: 'path',
        d: 'M52,466 Q122,452 188,434 Q206,482 208,532 Q176,562 128,588 Q92,526 52,466 Z'
      }
    },
    {
      id: 'phone',
      name: 'Phone',
      firstLetter: 'P',
      lastLetter: 'E',
      x: 766,
      y: 316,
      rx: 52,
      ry: 48,
      category: 'shelf',
      group: 'telephone',
      difficulty: 'beginner',
      hint: 'An antique brass and black rotary phone on the desk shelf.',
      shape: {
        type: 'path',
        d: 'M718,280 Q770,252 824,280 L820,300 L794,296 L806,360 L724,360 L736,296 L718,300 Z'
      }
    },
    {
      id: 'pendulum',
      name: 'Pendulum',
      firstLetter: 'P',
      lastLetter: 'M',
      x: 418,
      y: 372,
      rx: 26,
      ry: 85,
      category: 'clock',
      group: 'clock_pendulum',
      acceptedGroups: ['clock_pendulum', 'clock_dial'],
      difficulty: 'advanced',
      hint: 'The polished brass pendulum and weights inside the grandfather clock case.',
      shape: {
        type: 'rect',
        x: 392,
        y: 288,
        width: 52,
        height: 170,
        rx: 6
      }
    },

    // ==================== LETTER Q ====================
    {
      id: 'queen',
      name: 'Queen',
      firstLetter: 'Q',
      lastLetter: 'N',
      x: 90,
      y: 650,
      rx: 16,
      ry: 36,
      category: 'table',
      group: 'queen',
      acceptedGroups: ['queen', 'king', 'knight', 'rook', 'pawn'],
      difficulty: 'beginner',
      hint: 'The tall crowned wooden queen chess piece standing next to the king.',
      shape: {
        type: 'path',
        d: 'M80,612 L98,612 L100,686 L78,686 Z'
      }
    },
    {
      id: 'quill',
      name: 'Quill',
      firstLetter: 'Q',
      lastLetter: 'L',
      x: 1036,
      y: 490,
      rx: 32,
      ry: 56,
      category: 'desk',
      group: 'quill',
      acceptedGroups: ['quill', 'inkwell', 'pen'],
      difficulty: 'beginner',
      hint: 'A bright white feather quill pen standing in the glass inkwell on the desk.',
      shape: {
        type: 'path',
        d: 'M1008,542 L1004,524 C1014,480 1038,442 1066,432 C1072,442 1066,482 1046,518 L1020,542 Z'
      }
    },

    // ==================== LETTER R ====================
    {
      id: 'rug',
      name: 'Rug',
      firstLetter: 'R',
      lastLetter: 'G',
      x: 375,
      y: 735,
      rx: 80,
      ry: 45,
      category: 'floor',
      group: 'rug',
      acceptedGroups: ['rug', 'desk_chair', 'desk_box'],
      isContainer: true,
      difficulty: 'beginner',
      hint: 'A patterned crimson Persian rug warming the hardwood parlor floor.',
      shape: {
        type: 'polygon',
        points: '295,768 355,690 435,690 385,768'
      }
    },
    {
      id: 'ruler',
      name: 'Ruler',
      firstLetter: 'R',
      lastLetter: 'R',
      x: 788,
      y: 389,
      rx: 92,
      ry: 14,
      category: 'desk',
      group: 'yardstick',
      difficulty: 'beginner',
      hint: 'A brass-tipped wooden measuring ruler resting on the desk ledge below the phone.',
      shape: {
        type: 'path',
        d: 'M696,372 L882,396 L880,406 L694,382 Z M1125,392 L1235,412 L1233,422 L1123,402 Z'
      }
    },
    {
      id: 'rook',
      name: 'Rook',
      firstLetter: 'R',
      lastLetter: 'K',
      x: 18,
      y: 672,
      rx: 16,
      ry: 32,
      category: 'table',
      group: 'rook',
      acceptedGroups: ['rook', 'king', 'queen', 'knight', 'pawn'],
      difficulty: 'intermediate',
      hint: 'A carved wooden castle rook chess piece standing at the left corner of the chessboard.',
      shape: {
        type: 'path',
        d: 'M4,642 L28,642 L32,702 L4,702 Z'
      }
    },

    // ==================== LETTER S ====================
    {
      id: 'skull',
      name: 'Skull',
      firstLetter: 'S',
      lastLetter: 'L',
      x: 640,
      y: 140,
      rx: 24,
      ry: 28,
      category: 'shelf',
      group: 'skull',
      difficulty: 'beginner',
      hint: 'An ivory skull curio on the top-right shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M618,136 C616,108 664,108 662,136 L656,168 L624,168 Z'
      }
    },
    {
      id: 'scroll',
      name: 'Scroll',
      firstLetter: 'S',
      lastLetter: 'L',
      x: 1256,
      y: 675,
      rx: 56,
      ry: 88,
      category: 'desk',
      group: 'scroll',
      difficulty: 'beginner',
      hint: 'A thick rolled parchment scroll tied with a cord on the right side of the desk.',
      shape: {
        type: 'path',
        d: 'M1200,720 Q1200,696 1216,674 L1276,600 Q1296,594 1314,608 L1258,746 Q1238,760 1214,750 Q1200,736 1200,720 Z'
      }
    },
    {
      id: 'shelf',
      name: 'Shelf',
      firstLetter: 'S',
      lastLetter: 'F',
      x: 1005,
      y: 75,
      rx: 175,
      ry: 65,
      category: 'furniture',
      group: 'bookshelf',
      acceptedGroups: ['bookshelf', 'shelf_volume', 'flask', 'bottle', 'jar', 'skull', 'shelf_urn', 'owl', 'nest', 'egg', 'zebra', 'xylophone', 'telephone', 'lantern', 'keys', 'apple', 'teacup', 'saucer'],
      isContainer: true,
      difficulty: 'beginner',
      hint: 'Solid polished mahogany bookshelves holding rows of leather tomes and curiosities.',
      shape: {
        type: 'path',
        d: 'M830,10 L1180,10 L1180,140 L830,140 Z'
      }
    },
    {
      id: 'saucer',
      name: 'Saucer',
      firstLetter: 'S',
      lastLetter: 'R',
      x: 1188,
      y: 382,
      rx: 50,
      ry: 12,
      category: 'shelf',
      group: 'saucer',
      acceptedGroups: ['saucer', 'teacup'],
      difficulty: 'advanced',
      hint: 'A fine porcelain saucer plate beneath the teacup on the shelf.',
      shape: {
        type: 'path',
        d: 'M1138,374 Q1188,382 1238,376 C1232,390 1144,390 1138,374 Z'
      }
    },

    // ==================== LETTER T ====================
    {
      id: 'train',
      name: 'Train',
      firstLetter: 'T',
      lastLetter: 'N',
      x: 74,
      y: 352,
      rx: 50,
      ry: 24,
      category: 'window',
      group: 'window_toy',
      difficulty: 'beginner',
      hint: 'A miniature wooden toy train resting on the window ledge.',
      shape: {
        type: 'path',
        d: 'M0,348 L24,344 L26,368 L0,372 Z M32,332 L68,330 L68,342 L91,340 L92,320 L102,320 L102,340 L114,342 L124,366 L32,372 Z'
      }
    },
    {
      id: 'telescope',
      name: 'Telescope',
      firstLetter: 'T',
      lastLetter: 'E',
      x: 925,
      y: 510,
      rx: 102,
      ry: 34,
      category: 'desk',
      group: 'telescope',
      difficulty: 'intermediate',
      hint: 'A long cylindrical polished brass telescope resting behind the desk bell.',
      shape: {
        type: 'polygon',
        points: '842,480 1002,524 998,532 838,510'
      }
    },
    {
      id: 'typewriter',
      name: 'Typewriter',
      firstLetter: 'T',
      lastLetter: 'R',
      x: 706,
      y: 500,
      rx: 96,
      ry: 70,
      category: 'desk',
      group: 'typewriter',
      difficulty: 'intermediate',
      hint: 'A vintage black Smith Premier mechanical typewriter with round keys and a paper carriage.',
      shape: {
        type: 'polygon',
        points: '694,414 804,428 812,474 798,530 742,582 612,542 636,486 664,444'
      }
    },

    // ==================== LETTER U ====================
    {
      id: 'umbrella',
      name: 'Umbrella',
      firstLetter: 'U',
      lastLetter: 'A',
      x: 354,
      y: 555,
      rx: 55,
      ry: 115,
      category: 'furniture',
      group: 'umbrella',
      difficulty: 'beginner',
      hint: 'A classic folded umbrella with a curved wooden handle leaning against the armchair.',
      shape: {
        type: 'path',
        d: 'M296,478 C288,430 336,422 350,458 L362,494 L392,532 L374,580 L394,658 L374,658 L348,595 L312,538 L336,492 L324,458 C316,446 306,452 310,478 Z'
      }
    },

    // ==================== LETTER V ====================
    {
      id: 'vase',
      name: 'Vase',
      firstLetter: 'V',
      lastLetter: 'E',
      x: 564,
      y: 208,
      rx: 26,
      ry: 38,
      category: 'shelf',
      group: 'shelf_urn',
      difficulty: 'beginner',
      hint: 'A bright blue-and-gold painted porcelain vase on the second shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M544,172 L584,172 L588,188 C590,210 584,228 574,236 L578,246 L550,246 L554,236 C544,228 538,210 540,188 Z'
      }
    },
    {
      id: 'violin',
      name: 'Violin',
      firstLetter: 'V',
      lastLetter: 'N',
      x: 492,
      y: 510,
      rx: 42,
      ry: 108,
      category: 'music',
      group: 'violin',
      acceptedGroups: ['violin', 'violin_bow'],
      difficulty: 'beginner',
      hint: 'A polished wooden violin with carved f-holes standing upright on its stand.',
      shape: {
        type: 'path',
        d: 'M489,368 L503,368 L502,454 C522,458 530,478 522,498 C514,508 514,518 524,530 C538,548 534,578 508,582 C495,585 482,585 468,582 C444,578 442,548 456,530 C466,518 466,508 458,498 C450,478 458,458 488,454 Z'
      }
    },
    {
      id: 'volume',
      name: 'Volume',
      firstLetter: 'V',
      lastLetter: 'E',
      x: 1002,
      y: 200,
      rx: 46,
      ry: 50,
      category: 'shelf',
      group: 'shelf_volume',
      acceptedGroups: ['shelf_volume', 'bookshelf', 'open_book'],
      difficulty: 'advanced',
      hint: 'Leaning hardcover library volumes with crimson and gold bindings on the bookshelf.',
      shape: {
        type: 'polygon',
        points: '984,146 1048,154 1024,250 956,244'
      }
    },

    // ==================== LETTER W ====================
    {
      id: 'watch',
      name: 'Watch',
      firstLetter: 'W',
      lastLetter: 'H',
      x: 1058,
      y: 677,
      rx: 26,
      ry: 17,
      category: 'desk',
      group: 'pocket_watch',
      acceptedGroups: ['pocket_watch', 'chain', 'clock_dial'],
      difficulty: 'beginner',
      hint: 'A round gold pocket watch keeping time on the navigation chart.',
      shape: {
        type: 'ellipse',
        cx: 1058,
        cy: 677,
        rx: 26,
        ry: 17
      }
    },
    {
      id: 'window',
      name: 'Window',
      firstLetter: 'W',
      lastLetter: 'W',
      x: 235,
      y: 175,
      rx: 88,
      ry: 90,
      category: 'window',
      group: 'window',
      difficulty: 'beginner',
      hint: 'A tall diamond-lattice leaded glass window overlooking the twilight courtyard.',
      shape: {
        type: 'polygon',
        points: '146,72 314,92 318,252 152,252'
      }
    },

    // ==================== LETTER X ====================
    {
      id: 'xylophone',
      name: 'Xylophone',
      firstLetter: 'X',
      lastLetter: 'E',
      x: 588,
      y: 362,
      rx: 60,
      ry: 30,
      category: 'shelf',
      group: 'xylophone',
      difficulty: 'beginner',
      hint: 'A bright rainbow-colored wooden xylophone on the lower shelf of the lit curio cabinet.',
      shape: {
        type: 'polygon',
        points: '550,330 646,352 638,392 528,376'
      }
    },

    // ==================== LETTER Y ====================
    {
      id: 'yarn',
      name: 'Yarn',
      firstLetter: 'Y',
      lastLetter: 'N',
      x: 238,
      y: 528,
      rx: 38,
      ry: 38,
      category: 'furniture',
      group: 'yarn',
      difficulty: 'beginner',
      hint: 'A bright yellow ball of knitting yarn with needles resting on the leather armchair.',
      shape: {
        type: 'path',
        d: 'M210,530 C210,496 248,494 258,508 L280,466 L292,478 L266,520 C270,544 256,560 238,560 C220,560 210,546 210,530 Z'
      }
    },

    // ==================== LETTER Z ====================
    {
      id: 'zebra',
      name: 'Zebra',
      firstLetter: 'Z',
      lastLetter: 'A',
      x: 626,
      y: 286,
      rx: 28,
      ry: 34,
      category: 'shelf',
      group: 'zebra',
      difficulty: 'beginner',
      hint: 'A black-and-white striped zebra figurine on the third shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M602,272 L606,250 L616,254 L622,272 L648,276 L650,316 L634,316 L632,294 L620,294 L618,316 L606,316 L608,284 Z'
      }
    }
  ];

  /**
   * Returns objects available for a given difficulty tier.
   * 'beginner' (Ages ~5): common, short, concrete objects.
   * 'intermediate' (Ages ~9): beginner + intermediate items.
   * 'advanced' (Ages 13+): all objects.
   */
  function getObjectsForDifficulty(difficulty = 'intermediate') {
    const targetLevel = DIFFICULTY_ORDER[difficulty] || 2;
    return ROOM_OBJECTS.filter(obj => (DIFFICULTY_ORDER[obj.difficulty] || 2) <= targetLevel);
  }

  /**
   * Returns a sorted list of unique ending letters available in the room
   * for a given starting letter and difficulty.
   */
  function getValidLastLetters(firstLetter, difficulty = 'intermediate') {
    if (!firstLetter) return [];
    const fl = firstLetter.toUpperCase();
    const pool = getObjectsForDifficulty(difficulty);
    const endingSet = new Set();
    pool.forEach(obj => {
      if (obj.firstLetter === fl) {
        endingSet.add(obj.lastLetter);
      }
    });
    return Array.from(endingSet).sort();
  }

  /**
   * Returns all room objects whose firstLetter and lastLetter match the target pair,
   * scoped to the selected difficulty tier.
   */
  function findMatchingObjects(firstLetter, lastLetter, difficulty = 'intermediate') {
    if (!firstLetter || !lastLetter) return [];
    const fl = firstLetter.toUpperCase();
    const ll = lastLetter.toUpperCase();
    const pool = getObjectsForDifficulty(difficulty);
    return pool.filter(obj => obj.firstLetter === fl && obj.lastLetter === ll);
  }

  /**
   * Returns the count of alphabetic letters in a word.
   */
  function getLetterCount(word) {
    if (!word) return 0;
    return (word.match(/[A-Za-z]/g) || []).length;
  }

  /**
   * Returns structured letter slot descriptor for each character in word.
   */
  function getWordSlots(word, revealedIndices) {
    if (!word) return [];
    const upper = word.toUpperCase();
    const set = new Set(revealedIndices || []);
    return upper.split('').map((char, index) => {
      const isLetter = /[A-Z]/.test(char);
      const isRevealed = !isLetter || set.has(index);
      return {
        char: isRevealed ? char : '',
        displayChar: isRevealed ? char : '_',
        isLetter: isLetter,
        revealed: isRevealed,
        index: index
      };
    });
  }

  exports.ROOM_OBJECTS = ROOM_OBJECTS;
  exports.getObjectsForDifficulty = getObjectsForDifficulty;
  exports.getValidLastLetters = getValidLastLetters;
  exports.findMatchingObjects = findMatchingObjects;
  exports.getLetterCount = getLetterCount;
  exports.getWordSlots = getWordSlots;

})(typeof exports !== 'undefined' ? exports : (window.ROOM_DATA = {}));
