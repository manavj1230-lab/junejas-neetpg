-- Seed Decks & Flashcards for NEET PG Platform (12 High-Yield Cards across MBBS Years)

-- 1. Insert Decks
INSERT INTO public.decks (id, mbbs_year, subject, topic, card_count) VALUES
('11111111-1111-1111-1111-111111111111', '1st Prof', 'Anatomy', 'Upper Limb & Brachial Plexus', 3),
('22222222-2222-2222-2222-222222222222', '2nd Prof', 'Pathology', 'Hematology & Lymphoreticular', 3),
('33333333-3333-3333-3333-333333333333', '3rd Prof Part 1', 'Community Medicine (PSM)', 'Epidemiology & Immunization', 3),
('44444444-4444-4444-4444-444444444444', 'Final Prof', 'General Surgery', 'Hernias & Acute Abdomen', 3)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Flashcards for 1st Prof (Anatomy)
INSERT INTO public.flashcards (deck_id, question, answer, explanation, clinical_pearl, image_path) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'A 24-year-old following a motorcycle collision presents with inability to abduct the arm past 15° and loss of sensation over the lateral shoulder badge area. X-ray demonstrates a fracture through which part of the humerus?',
    'Surgical neck of the humerus (Axillary nerve injury)',
    'The axillary nerve (C5, C6) winds tightly around the surgical neck of the humerus alongside the posterior circumflex humeral artery within the quadrangular space. Fractures here cause paralysis of the deltoid and teres minor, accompanied by cutaneous anesthesia over the upper lateral cutaneous nerve of the arm (sergeant’s patch).',
    'Key Humeral Nerve Associations: 1. Surgical Neck: Axillary N. 2. Mid-shaft (Radial groove): Radial N. 3. Supracondylar: Median N. (AIN) 4. Medial Epicondyle: Ulnar N.',
    NULL
),
(
    '11111111-1111-1111-1111-111111111111',
    'Which anatomical location is the most common site of fracture of the clavicle, and which muscle displaces the medial fragment superiorly?',
    'Junction of medial two-thirds and lateral one-third; Sternocleidomastoid muscle',
    'The junction between the medial 2/3 (curved convex forward) and lateral 1/3 (concave forward) is the weakest transition point of the clavicle. The sternocleidomastoid pulls the medial fragment upward, while the weight of the arm and pectoralis major pull the lateral fragment downward and medially.',
    'The clavicle is the only long bone horizontally placed, the first to ossify (in membrane), and has two primary ossification centers.',
    NULL
),
(
    '11111111-1111-1111-1111-111111111111',
    'Which four muscles comprise the rotator cuff (SITS), and which single muscle inserts onto the lesser tubercle of the humerus?',
    'Supraspinatus, Infraspinatus, Teres minor, and Subscapularis; Subscapularis inserts on the lesser tubercle.',
    'Remember "SIT" (Supraspinatus, Infraspinatus, Teres minor) insert on the Greater Tubercle from superior to inferior facet. Subscapularis is the only anterior rotator cuff muscle and inserts on the Lesser Tubercle, acting as the primary medial rotator.',
    'Supraspinatus is the most frequently torn rotator cuff tendon (responsible for painful arc between 60°–120°).',
    NULL
);

-- 3. Insert Flashcards for 2nd Prof (Pathology)
INSERT INTO public.flashcards (deck_id, question, answer, explanation, clinical_pearl, image_path) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'A 28-year-old male presents with painless cervical lymphadenopathy and night sweats. Biopsy reveals binucleated giant cells with prominent eosinophilic inclusion-like nucleoli surrounded by a clear halo ("owl-eye"). What is the definitive diagnosis and characteristic immunophenotype?',
    'Classical Hodgkin Lymphoma (Reed-Sternberg cells); CD15+ and CD30+ (CD45-)',
    'Reed-Sternberg (RS) cells are malignant B-cell derivatives characteristic of Classical Hodgkin Lymphoma. In classic forms (Nodular Sclerosis, Mixed Cellularity, Lymphocyte Depleted, Lymphocyte Rich), RS cells are classically positive for CD30 and CD15, and typically negative for CD45 and CD20.',
    'Nodular Lymphocyte Predominant Hodgkin Lymphoma (NLPHL) possesses "Popcorn cells" (L&H cells) which are CD20+, CD45+, and CD15-/CD30-.',
    NULL
),
(
    '22222222-2222-2222-2222-222222222222',
    'In a patient presenting with bleeding diathesis and DIC, bone marrow reveals abnormal promyelocytes filled with needle-shaped crystalline cytoplasmic aggregates. What genetic translocation defines this condition?',
    't(15;17)(q24;q21) PML-RARA in Acute Promyelocytic Leukemia (APML / AML M3)',
    'Auer rods are fused lysosomes containing peroxidase-positive granules. Stacks of Auer rods are termed "Faggot cells," characteristic of APML. The t(15;17) translocation creates the PML-RARA fusion protein that blocks promyelocyte differentiation, treated urgently with All-Trans Retinoic Acid (ATRA) and Arsenic Trioxide.',
    'Never delay ATRA administration while awaiting genetic confirmation if APML is suspected, due to high risk of fatal intracranial DIC hemorrhage.',
    NULL
),
(
    '22222222-2222-2222-2222-222222222222',
    'A 50-year-old female presents with massive splenomegaly and marked leukocytosis with left shift (myelocytes, metamyelocytes, basophilia). What chromosomal anomaly and resulting fusion gene product are diagnostic?',
    'Philadelphia chromosome t(9;22)(q34;q11.2) creating the BCR-ABL1 tyrosine kinase fusion',
    'The Philadelphia chromosome translocates the ABL1 proto-oncogene on chromosome 9 to the BCR gene on chromosome 22, resulting in a constitutively active 210 kDa receptor tyrosine kinase that drives unregulated granulocyte proliferation in Chronic Myeloid Leukemia (CML).',
    'Leukocyte Alkaline Phosphatase (LAP) / Neutrophil Alkaline Phosphatase (NAP) score is dramatically LOW or ZERO in CML, distinguishing it from leukemoid reaction (high LAP).',
    NULL
);

