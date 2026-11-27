import { MBBSYear, Flashcard, MnemonicBreakdown } from '@/types/database';

import anatomyCardsRaw from '@/data/decks/anatomy.json';
import physiologyCardsRaw from '@/data/decks/physiology.json';
import biochemistryCardsRaw from '@/data/decks/biochemistry.json';
import microbiologyCardsRaw from '@/data/decks/microbiology.json';
import pharmacologyCardsRaw from '@/data/decks/pharmacology.json';
import orthopedicsCardsRaw from '@/data/decks/orthopedics.json';
import dermatologyCardsRaw from '@/data/decks/dermatology.json';
import forensicCardsRaw from '@/data/decks/forensic.json';

export interface SubDeckInfo {
  id: string;       // e.g. 'deck-pharmacology::ans'
  parentId: string; // e.g. 'deck-pharmacology'
  name: string;     // e.g. 'ANS'
  cardCount: number;
  cards: Flashcard[];
}

export interface RealDeckInfo {
  id: string;
  subject: string;
  name: string;
  year: MBBSYear;
  cardCount: number;
  prefix: string;
  cards: Flashcard[];
  subDecks: SubDeckInfo[];
}

interface RawCardWithTags {
  id?: string;
  question: string;
  answer: string;
  explanation?: string;
  clinical_pearl?: string;
  tags?: string[];
  is_io?: boolean;
  extracted_ocr_notes?: string;
  mnemonic_breakdown?: MnemonicBreakdown;
}

function formatRawCards(rawList: RawCardWithTags[], deckId: string): Flashcard[] {
  return rawList.map((c, idx) => ({
    id: c.id || `${deckId}_${idx + 1}`,
    deck_id: deckId,
    question: c.question,
    answer: c.answer,
    explanation: c.explanation || '',
    clinical_pearl: c.clinical_pearl || '',
    image_path: null,
    is_io: Boolean(c.is_io),
    extracted_ocr_notes: c.extracted_ocr_notes || undefined,
    mnemonic_breakdown: c.mnemonic_breakdown || undefined,
  }));
}

interface TopicRule {
  slug: string;
  name: string;
  match: (tagStr: string, textStr: string) => boolean;
}

