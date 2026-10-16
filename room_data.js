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
   * 4. Every SVG shape outline is pixel-calibrated to `curiosity_parlor.jpg` with 0 hover occlusions.
   */
  const ROOM_OBJECTS = [
    // ==================== LETTER A ====================
    {
      id: 'apple',
      name: 'Apple',
      firstLetter: 'A',
      lastLetter: 'E',
      x: 1108,
      y: 318,
      rx: 30,
      ry: 22,
      category: 'shelf',
      group: 'apple',
      difficulty: 'beginner',
      hint: 'A bright red polished apple resting in the porcelain bowl on the upper desk shelf.',
      shape: {
        type: 'path',
        d: 'M1078,334 C1076,310 1090,297 1108,298 C1126,297 1138,310 1136,334 Q1108,340 1078,334 Z'
      }
    },
    {
      id: 'armchair',
      name: 'Armchair',
      firstLetter: 'A',
      lastLetter: 'R',
      x: 120,
      y: 416,
      rx: 120,
      ry: 50,
      category: 'furniture',
      group: 'armchair',
      acceptedGroups: ['armchair', 'cushion', 'yarn', 'desk_chair'],
      isContainer: true,
      zIndex: 0,
      difficulty: 'intermediate',
      hint: 'A deep tufted brown leather wingback armchair standing beside the window.',
      shape: {
        type: 'path',
        d: 'M0,398 Q85,382 175,378 Q222,378 232,434 L244,484 L336,488 Q358,494 358,522 L354,626 L180,612 L0,618 Z'
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
      acceptedGroups: ['open_book', 'pen', 'bookshelf'],
      difficulty: 'beginner',
      hint: 'A thick leather-bound book lying open with handwritten notes on the desk.',
      shape: {
        type: 'path',
        d: 'M748,608 L830,558 Q865,556 898,568 Q912,566 926,570 L1028,616 L968,704 L868,658 Z'
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
      zIndex: 15,
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
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'A slender wooden horsehair bow leaning beside the violin.',
      shape: {
        type: 'polygon',
        points: '471,382 480,384 442,586 432,584'
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
      ry: 30,
      category: 'shelf',
      group: 'bottle',
      acceptedGroups: ['bottle', 'flask', 'jar'],
      difficulty: 'beginner',
      hint: 'A bright emerald-green glass apothecary bottle on the top shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M535,100 L547,100 L548,128 L562,138 L562,166 L522,166 L522,138 L534,128 Z'
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
      zIndex: 15,
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
      hint: 'Heavy brass field binoculars on the rolltop desk (and a smaller pair on the upper shelf).',
      shape: {
        type: 'path',
        d: 'M1152,530 L1258,544 L1258,656 Q1232,668 1206,654 L1206,638 Q1180,646 1152,628 Z M1025,360 L1088,356 L1092,386 L1026,388 Z M1172,482 L1238,486 L1238,518 L1172,514 Z'
      }
    },

    // ==================== LETTER C ====================
    {
      id: 'chessboard',
      name: 'Chessboard',
      firstLetter: 'C',
      lastLetter: 'D',
      x: 245,
      y: 718,
      rx: 100,
      ry: 55,
      category: 'table',
      group: 'chessboard',
      acceptedGroups: ['chessboard', 'king', 'queen', 'knight', 'rook', 'pawn'],
      isContainer: true,
      zIndex: 5,
      difficulty: 'beginner',
      hint: 'The inlaid checkered wooden chessboard holding the carved chess pieces.',
      shape: {
        type: 'polygon',
        points: '0,668 168,596 340,696 218,768 0,768'
      }
    },
    {
      id: 'clock',
      name: 'Clock',
      firstLetter: 'C',
      lastLetter: 'K',
      x: 418,
      y: 222,
      rx: 34,
      ry: 44,
      category: 'furniture',
      group: 'clock_dial',
      acceptedGroups: ['clock_dial', 'clock_pendulum', 'pocket_watch'],
      zIndex: 10,
      difficulty: 'beginner',
      hint: 'The tall wooden grandfather clock (or the small mantel clock on the window sill).',
      shape: {
        type: 'path',
        d: 'M384,202 L392,200 C392,162 444,162 444,200 L452,202 L452,258 L384,258 Z M270,350 L270,298 C270,274 312,274 312,298 L312,350 Z'
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
        d: 'M1152,340 L1218,342 C1238,344 1238,368 1212,372 L1164,372 C1154,364 1152,352 1152,340 Z'
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
      zIndex: 10,
      difficulty: 'beginner',
      hint: 'The carved wooden desk chair (or the leather armchair by the window).',
      shape: {
        type: 'path',
        d: 'M366,685 Q368,655 392,660 L452,704 L596,648 Q628,646 632,680 L618,768 L392,768 Z'
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
      zIndex: 15,
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
      zIndex: 15,
      difficulty: 'intermediate',
      hint: 'An open brass maritime pocket compass resting on the navigation chart.',
      shape: {
        type: 'path',
        d: 'M1098,634 C1094,594 1154,592 1154,628 C1154,646 1142,658 1128,660 C1126,676 1066,676 1066,656 C1066,642 1082,636 1098,634 Z'
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
      zIndex: 5,
      difficulty: 'advanced',
      hint: 'An ornate hanging brass chandelier with glowing stained-glass shades.',
      shape: {
        type: 'path',
        d: 'M486,0 L818,0 L795,72 Q755,104 702,100 Q698,140 675,156 Q652,140 648,100 Q585,104 504,58 Z'
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
      rx: 250,
      ry: 150,
      category: 'furniture',
      group: 'desk',
      acceptedGroups: ['desk', 'desk_drawer', 'typewriter', 'magnifier', 'open_book', 'pen', 'bell', 'telescope', 'quill', 'inkwell', 'hourglass', 'compass', 'pocket_watch', 'chain', 'binoculars', 'scroll', 'map'],
      isContainer: true,
      zIndex: 0,
      difficulty: 'beginner',
      hint: 'The massive mahogany rolltop writing desk loaded with curiosities.',
      shape: {
        type: 'path',
        d: 'M532,566 C530,515 554,475 606,448 C646,426 666,396 678,368 L1376,420 L1372,446 L1366,510 L1338,610 L1280,768 L532,768 Z'
      }
    },

    {
      id: 'drawer',
      name: 'Drawer',
      firstLetter: 'D',
      lastLetter: 'R',
      x: 654,
      y: 660,
      rx: 78,
      ry: 96,
      category: 'desk',
      group: 'desk_drawer',
      acceptedGroups: ['desk_drawer', 'desk'],
      zIndex: 2,
      difficulty: 'beginner',
      hint: 'Carved wooden drawers with ornate handles under the left side of the desk.',
      shape: {
        type: 'polygon',
        points: '532,566 688,608 688,768 532,768'
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
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'Three bright Robin\'s-egg blue bird eggs nestled inside the woven twig nest.',
      shape: {
        type: 'path',
        d: 'M544,276 C544,264 588,264 588,276 C588,286 544,286 544,276 Z'
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
      ry: 28,
      category: 'shelf',
      group: 'flask',
      acceptedGroups: ['flask', 'bottle', 'jar'],
      difficulty: 'advanced',
      hint: 'An amber glass apothecary flask on the top-left shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M494,108 L512,108 L518,134 L518,166 L488,166 L488,134 Z'
      }
    },

    // ==================== LETTER G ====================
    {
      id: 'globe',
      name: 'Globe',
      firstLetter: 'G',
      lastLetter: 'E',
      x: 326,
      y: 396,
      rx: 80,
      ry: 60,
      category: 'furniture',
      group: 'globe',
      zIndex: 10,
      difficulty: 'beginner',
      hint: 'An antique terrestrial world globe mounted in a wooden horizon stand.',
      shape: {
        type: 'path',
        d: 'M266,408 C266,338 386,338 386,408 L408,408 L405,424 L384,426 C374,474 278,474 268,426 L248,424 L246,408 Z'
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
      zIndex: 12,
      difficulty: 'beginner',
      hint: 'A wooden-framed hourglass measuring the flow of sand on the desk (or on the upper shelf).',
      shape: {
        type: 'path',
        d: 'M1054,474 L1130,480 L1126,500 L1116,504 L1110,606 L1118,612 L1116,628 L1046,622 L1046,608 L1056,604 L1062,500 L1054,496 Z M966,252 L1026,254 L1024,266 L1016,270 L1014,362 L1022,366 L1022,380 L966,378 L966,364 L976,360 L978,270 L966,266 Z'
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
      ry: 30,
      category: 'shelf',
      group: 'jar',
      acceptedGroups: ['jar', 'bottle', 'flask'],
      difficulty: 'beginner',
      hint: 'A clear cylindrical glass jar on the top shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M572,102 L608,102 L614,114 L614,166 L566,166 L566,114 Z'
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
      y: 654,
      rx: 14,
      ry: 33,
      category: 'table',
      group: 'king',
      acceptedGroups: ['king', 'queen', 'knight', 'rook', 'pawn'],
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'The tall carved wooden chess king piece standing on the back rank.',
      shape: {
        type: 'path',
        d: 'M51,618 L73,618 L75,692 L51,692 Z'
      }
    },
    {
      id: 'knight',
      name: 'Knight',
      firstLetter: 'K',
      lastLetter: 'T',
      x: 126,
      y: 630,
      rx: 16,
      ry: 28,
      category: 'table',
      group: 'knight',
      acceptedGroups: ['knight', 'king', 'queen', 'rook', 'pawn'],
      zIndex: 15,
      difficulty: 'intermediate',
      hint: 'A hand-carved wooden horse knight chess piece on the board.',
      shape: {
        type: 'path',
        d: 'M112,602 Q126,592 138,602 L140,668 L112,668 Z'
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
      zIndex: 10,
      difficulty: 'beginner',
      hint: 'A radiant stained-glass Tiffany lamp glowing with warm light (by the desk or window).',
      shape: {
        type: 'path',
        d: 'M1186,232 C1210,140 1268,114 1326,114 C1352,114 1368,120 1376,126 L1376,240 Q1352,246 1328,246 L1336,318 L1328,368 L1372,404 L1252,404 L1296,368 L1288,318 L1296,246 Q1235,244 1186,232 Z M142,326 C152,288 178,280 205,280 C232,280 258,288 268,326 L266,344 Q240,348 214,348 L216,384 L194,384 L196,348 Q170,348 144,344 Z'
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
        type: 'polygon',
        points: '884,376 1168,406 1164,452 886,460'
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
      zIndex: 15,
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
      zIndex: 10,
      difficulty: 'beginner',
      hint: 'A woven twig bird\'s nest holding three bright blue eggs in the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M528,280 Q566,274 604,280 C604,316 528,316 528,280 Z'
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
      ry: 38,
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
      rx: 18,
      ry: 24,
      category: 'desk',
      group: 'pen',
      acceptedGroups: ['pen', 'quill', 'open_book'],
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'A dark fountain pen resting diagonally across the right page of the open book.',
      shape: {
        type: 'polygon',
        points: '920,586 932,582 976,650 964,656'
      }
    },
    {
      id: 'pawn',
      name: 'Pawn',
      firstLetter: 'P',
      lastLetter: 'N',
      x: 170,
      y: 680,
      rx: 65,
      ry: 45,
      category: 'table',
      group: 'pawn',
      acceptedGroups: ['pawn', 'king', 'queen', 'knight', 'rook', 'chessboard'],
      zIndex: 12,
      difficulty: 'beginner',
      hint: 'Individual turned wooden chess pawns standing on the chessboard.',
      shape: {
        type: 'path',
        d: 'M106,644 L124,644 L124,690 L106,690 Z M140,626 L158,626 L158,672 L140,672 Z M160,656 L180,656 L180,704 L160,704 Z M218,636 L238,636 L238,688 L218,688 Z M192,650 L212,650 L212,702 L192,702 Z M110,682 L132,682 L132,738 L110,738 Z M68,710 L90,710 L90,762 L68,762 Z'
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
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'A plush embroidered tapestry pillow tucked into the leather armchair.',
      shape: {
        type: 'path',
        d: 'M48,462 Q120,448 188,432 Q208,478 222,526 Q178,560 124,588 Q88,524 48,462 Z'
      }
    },
    {
      id: 'phone',
      name: 'Phone',
      firstLetter: 'P',
      lastLetter: 'E',
      x: 766,
      y: 316,
      rx: 58,
      ry: 48,
      category: 'shelf',
      group: 'telephone',
      difficulty: 'beginner',
      hint: 'An antique brass and black rotary phone on the desk shelf.',
      shape: {
        type: 'path',
        d: 'M708,282 Q770,250 836,282 L830,304 L794,296 L806,360 L724,360 L736,296 L712,304 Z'
      }
    },
    {
      id: 'pendulum',
      name: 'Pendulum',
      firstLetter: 'P',
      lastLetter: 'M',
      x: 416,
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
        x: 390,
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
      y: 644,
      rx: 14,
      ry: 32,
      category: 'table',
      group: 'queen',
      acceptedGroups: ['queen', 'king', 'knight', 'rook', 'pawn'],
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'The tall crowned wooden queen chess piece standing next to the king.',
      shape: {
        type: 'path',
        d: 'M78,612 L98,612 L100,686 L78,686 Z'
      }
    },
    {
      id: 'quill',
      name: 'Quill',
      firstLetter: 'Q',
      lastLetter: 'L',
      x: 1034,
      y: 488,
      rx: 28,
      ry: 54,
      category: 'desk',
      group: 'quill',
      acceptedGroups: ['quill', 'inkwell', 'pen'],
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'A bright white feather quill pen standing in the glass inkwell on the desk.',
      shape: {
        type: 'path',
        d: 'M1008,546 L1004,520 C1012,480 1034,444 1060,434 C1066,448 1052,478 1042,506 L1020,546 Z'
      }
    },

    // ==================== LETTER R ====================
    {
      id: 'rug',
      name: 'Rug',
      firstLetter: 'R',
      lastLetter: 'G',
      x: 362,
      y: 735,
      rx: 110,
      ry: 65,
      category: 'floor',
      group: 'rug',
      acceptedGroups: ['rug', 'desk_chair', 'desk_box'],
      isContainer: true,
      zIndex: -10,
      difficulty: 'beginner',
      hint: 'A patterned crimson Persian rug warming the hardwood parlor floor.',
      shape: {
        type: 'polygon',
        points: '240,768 458,626 532,646 532,768'
      }
    },
    {
      id: 'rook',
      name: 'Rook',
      firstLetter: 'R',
      lastLetter: 'K',
      x: 168,
      y: 610,
      rx: 14,
      ry: 26,
      category: 'table',
      group: 'rook',
      acceptedGroups: ['rook', 'king', 'queen', 'knight', 'pawn'],
      zIndex: 15,
      difficulty: 'intermediate',
      hint: 'The carved wooden castle rook chess piece standing at the corner of the chessboard.',
      shape: {
        type: 'path',
        d: 'M156,586 L178,586 L178,638 L156,638 Z M242,636 L264,636 L264,688 L242,688 Z'
      }
    },

    // ==================== LETTER S ====================
    {
      id: 'skull',
      name: 'Skull',
      firstLetter: 'S',
      lastLetter: 'L',
      x: 640,
      y: 144,
      rx: 22,
      ry: 24,
      category: 'shelf',
      group: 'skull',
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'An ivory skull curio on the top-right shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M620,142 C618,118 662,118 660,142 L654,166 L626,166 Z'
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
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'A thick rolled parchment scroll tied with a cord on the right side of the desk.',
      shape: {
        type: 'path',
        d: 'M1188,718 Q1188,694 1208,672 L1276,600 Q1298,594 1318,608 L1258,748 Q1234,762 1204,750 Q1188,736 1188,718 Z'
      }
    },
    {
      id: 'shelf',
      name: 'Shelf',
      firstLetter: 'S',
      lastLetter: 'F',
      x: 1005,
      y: 75,
      rx: 320,
      ry: 160,
      category: 'furniture',
      group: 'bookshelf',
      acceptedGroups: ['bookshelf', 'flask', 'bottle', 'jar', 'skull', 'shelf_urn', 'owl', 'nest', 'egg', 'zebra', 'xylophone', 'telephone', 'lantern', 'keys', 'apple', 'teacup', 'saucer', 'binoculars', 'hourglass'],
      isContainer: true,
      zIndex: 0,
      difficulty: 'beginner',
      hint: 'Solid polished mahogany bookshelves holding rows of leather tomes and curiosities.',
      shape: {
        type: 'path',
        d: 'M472,86 L676,72 L676,0 L1376,0 L1376,396 L676,368 L676,412 L472,390 Z'
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
        d: 'M1136,375 Q1188,382 1242,376 C1234,390 1142,390 1136,375 Z'
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
        d: 'M0,348 L24,344 L26,356 L32,355 L32,332 L68,330 L68,342 L91,340 L92,320 L102,320 L102,340 L114,342 L124,366 L32,374 L32,364 L26,365 L26,376 L0,380 Z'
      }
    },
    {
      id: 'telescope',
      name: 'Telescope',
      firstLetter: 'T',
      lastLetter: 'E',
      x: 912,
      y: 515,
      rx: 95,
      ry: 28,
      category: 'desk',
      group: 'telescope',
      zIndex: 12,
      difficulty: 'intermediate',
      hint: 'A gleaming cylindrical polished brass spyglass telescope resting behind the desk bell.',
      shape: {
        type: 'polygon',
        points: '828,482 1004,524 998,548 822,508'
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
        points: '694,414 804,428 812,474 798,530 742,582 612,542 636,486 664,434'
      }
    },

    // ==================== LETTER U ====================
    {
      id: 'umbrella',
      name: 'Umbrella',
      firstLetter: 'U',
      lastLetter: 'A',
      x: 362,
      y: 555,
      rx: 45,
      ry: 110,
      category: 'furniture',
      group: 'umbrella',
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'A classic folded umbrella with a curved wooden handle leaning against the armchair.',
      shape: {
        type: 'path',
        d: 'M296,478 C290,432 338,424 352,458 L364,494 L398,534 L382,582 L394,656 L376,656 L354,590 L334,536 L344,492 L326,456 C318,446 308,452 312,478 Z'
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
        d: 'M544,172 L584,172 L592,188 C596,210 586,228 574,236 L578,246 L550,246 L554,236 C542,228 532,210 536,188 Z'
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
      y: 185,
      rx: 88,
      ry: 95,
      category: 'window',
      group: 'window',
      zIndex: 0,
      difficulty: 'beginner',
      hint: 'A tall diamond-lattice leaded glass window overlooking the twilight courtyard.',
      shape: {
        type: 'polygon',
        points: '146,72 314,92 320,292 154,292'
      }
    },

    // ==================== LETTER X ====================
    {
      id: 'xylophone',
      name: 'Xylophone',
      firstLetter: 'X',
      lastLetter: 'E',
      x: 584,
      y: 366,
      rx: 58,
      ry: 26,
      category: 'shelf',
      group: 'xylophone',
      difficulty: 'beginner',
      hint: 'A bright rainbow-colored wooden xylophone on the lower shelf of the lit curio cabinet.',
      shape: {
        type: 'polygon',
        points: '536,342 640,356 632,392 518,378'
      }
    },

    // ==================== LETTER Y ====================
    {
      id: 'yarn',
      name: 'Yarn',
      firstLetter: 'Y',
      lastLetter: 'N',
      x: 239,
      y: 532,
      rx: 29,
      ry: 28,
      category: 'furniture',
      group: 'yarn',
      zIndex: 15,
      difficulty: 'beginner',
      hint: 'A bright green-gold ball of knitting yarn resting on the leather armchair.',
      shape: {
        type: 'path',
        d: 'M210,532 C210,496 268,496 268,532 C268,568 210,568 210,532 Z'
      }
    },

    // ==================== LETTER Z ====================
    {
      id: 'zebra',
      name: 'Zebra',
      firstLetter: 'Z',
      lastLetter: 'A',
      x: 622,
      y: 286,
      rx: 30,
      ry: 34,
      category: 'shelf',
      group: 'zebra',
      difficulty: 'beginner',
      hint: 'A black-and-white striped zebra figurine on the third shelf of the lit curio cabinet.',
      shape: {
        type: 'path',
        d: 'M590,268 L598,248 L614,252 L622,272 L648,276 L650,316 L634,316 L632,294 L620,294 L618,316 L606,316 L608,284 Z'
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