-- 4. Insert Flashcards for 3rd Prof Part 1 (PSM)
INSERT INTO public.flashcards (deck_id, question, answer, explanation, clinical_pearl, image_path) VALUES
(
    '33333333-3333-3333-3333-333333333333',
    'In screening test evaluation, how is Sensitivity calculated, and what does a high sensitivity rule out when negative?',
    'Sensitivity = TP / (TP + FN) × 100; High sensitivity rules OUT disease (SnNOut).',
    'Sensitivity is the proportion of truly diseased individuals who test positive. A test with 99% sensitivity has very few false negatives; hence, a negative result with high certainty rules OUT the condition (SnNOut). In contrast, high specificity rules IN (SpPIn).',
    'Screening tests prioritize high Sensitivity (detecting early cases), whereas confirmatory diagnostic tests prioritize high Specificity (avoiding false alarms).',
    NULL
),
(
    '33333333-3333-3333-3333-333333333333',
    'Under the Universal Immunization Programme (UIP), which vaccine is the most heat-sensitive, and at what temperature range is it stored in the deep freezer?',
    'Oral Polio Vaccine (bOPV); Stored at -15°C to -20°C in deep freezers.',
    'The order of heat sensitivity (most to least sensitive): OPV > Measles / MR > BCG > DPT / Pentavalent > TT (Hepatitis B & TT are most heat-stable, but freeze-sensitive). Vaccines stored at sub-zero (-15°C to -20°C) are OPV and Yellow Fever.',
    'Shake Test is conducted to detect freeze-damage in T-series and Hepatitis B vaccines. If sediment settles rapidly, the vaccine has been frozen and MUST be discarded.',
    NULL
),
(
    '33333333-3333-3333-3333-333333333333',
    'What is the epidemiological concept of the "Rule of Halves" in hypertension epidemiology in a community?',
    '1/2 of hypertensive cases are unknown, 1/2 of known are treated, and 1/2 of treated are adequately controlled.',
    'The Rule of Halves illustrates the "iceberg phenomenon" of non-communicable diseases: Only half of hypertensives in a population are diagnosed. Of those diagnosed, only half receive pharmacotherapy. Of those treated, only half achieve target blood pressure control (e.g. < 140/90 mmHg).',
    'The submerged portion of the iceberg represents subclinical, asymptomatic, or undiagnosed disease, which screening aims to detect.',
    NULL
);

-- 5. Insert Flashcards for Final Prof (General Surgery)
INSERT INTO public.flashcards (deck_id, question, answer, explanation, clinical_pearl, image_path) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    'Anatomically, how does an Indirect Inguinal Hernia relate to the inferior epigastric artery, and through which opening does it enter the inguinal canal?',
    'Lies LATERAL to the inferior epigastric artery; enters via the Deep (Internal) Inguinal Ring.',
    'An indirect inguinal hernia passes lateral to the inferior epigastric vessels through the deep inguinal ring inside the patent processus vaginalis, traveling inside the spermatic cord within the internal spermatic fascia. Direct hernias arise MEDIAL to the inferior epigastric vessels through Hesselbach’s triangle.',
    'Internal Ring Occlusion Test (Zieman technique): Occlusion of the deep ring (1.25 cm above midpoint of inguinal ligament) prevents impulse in indirect hernias, but impulse persists in direct hernias.',
    NULL
),
(
    '44444444-4444-4444-4444-444444444444',
    'A 19-year-old male with acute right iliac fossa pain experiences increased pain in the right iliac fossa when the left iliac fossa is deeply palpated and quickly released. Name this clinical sign.',
    'Rovsing’s sign (Pathognomonic for Acute Appendicitis)',
    'Deep palpation of the left lower quadrant pushes retrograde colonic air into the cecum and stretches the inflamed appendix in the right lower quadrant, producing localized peritoneal irritation and tenderness at McBurney’s point.',
    'Other appendicitis signs: Psoas sign (pain on passive hip extension, retrocecal), Obturator sign (pain on internal hip rotation, pelvic appendix), Dunphy sign (increased pain with coughing).',
    NULL
),
(
    '44444444-4444-4444-4444-444444444444',
    'During emergency laparotomy for penetrating liver trauma, digital or clamp occlusion of the hepatoduodenal ligament is performed to control hemorrhage. Name this maneuver and its transmitted structures.',
    'Pringle Maneuver; Clamps the Portal Vein, Proper Hepatic Artery, and Common Bile Duct.',
    'The hepatoduodenal ligament forms the anterior border of the Epiploic Foramen of Winslow. Cross-clamping it cuts off arterial and venous inflow to the liver. If hemorrhage persists despite clamping, the bleeding originates from the hepatic veins or retrohepatic inferior vena cava.',
    'Safe warm ischemia clamping time for a healthy liver under Pringle maneuver is 60 minutes (intermittent clamping 15 mins clamp / 5 mins release).',
    NULL
);