const SUBJECT_TOPIC_RULES: Record<string, TopicRule[]> = {
  'deck-pharmacology': [
    { slug: 'general-pharma', name: 'General Pharmacology', match: (t) => t.includes('generalpharma') },
    { slug: 'ans', name: 'ANS', match: (t) => t.includes('::ans') },
    { slug: 'cvs', name: 'CVS', match: (t) => t.includes('::cvs') },
    { slug: 'cns', name: 'CNS', match: (t) => t.includes('::cns') },
    { slug: 'antibiotics', name: 'Antibiotics & Antimicrobials', match: (t) => t.includes('antibiotics') || t.includes('::anti') },
    { slug: 'endocrine', name: 'Endocrine', match: (t) => t.includes('endocrine') },
    { slug: 'autocoids', name: 'Autacoids', match: (t) => t.includes('autocoids') },
    { slug: 'blood', name: 'Blood & Hematology', match: (t) => t.includes('::blood') },
    { slug: 'git', name: 'GIT', match: (t) => t.includes('::git') },
    { slug: 'kidney', name: 'Kidney & Diuretics', match: (t) => t.includes('kidney') },
    { slug: 'anticancer', name: 'Anticancer', match: (t) => t.includes('cancer') },
  ],
  'deck-microbiology': [
    { slug: 'general-micro', name: 'General Microbiology', match: (t) => t.includes('general') },
    { slug: 'immunology', name: 'Immunology', match: (t) => t.includes('immunology') },
    { slug: 'bacteriology', name: 'Bacteriology', match: (t) => t.includes('bacteriology') || t.includes('bacilli') || t.includes('strep') || t.includes('vibrio') || t.includes('cocci') },
    { slug: 'virology', name: 'Virology', match: (t) => t.includes('virology') || t.includes('virus') },
    { slug: 'parasitology', name: 'Parasitology', match: (t) => t.includes('parasitology') || t.includes('amoeb') },
    { slug: 'mycology', name: 'Mycology', match: (t) => t.includes('mycology') || t.includes('fungi') },
  ],
  'deck-anatomy': [
    { slug: 'embryology', name: 'Embryology', match: (t) => t.includes('embryology') },
    { slug: 'histology', name: 'Histology', match: (t) => t.includes('histology') },
    { slug: 'upper-limb', name: 'Upper Limb', match: (t) => t.includes('upper_limb') },
    { slug: 'lower-limb', name: 'Lower Limb', match: (t) => t.includes('lower_limb') },
    { slug: 'thorax', name: 'Thorax', match: (t) => t.includes('thorax') },
    { slug: 'abdomen-pelvis', name: 'Abdomen & Pelvis', match: (t) => t.includes('abdomen') || t.includes('pelvis') || t.includes('perineum') },
    { slug: 'head-neck', name: 'Head & Neck', match: (t) => t.includes('head,_neck') || t.includes('head_and_neck') },
    { slug: 'neuroanatomy', name: 'Neuroanatomy', match: (t) => t.includes('neuroanatomy') },
  ],
  'deck-physiology': [
    { slug: 'general-physiology', name: 'General Physiology', match: (t) => t.includes('generalphysiology') || t.includes('homeostasis') || t.includes('cellmembrane') || t.includes('membranetransport') || t.includes('bodyfluids') },
    { slug: 'nerve-muscle', name: 'Nerve & Muscle', match: (t) => t.includes('nervemuscle') || t.includes('skeletalmuscle') || t.includes('smoothmuscle') || t.includes('actionpotential') || t.includes('nmj') },
    { slug: 'cvs', name: 'Cardiovascular (CVS)', match: (t) => t.includes('cardiovascular') || t.includes('cvs') || t.includes('hemodynamics') || t.includes('cardiacmuscle') || t.includes('ecg') },
    { slug: 'respiratory', name: 'Respiratory', match: (t) => t.includes('respiratory') || t.includes('surfactant') || t.includes('ventilation') },
    { slug: 'renal', name: 'Renal & Acid-Base', match: (t) => t.includes('renal') || t.includes('acidbase') },
    { slug: 'git', name: 'GIT', match: (t) => t.includes('git') || t.includes('motility') },
    { slug: 'endocrine-repro', name: 'Endocrine & Reproduction', match: (t) => t.includes('endocrine') || t.includes('reproduction') },
    { slug: 'neurophysiology', name: 'Neurophysiology & Special Senses', match: (t) => t.includes('neurophysiology') || t.includes('cns') || t.includes('vision') || t.includes('reflexes') || t.includes('basalganglia') || t.includes('neurotransmitters') },
    { slug: 'hematology', name: 'Hematology', match: (t) => t.includes('hematology') },
  ],
  'deck-biochemistry': [
    { slug: 'enzymes', name: 'Enzymes', match: (t) => t.includes('enzymes') },
    { slug: 'carbohydrates', name: 'Carbohydrates', match: (t) => t.includes('carbohydrate') },
    { slug: 'amino-acids', name: 'Amino Acids & Proteins', match: (t) => t.includes('aminoacid') },
    { slug: 'lipids', name: 'Lipids', match: (t) => t.includes('lipids') },
    { slug: 'vitamins-genetics', name: 'Vitamins & Molecular Biology', match: (t, txt) => t.includes('vitamin') || t.includes('dna') || t.includes('rna') || txt.includes('vitamin') || txt.includes('dna') },
  ],
  'deck-orthopedics': [
    { slug: 'trauma-fractures', name: 'Trauma & Fractures', match: (t) => t.includes('fracture') || t.includes('trauma') || t.includes('dislocation') },
    { slug: 'spine', name: 'Spine', match: (t) => t.includes('spine') },
    { slug: 'bone-tumors', name: 'Bone Tumors', match: (t) => t.includes('tumour') || t.includes('tumor') },
    { slug: 'infections', name: 'Bone & Joint Infections', match: (t) => t.includes('infection') },
    { slug: 'joint-disorders', name: 'Joint Disorders', match: (t) => t.includes('joint_disorders') || t.includes('arthritis') },
    { slug: 'pediatric-ortho', name: 'Pediatric Orthopedics', match: (t) => t.includes('pediatric') },
    { slug: 'sports-regional', name: 'Sports & Regional Ortho', match: (t) => t.includes('sport') || t.includes('regional') },
  ],
  'deck-dermatology': [
    { slug: 'leprosy-stis', name: 'Leprosy & STIs', match: (t) => t.includes('leprosy') || t.includes('hansen') || t.includes('sexually_transmitted') || t.includes('sti') },
    { slug: 'infections', name: 'Infections (Bacterial/Fungal/Viral)', match: (t) => t.includes('infection') || t.includes('viral') || t.includes('fungal') || t.includes('bacterial') || t.includes('parasitic') },
    { slug: 'papulosquamous', name: 'Papulosquamous Disorders', match: (t) => t.includes('papulosquamous') },
    { slug: 'vesiculobullous', name: 'Vesiculobullous Diseases', match: (t) => t.includes('bullous') },
    { slug: 'pigmentary-appendages', name: 'Pigmentary & Hair/Nail Disorders', match: (t) => t.includes('pigmentary') || t.includes('appendages') },
    { slug: 'drug-reactions-tumors', name: 'Drug Reactions, Geno & Tumors', match: (t) => t.includes('drug') || t.includes('genodermatoses') || t.includes('rheumatology') || t.includes('tumor') || t.includes('tumour') },
  ],
  'deck-forensic': [
    { slug: 'traumatology', name: 'Traumatology & Mechanical Injuries', match: (t) => t.includes('traumatology') || t.includes('mechanicalinjuries') || t.includes('abrasion') || t.includes('contusion') || t.includes('laceration') || t.includes('incision') || t.includes('stabwound') || t.includes('chopwound') || t.includes('skullfracture') || t.includes('braininjury') || t.includes('burns') || t.includes('thermal') || t.includes('electrocution') || t.includes('lightning') || t.includes('blastinjury') },
    { slug: 'toxicology', name: 'Toxicology & Poisoning', match: (t) => t.includes('toxicology') || t.includes('snakevenom') || t.includes('poison') },
    { slug: 'ballistics', name: 'Forensic Ballistics', match: (t) => t.includes('ballistics') || t.includes('ammunition') || t.includes('gunranges') || t.includes('entrywound') || t.includes('contactshot') || t.includes('shotgun') || t.includes('gsr') },
    { slug: 'asphyxia', name: 'Asphyxial Deaths & Drowning', match: (t) => t.includes('asphyxia') || t.includes('hanging') || t.includes('drowning') || t.includes('strangulation') },
    { slug: 'thanatology-autopsy', name: 'Thanatology, Autopsy & Putrefaction', match: (t) => t.includes('thanatology') || t.includes('autopsy') || t.includes('putrefaction') },
    { slug: 'identification', name: 'Identification, Ossification & Trace Evidence', match: (t) => t.includes('identification') || t.includes('ossification') || t.includes('traceevidence') || t.includes('fingerprinting') },
    { slug: 'jurisprudence', name: 'Jurisprudence, BNS & Sexual Offences', match: (t) => t.includes('jurisprudence') || t.includes('legalsystem') || t.includes('bns') || t.includes('sexualjurisprudence') },
  ],
};

