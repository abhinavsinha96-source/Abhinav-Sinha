export interface GenderOption {
  id: string;
  label: string;
  category:
    | 'cultural_indigenous'
    | 'non_binary'
    | 'transgender'
    | 'fluid_flux'
    | 'binary_cis'
    | 'intersex'
    | 'custom';
  categoryLabel: string;
  culturalOrigin: string;
  description: string;
  keywords: string[];
}

export const GENDER_CATEGORIES = [
  { id: 'all', label: 'All Worldwide Genders' },
  { id: 'cultural_indigenous', label: 'Cultural & Indigenous Traditions' },
  { id: 'non_binary', label: 'Non-Binary & Genderqueer' },
  { id: 'transgender', label: 'Transgender & Expansive' },
  { id: 'fluid_flux', label: 'Genderfluid & Flux' },
  { id: 'binary_cis', label: 'Binary & Cisgender' },
  { id: 'intersex', label: 'Intersex' },
  { id: 'custom', label: 'Self-Described / Custom' }
] as const;

export const WORLDWIDE_GENDERS: GenderOption[] = [
  // --- Cultural & Indigenous Worldwide Traditions ---
  {
    id: 'two_spirit',
    label: 'Two-Spirit (Niizh Manidoowag)',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Indigenous North America / First Nations',
    description: 'A pan-Indigenous umbrella and sacred concept honoring individuals who embody both masculine and feminine spirits, traditionally holding ceremonial, leadership, and mediation roles.',
    keywords: ['two-spirit', 'two spirit', 'indigenous', 'first nations', 'native american', 'sacred', 'tradition']
  },
  {
    id: 'hijra_kinnar',
    label: 'Hijra / Kinnar / Aravani',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'South Asia (India, Pakistan, Bangladesh, Nepal)',
    description: 'Legally recognized third gender community with ancient historical roots across South Asia, often living in guru-chela kinship lineages and conferring traditional spiritual blessings.',
    keywords: ['hijra', 'kinnar', 'aravani', 'khwaja sira', 'south asia', 'india', 'pakistan', 'third gender']
  },
  {
    id: 'muxe',
    label: 'Muxe / Muxhe',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Zapotec (Isthmus of Tehuantepec, Oaxaca, Mexico)',
    description: 'An integral third gender recognized in Zapotec indigenous culture: individuals assigned male at birth who embody feminine social, artistic, family, and spiritual roles.',
    keywords: ['muxe', 'muxhe', 'zapotec', 'oaxaca', 'mexico', 'third gender', 'tehuantepec']
  },
  {
    id: 'faafafine',
    label: "Fa'afafine",
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Samoa & Polynesian Diaspora',
    description: 'Traditional third-gender identity in Samoan society ("in the manner of a woman"), assigned male at birth, recognized as valued contributors to communal and family life.',
    keywords: ["fa'afafine", 'faafafine', 'samoa', 'polynesia', 'pacific islands', 'third gender']
  },
  {
    id: 'faafatama',
    label: "Fa'afatama",
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Samoa & Polynesian Diaspora',
    description: 'Traditional gender identity in Samoa for individuals assigned female at birth who live and express themselves in the manner of a man.',
    keywords: ["fa'afatama", 'faafatama', 'samoa', 'polynesia', 'pacific islands']
  },
  {
    id: 'fakaleiti',
    label: 'Fakaleiti / Leiti',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Tonga & Polynesian Diaspora',
    description: 'Tongan cultural gender identity for individuals assigned male at birth who express feminine traits and social responsibilities.',
    keywords: ['fakaleiti', 'leiti', 'tonga', 'polynesia', 'pacific']
  },
  {
    id: 'mahu',
    label: 'Māhū',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Hawaii & Tahiti (French Polynesia)',
    description: 'Sacred traditional third gender in Kanaka Maoli (Hawaiian) and Tahitian culture who embody both male and female spirit, renowned as keepers of hula, chants, and cultural lineage.',
    keywords: ['mahu', 'māhū', 'hawaii', 'tahiti', 'polynesian', 'kanaka maoli', 'sacred']
  },
  {
    id: 'vakasalewalewa',
    label: 'Vakasalewalewa',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Fiji & Melanesia',
    description: 'Traditional Fijian cultural identity for individuals assigned male at birth who live and express themselves according to feminine customs.',
    keywords: ['vakasalewalewa', 'fiji', 'melanesia', 'pacific']
  },
  {
    id: 'palopa',
    label: 'Palopa',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Papua New Guinea',
    description: 'Traditional cultural gender identity in Papua New Guinea for individuals expressing feminine gender roles outside the colonial binary.',
    keywords: ['palopa', 'papua new guinea', 'melanesia']
  },
  {
    id: 'akavaine',
    label: "Akava'ine",
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Cook Islands (Māori)',
    description: "Traditional Cook Islands Māori gender role for individuals assigned male at birth who express themselves in the customary woman's manner.",
    keywords: ["akava'ine", 'akavaine', 'cook islands', 'maori', 'polynesian']
  },
  {
    id: 'bissu',
    label: 'Bissu (Bugis Sacred Gender)',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Bugis Culture (South Sulawesi, Indonesia)',
    description: 'The sacred and revered fifth gender in the Bugis cosmology: spiritual priests who transcend and encompass all gender spectrums, mediating between humanity and the divine.',
    keywords: ['bissu', 'bugis', 'indonesia', 'sulawesi', 'five genders', 'spiritual', 'priest']
  },
  {
    id: 'calabai',
    label: 'Calabai (Bugis Gender)',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Bugis Culture (South Sulawesi, Indonesia)',
    description: 'One of five genders recognized by the Bugis people: assigned male at birth who adopt the dress, social role, and cultural functions of women (often organizing weddings).',
    keywords: ['calabai', 'bugis', 'indonesia', 'sulawesi']
  },
  {
    id: 'calalai',
    label: 'Calalai (Bugis Gender)',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Bugis Culture (South Sulawesi, Indonesia)',
    description: 'One of five genders recognized by the Bugis people: assigned female at birth who adopt masculine roles, work, and social expression.',
    keywords: ['calalai', 'bugis', 'indonesia', 'sulawesi']
  },
  {
    id: 'waria',
    label: 'Waria',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Indonesia',
    description: 'Indonesian third-gender identity (portmanteau of "wanita"/woman and "pria"/man) with deep historical cultural presence across the archipelago.',
    keywords: ['waria', 'indonesia', 'southeast asia', 'third gender']
  },
  {
    id: 'kathoey',
    label: 'Kathoey / Phuying Kham Phet',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Thailand',
    description: 'Recognized cultural third gender identity in Thailand encompassing transgender women and people with feminine gender expression.',
    keywords: ['kathoey', 'thailand', 'thai', 'ladyboy', 'third gender']
  },
  {
    id: 'bakla',
    label: 'Bakla',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Philippines',
    description: 'Culturally rooted Filipino gender identity encompassing individuals assigned male at birth who express feminine qualities, mannerisms, or romantic orientation.',
    keywords: ['bakla', 'philippines', 'filipino', 'tagalog']
  },
  {
    id: 'babaylan',
    label: 'Babaylan / Katalonan',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Indigenous Philippines',
    description: 'Pre-colonial Indigenous Philippine spiritual leaders, shamans, and healers who were often women or gender-expansive individuals (asog/bayok) transcending standard binaries.',
    keywords: ['babaylan', 'katalonan', 'asog', 'bayok', 'philippines', 'spiritual', 'indigenous']
  },
  {
    id: 'brotherboy',
    label: 'Brotherboy',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Aboriginal & Torres Strait Islander (Australia)',
    description: 'Cultural identity term used by Indigenous Australian Aboriginal and Torres Strait Islander communities for transgender and gender-diverse individuals with a masculine spirit.',
    keywords: ['brotherboy', 'aboriginal', 'torres strait', 'australia', 'indigenous', 'transmasculine']
  },
  {
    id: 'sistergirl',
    label: 'Sistergirl',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Aboriginal & Torres Strait Islander (Australia)',
    description: 'Cultural identity term used by Indigenous Australian Aboriginal and Torres Strait Islander communities for transgender and gender-diverse individuals with a feminine spirit.',
    keywords: ['sistergirl', 'aboriginal', 'torres strait', 'australia', 'indigenous', 'transfeminine']
  },
  {
    id: 'burrnesha',
    label: 'Burrnesha (Sworn Virgin)',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Balkans (Northern Albania, Kosovo, Montenegro)',
    description: 'A traditional social status in the Kanun tradition where women take a lifelong vow of celibacy and live as men with all male privileges, attire, and community responsibilities.',
    keywords: ['burrnesha', 'sworn virgin', 'albania', 'balkans', 'kanun', 'tradition']
  },
  {
    id: 'xanith',
    label: 'Xanith / Khanith',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Oman & Arabian Peninsula',
    description: 'Traditional cultural gender category recognized in Omani society for individuals assigned male who hold a distinct intermediate gender status with feminine speech and social roles.',
    keywords: ['xanith', 'khanith', 'oman', 'arabia', 'middle east']
  },
  {
    id: 'femminiello',
    label: "'O Femminiello",
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Naples & Southern Italy',
    description: 'Centuries-old cultural gender identity in Neapolitan tradition: individuals assigned male who live expressively as women, celebrated as bringers of good fortune (buona sorte).',
    keywords: ['femminiello', 'naples', 'italy', 'neapolitan', 'mediterranean', 'third gender']
  },
  {
    id: 'sipiniq',
    label: 'Sipiniq',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Inuit (Arctic / Nunavut / Greenland)',
    description: 'Traditional Inuit cultural understanding where a baby born with the physical sex of one gender is recognized as having transformed from the opposite gender, raised in their spiritual ancestor identity.',
    keywords: ['sipiniq', 'inuit', 'arctic', 'nunavut', 'greenland', 'ancestor']
  },
  {
    id: 'winkte',
    label: 'Wíŋkte',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Lakota / Dakota / Nakota Nation',
    description: 'Traditional sacred Lakota designation ("wants to be like a woman") for male-bodied individuals who embody female social and spiritual powers, honoring them as namers and prophets.',
    keywords: ['winkte', 'wíŋkte', 'lakota', 'sioux', 'two-spirit', 'sacred']
  },
  {
    id: 'nadleehi',
    label: 'Nádleehí',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Navajo / Diné Nation',
    description: 'Diné traditional multi-gender identity ("one who is transformed" or "one who changes constantly"), revering individuals who harmoniously bridge male and female roles.',
    keywords: ['nadleehi', 'nádleehí', 'navajo', 'dine', 'two-spirit', 'southwest']
  },
  {
    id: 'dilbaa',
    label: 'Dilbaa',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Navajo / Diné Nation',
    description: 'Diné traditional identity for individuals assigned female at birth who take on masculine warrior, leadership, and craft roles.',
    keywords: ['dilbaa', 'navajo', 'dine', 'two-spirit']
  },
  {
    id: 'lhamana',
    label: 'Lhamana',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Zuni Pueblo (New Mexico)',
    description: 'Traditional Zuni Pueblo cultural role where male-bodied people assume the sacred dress, weaving, pottery, and ceremonial responsibilities of women alongside male pursuits.',
    keywords: ['lhamana', 'zuni', 'pueblo', 'new mexico', 'two-spirit', 'wehwa']
  },
  {
    id: 'sekrata',
    label: 'Sekrata',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Antandroy & Hova (Madagascar)',
    description: 'Traditional Malagasy cultural identity where individuals assigned male are raised and recognized as women through ancestral signs and spiritual destiny.',
    keywords: ['sekrata', 'madagascar', 'malagasy', 'africa']
  },
  {
    id: 'ashtime',
    label: 'Ashtime',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Maale People (Southern Ethiopia)',
    description: 'Traditional cultural gender designation among the Maale people of Ethiopia for individuals who perform gender roles different from their assigned sex.',
    keywords: ['ashtime', 'ethiopia', 'africa', 'maale']
  },
  {
    id: 'chibados',
    label: 'Chibados / Quimbanda',
    category: 'cultural_indigenous',
    categoryLabel: 'Cultural & Indigenous Traditions',
    culturalOrigin: 'Kingdom of Ndongo & Kongo (Historical Angola)',
    description: 'Historical spiritual third-gender leaders in Central Africa who wore women’s garments and guided sacred rituals and diplomatic negotiations.',
    keywords: ['chibados', 'quimbanda', 'angola', 'kongo', 'africa', 'historical']
  },

  // --- Non-Binary & Genderqueer Spectrum ---
  {
    id: 'non_binary',
    label: 'Non-Binary (Enby)',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'An umbrella term and standalone identity for genders that do not fit neatly into the binary categories of male or female, existing outside or between them.',
    keywords: ['non-binary', 'nonbinary', 'enby', 'genderqueer', 'neither', 'both']
  },
  {
    id: 'genderqueer',
    label: 'Genderqueer',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'An identity that rejects conventional gender distinctions and binaries, embracing non-normative gender expression and fluidity.',
    keywords: ['genderqueer', 'queer', 'non-binary', 'radical']
  },
  {
    id: 'agender',
    label: 'Agender (Genderless)',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Identifying as having no gender, feeling gender-neutral, or being completely uninvolved with the concept of gender.',
    keywords: ['agender', 'genderless', 'neutral', 'null', 'no gender']
  },
  {
    id: 'bigender',
    label: 'Bigender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Experiencing two distinct gender identities, either at the same time or shifting between them depending on the context.',
    keywords: ['bigender', 'two genders', 'dual', 'dual gender']
  },
  {
    id: 'pangender',
    label: 'Pangender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Experiencing all or many gender identities across the spectrum, feeling that one’s gender is expansive and non-limiting.',
    keywords: ['pangender', 'all genders', 'multitude', 'omnigender']
  },
  {
    id: 'androgynous',
    label: 'Androgyne / Androgynous',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'An identity embodying a blend or balance of both masculine and feminine aspects, or existing in an intermediate space.',
    keywords: ['androgyne', 'androgynous', 'blend', 'balanced']
  },
  {
    id: 'neutrois',
    label: 'Neutrois',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'A non-binary gender identity characterized by a strong feeling of having a neutral gender (neither male, female, nor mixed).',
    keywords: ['neutrois', 'neutral', 'null', 'zero']
  },
  {
    id: 'maverique',
    label: 'Maverique',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'An autonomous, distinct non-binary gender identity that is entirely independent of maleness, femaleness, neutrality, or absence of gender.',
    keywords: ['maverique', 'independent', 'autonomous', 'unique']
  },
  {
    id: 'polygender',
    label: 'Polygender / Multigender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Experiencing multiple distinct genders, whether simultaneously, sequentially, or overlapping in varying intensities.',
    keywords: ['polygender', 'multigender', 'multiple', 'several']
  },
  {
    id: 'omnigender',
    label: 'Omnigender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'An expansive gender identity encompassing every gender within the bounds of what the individual can culturally experience.',
    keywords: ['omnigender', 'universal', 'all']
  },
  {
    id: 'trigender',
    label: 'Trigender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Experiencing three distinct gender identities, either simultaneously or fluctuating between them.',
    keywords: ['trigender', 'three genders', 'triple']
  },
  {
    id: 'aporagender',
    label: 'Aporagender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'A non-binary gender identity where one experiences a clear, definite gender feeling that is separate and different from male, female, or neutrality.',
    keywords: ['aporagender', 'distinct', 'different']
  },
  {
    id: 'epicene',
    label: 'Epicene',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Possessing characteristics of both sexes or neither; neutral, common, or transcending gender categorization.',
    keywords: ['epicene', 'common', 'classical', 'historical']
  },
  {
    id: 'xenogender',
    label: 'Xenogender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'A form of non-binary gender identity best described through concepts, aesthetics, elements of nature, or metaphors outside standard human constructs.',
    keywords: ['xenogender', 'metaphor', 'aesthetic', 'concept']
  },
  {
    id: 'neurogender',
    label: 'Neurogender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'A gender identity that is deeply intertwined with, informed by, or inseparable from one’s neurodivergence.',
    keywords: ['neurogender', 'neurodivergent', 'autistic', 'adhd', 'mind']
  },
  {
    id: 'gnc',
    label: 'Gender Non-Conforming (GNC)',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Expressing gender characteristics, appearances, or behaviors that diverge from societal expectations associated with assigned gender.',
    keywords: ['gnc', 'gender non-conforming', 'nonconforming', 'expression']
  },
  {
    id: 'questioning',
    label: 'Gender Questioning / Exploring',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Actively discovering, reflecting upon, and exploring one’s gender identity in an open, evolving journey.',
    keywords: ['questioning', 'exploring', 'discovering', 'curious', 'journey']
  },

  // --- Demigender & Expansive Spectrum ---
  {
    id: 'demigirl',
    label: 'Demigirl / Demifemale',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Partially identifying with womanhood or femininity, alongside other gender experiences or neutrality, regardless of assigned sex.',
    keywords: ['demigirl', 'demifemale', 'partially female', 'demi']
  },
  {
    id: 'demiboy',
    label: 'Demiboy / Demimale',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Partially identifying with manhood or masculinity, alongside other gender experiences or neutrality, regardless of assigned sex.',
    keywords: ['demiboy', 'demimale', 'partially male', 'demi']
  },
  {
    id: 'demigender',
    label: 'Demigender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Partially identifying with a particular gender, while the other portion may be agender, fluid, or another identity.',
    keywords: ['demigender', 'partial', 'fraction']
  },
  {
    id: 'libragender',
    label: 'Libragender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Feeling predominantly agender (around 50–90%), but with a subtle or faint connection to another gender identity.',
    keywords: ['libragender', 'librafeminine', 'libramasculine', 'faint']
  },
  {
    id: 'graygender',
    label: 'Graygender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Experiencing an ambivalent, subtle, or indifferent attachment to having a gender identity.',
    keywords: ['graygender', 'greygender', 'indifferent', 'subtle']
  },
  {
    id: 'cassgender',
    label: 'Cassgender',
    category: 'non_binary',
    categoryLabel: 'Non-Binary & Genderqueer',
    culturalOrigin: 'Global',
    description: 'Feeling that one’s gender identity is unimportant, irrelevant, or not a meaningful factor in who they are.',
    keywords: ['cassgender', 'irrelevant', 'unimportant']
  },

  // --- Genderfluid & Flux ---
  {
    id: 'genderfluid',
    label: 'Genderfluid',
    category: 'fluid_flux',
    categoryLabel: 'Genderfluid & Flux',
    culturalOrigin: 'Global',
    description: 'An identity where gender shifts and fluctuates over time across different points on the spectrum or between multiple identities.',
    keywords: ['genderfluid', 'fluid', 'shifting', 'dynamic', 'flowing']
  },
  {
    id: 'genderflux',
    label: 'Genderflux',
    category: 'fluid_flux',
    categoryLabel: 'Genderfluid & Flux',
    culturalOrigin: 'Global',
    description: 'An identity where the perceived intensity of one’s gender fluctuates over time, ranging from 0% (agender) to 100% full intensity.',
    keywords: ['genderflux', 'flux', 'intensity', 'fluctuating']
  },
  {
    id: 'agenderflux',
    label: 'Agenderflux',
    category: 'fluid_flux',
    categoryLabel: 'Genderfluid & Flux',
    culturalOrigin: 'Global',
    description: 'Predominantly agender, but with fluctuating waves of connection to another gender that rise and fade.',
    keywords: ['agenderflux', 'flux', 'agender', 'fluctuating']
  },
  {
    id: 'boyflux',
    label: 'Boyflux / Manflux',
    category: 'fluid_flux',
    categoryLabel: 'Genderfluid & Flux',
    culturalOrigin: 'Global',
    description: 'An identity where feelings of masculinity fluctuate in strength, from fully masculine to demiboy, agender, or other states.',
    keywords: ['boyflux', 'manflux', 'masculine flux', 'intensity']
  },
  {
    id: 'girlflux',
    label: 'Girlflux / Womanflux',
    category: 'fluid_flux',
    categoryLabel: 'Genderfluid & Flux',
    culturalOrigin: 'Global',
    description: 'An identity where feelings of femininity fluctuate in strength, from fully feminine to demigirl, agender, or other states.',
    keywords: ['girlflux', 'womanflux', 'feminine flux', 'intensity']
  },
  {
    id: 'fluidflux',
    label: 'Fluidflux',
    category: 'fluid_flux',
    categoryLabel: 'Genderfluid & Flux',
    culturalOrigin: 'Global',
    description: 'A combination of genderfluid and genderflux: both the identity of the gender and its intensity vary across time.',
    keywords: ['fluidflux', 'fluid', 'flux', 'double dynamic']
  },
  {
    id: 'novigender',
    label: 'Novigender',
    category: 'fluid_flux',
    categoryLabel: 'Genderfluid & Flux',
    culturalOrigin: 'Global',
    description: 'A gender experience so intricate, complex, or elusive that it defies simple categorizations or fixed labels.',
    keywords: ['novigender', 'complex', 'elusive', 'intricate']
  },

  // --- Transgender & Gender-Expansive ---
  {
    id: 'transgender',
    label: 'Transgender',
    category: 'transgender',
    categoryLabel: 'Transgender & Expansive',
    culturalOrigin: 'Global',
    description: 'An umbrella and personal identity for individuals whose gender identity differs from the sex assigned to them at birth.',
    keywords: ['transgender', 'trans', 'transition', 'expansive']
  },
  {
    id: 'transgender_woman',
    label: 'Transgender Woman (Trans Woman)',
    category: 'transgender',
    categoryLabel: 'Transgender & Expansive',
    culturalOrigin: 'Global',
    description: 'A woman who was assigned male at birth and whose true identity is a woman.',
    keywords: ['transgender woman', 'trans woman', 'mtf', 'female', 'woman']
  },
  {
    id: 'transgender_man',
    label: 'Transgender Man (Trans Man)',
    category: 'transgender',
    categoryLabel: 'Transgender & Expansive',
    culturalOrigin: 'Global',
    description: 'A man who was assigned female at birth and whose true identity is a man.',
    keywords: ['transgender man', 'trans man', 'ftm', 'male', 'man']
  },
  {
    id: 'transfeminine',
    label: 'Transfeminine (Transfem)',
    category: 'transgender',
    categoryLabel: 'Transgender & Expansive',
    culturalOrigin: 'Global',
    description: 'A person assigned male at birth whose gender identity or expression aligns predominantly with femininity, whether binary woman or non-binary.',
    keywords: ['transfeminine', 'transfem', 'feminine alignment']
  },
  {
    id: 'transmasculine',
    label: 'Transmasculine (Transmasc)',
    category: 'transgender',
    categoryLabel: 'Transgender & Expansive',
    culturalOrigin: 'Global',
    description: 'A person assigned female at birth whose gender identity or expression aligns predominantly with masculinity, whether binary man or non-binary.',
    keywords: ['transmasculine', 'transmasc', 'masculine alignment']
  },

  // --- Intersex Spectrum ---
  {
    id: 'intersex',
    label: 'Intersex',
    category: 'intersex',
    categoryLabel: 'Intersex',
    culturalOrigin: 'Global',
    description: 'Born with reproductive, chromosomal, or sexual anatomy that naturally differs from typical binary definitions of male or female.',
    keywords: ['intersex', 'variation', 'chromosomal', 'innate']
  },
  {
    id: 'intersex_woman',
    label: 'Intersex Woman',
    category: 'intersex',
    categoryLabel: 'Intersex',
    culturalOrigin: 'Global',
    description: 'An individual with innate intersex variations who identifies as a woman.',
    keywords: ['intersex woman', 'intersex female']
  },
  {
    id: 'intersex_man',
    label: 'Intersex Man',
    category: 'intersex',
    categoryLabel: 'Intersex',
    culturalOrigin: 'Global',
    description: 'An individual with innate intersex variations who identifies as a man.',
    keywords: ['intersex man', 'intersex male']
  },
  {
    id: 'intersex_non_binary',
    label: 'Intersex Non-Binary',
    category: 'intersex',
    categoryLabel: 'Intersex',
    culturalOrigin: 'Global',
    description: 'An individual with innate intersex variations who identifies as non-binary or outside the gender binary.',
    keywords: ['intersex non-binary', 'intersex enby']
  },

  // --- Binary & Cisgender ---
  {
    id: 'woman',
    label: 'Woman / Female',
    category: 'binary_cis',
    categoryLabel: 'Binary & Cisgender',
    culturalOrigin: 'Global',
    description: 'Identifying as a woman or female.',
    keywords: ['woman', 'female', 'girl', 'feminine', 'binary']
  },
  {
    id: 'man',
    label: 'Man / Male',
    category: 'binary_cis',
    categoryLabel: 'Binary & Cisgender',
    culturalOrigin: 'Global',
    description: 'Identifying as a man or male.',
    keywords: ['man', 'male', 'boy', 'masculine', 'binary']
  },
  {
    id: 'cisgender_woman',
    label: 'Cisgender Woman',
    category: 'binary_cis',
    categoryLabel: 'Binary & Cisgender',
    culturalOrigin: 'Global',
    description: 'A woman whose gender identity aligns with the female sex assigned to her at birth.',
    keywords: ['cisgender woman', 'cis woman', 'cis female', 'cisgender']
  },
  {
    id: 'cisgender_man',
    label: 'Cisgender Man',
    category: 'binary_cis',
    categoryLabel: 'Binary & Cisgender',
    culturalOrigin: 'Global',
    description: 'A man whose gender identity aligns with the male sex assigned to him at birth.',
    keywords: ['cisgender man', 'cis man', 'cis male', 'cisgender']
  },

  // --- Self-Described & Privacy Options ---
  {
    id: 'self_described',
    label: 'Self-Described / Custom Identity',
    category: 'custom',
    categoryLabel: 'Self-Described / Custom',
    culturalOrigin: 'Personal Custom Entry',
    description: 'Specify your own custom personal gender identity and cultural expression in your own words.',
    keywords: ['custom', 'self-described', 'own words', 'personal', 'other']
  },
  {
    id: 'prefer_not_to_say',
    label: 'Prefer Not to Say / Private',
    category: 'custom',
    categoryLabel: 'Self-Described / Custom',
    culturalOrigin: 'Confidential',
    description: 'Choose to keep your gender identity private, unstated, or undisclosed.',
    keywords: ['prefer not to say', 'private', 'undisclosed', 'confidential', 'none']
  }
];

export const COMMON_PRONOUNS: string[] = [
  'they/them',
  'she/her',
  'he/him',
  'she/they',
  'he/they',
  'they/she/he (any pronouns)',
  'ze/zir',
  'fae/faer',
  'ey/em',
  'xe/xem',
  'it/its',
  'Use name only',
  'Ask me my pronouns'
];

/**
 * Helper to find a gender in the worldwide database by id or label
 */
export function findGenderByIdOrLabel(query: string | undefined): GenderOption | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return WORLDWIDE_GENDERS.find(
    g => g.id.toLowerCase() === q || g.label.toLowerCase() === q || g.label.toLowerCase().includes(q)
  );
}