function buildSubDecks(
  rawList: RawCardWithTags[],
  typedCards: Flashcard[],
  deckId: string
): SubDeckInfo[] {
  const rules = SUBJECT_TOPIC_RULES[deckId] || [];
  const buckets = new Map<string, { name: string; cards: Flashcard[] }>();

  rules.forEach((r) => {
    buckets.set(r.slug, { name: r.name, cards: [] });
  });
  buckets.set('misc', { name: 'General & Miscellaneous', cards: [] });

  rawList.forEach((raw, idx) => {
    const card = typedCards[idx];
    const tagStr = (raw.tags || []).join(' ').toLowerCase();
    const textStr = `${raw.question || ''} ${raw.answer || ''}`.toLowerCase();

    let matchedSlug = 'misc';
    for (const rule of rules) {
      if (rule.match(tagStr, textStr)) {
        matchedSlug = rule.slug;
        break;
      }
    }

    buckets.get(matchedSlug)!.cards.push(card);
  });

  const result: SubDeckInfo[] = [];
  buckets.forEach((val, slug) => {
    if (val.cards.length > 0) {
      result.push({
        id: `${deckId}::${slug}`,
        parentId: deckId,
        name: val.name,
        cardCount: val.cards.length,
        cards: val.cards,
      });
    }
  });

  return result;
}

function createDeckInfo(
  id: string,
  subject: string,
  year: MBBSYear,
  rawList: RawCardWithTags[]
): RealDeckInfo {
  const cards = formatRawCards(rawList, id);
  const subDecks = buildSubDecks(rawList, cards, id);
  return {
    id,
    subject,
    name: subject,
    year,
    cardCount: cards.length,
    prefix: '+ ',
    cards,
    subDecks,
  };
}

export const REAL_DECKS: Record<string, RealDeckInfo> = {
  'deck-pharmacology': createDeckInfo('deck-pharmacology', 'Pharmacology', '2nd Prof', pharmacologyCardsRaw as RawCardWithTags[]),
  'deck-microbiology': createDeckInfo('deck-microbiology', 'Microbiology', '2nd Prof', microbiologyCardsRaw as RawCardWithTags[]),
  'deck-anatomy': createDeckInfo('deck-anatomy', 'Anatomy', '1st Prof', anatomyCardsRaw as RawCardWithTags[]),
  'deck-physiology': createDeckInfo('deck-physiology', 'Physiology', '1st Prof', physiologyCardsRaw as RawCardWithTags[]),
  'deck-biochemistry': createDeckInfo('deck-biochemistry', 'Biochemistry', '1st Prof', biochemistryCardsRaw as RawCardWithTags[]),
  'deck-forensic': createDeckInfo('deck-forensic', 'Forensic Medicine', '3rd Prof Part 1', forensicCardsRaw as RawCardWithTags[]),
  'deck-orthopedics': createDeckInfo('deck-orthopedics', 'Orthopedics', 'Final Prof', orthopedicsCardsRaw as RawCardWithTags[]),
  'deck-dermatology': createDeckInfo('deck-dermatology', 'Dermatology', 'Final Prof', dermatologyCardsRaw as RawCardWithTags[]),
};

// Grouped by MBBS Year for Browse Decks drill-down
export const REAL_DECKS_BY_YEAR: Record<MBBSYear, RealDeckInfo[]> = {
  '1st Prof': [REAL_DECKS['deck-anatomy'], REAL_DECKS['deck-physiology'], REAL_DECKS['deck-biochemistry']],
  '2nd Prof': [REAL_DECKS['deck-pharmacology'], REAL_DECKS['deck-microbiology']],
  '3rd Prof Part 1': [REAL_DECKS['deck-forensic']],
  'Final Prof': [REAL_DECKS['deck-orthopedics'], REAL_DECKS['deck-dermatology']],
};

// Total Cards across all imported real decks
export const TOTAL_REAL_CARDS = Object.values(REAL_DECKS).reduce(
  (acc, d) => acc + d.cardCount,
  0
);

/**
 * Helper to resolve either a parent deck ('deck-pharmacology') or a sub-deck ('deck-pharmacology::ans')
 */
export function resolveDeckOrSubDeck(deckOrSubId: string): {
  parentDeck: RealDeckInfo | null;
  subDeck: SubDeckInfo | null;
  cards: Flashcard[];
} {
  if (deckOrSubId.includes('::')) {
    const [parentId] = deckOrSubId.split('::');
    const parentDeck = REAL_DECKS[parentId] || null;
    if (!parentDeck) return { parentDeck: null, subDeck: null, cards: [] };
    const subDeck = parentDeck.subDecks.find((s) => s.id === deckOrSubId) || null;
    return { parentDeck, subDeck, cards: subDeck ? subDeck.cards : [] };
  }
  const parentDeck = REAL_DECKS[deckOrSubId] || null;
  return { parentDeck, subDeck: null, cards: parentDeck ? parentDeck.cards : [] };
}
