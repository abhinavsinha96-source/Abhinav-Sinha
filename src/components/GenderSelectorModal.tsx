import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Globe,
  Sparkles,
  Check,
  Heart,
  HelpCircle,
  Eye,
  Users,
  Lock,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import {
  WORLDWIDE_GENDERS,
  GENDER_CATEGORIES,
  COMMON_PRONOUNS,
  GenderOption,
  findGenderByIdOrLabel
} from '../data/genders';

interface GenderSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGender?: string;
  currentPronouns?: string;
  currentVisibility?: 'public' | 'friends_only' | 'private';
  onSave: (data: {
    gender: string;
    pronouns?: string;
    visibility: 'public' | 'friends_only' | 'private';
  }) => void;
}

export const GenderSelectorModal: React.FC<GenderSelectorModalProps> = ({
  isOpen,
  onClose,
  currentGender = '',
  currentPronouns = '',
  currentVisibility = 'public',
  onSave
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGenderId, setSelectedGenderId] = useState<string>(() => {
    const found = findGenderByIdOrLabel(currentGender);
    if (found) return found.id;
    if (currentGender && currentGender !== 'Prefer not to say') return 'self_described';
    if (currentGender === 'Prefer not to say' || currentGender === 'Prefer Not to Say / Private') return 'prefer_not_to_say';
    return '';
  });
  const [customGenderText, setCustomGenderText] = useState<string>(() => {
    const found = findGenderByIdOrLabel(currentGender);
    if (!found && currentGender && currentGender !== 'Prefer not to say') {
      return currentGender;
    }
    return '';
  });
  const [selectedPronouns, setSelectedPronouns] = useState<string>(currentPronouns || '');
  const [customPronounsText, setCustomPronounsText] = useState<string>('');
  const [visibility, setVisibility] = useState<'public' | 'friends_only' | 'private'>(currentVisibility);
  const [activeGenderDetail, setActiveGenderDetail] = useState<GenderOption | null>(null);

  // Sync initial state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const found = findGenderByIdOrLabel(currentGender);
      if (found) {
        setSelectedGenderId(found.id);
        setCustomGenderText('');
      } else if (currentGender && currentGender !== 'Prefer not to say') {
        setSelectedGenderId('self_described');
        setCustomGenderText(currentGender);
      } else if (currentGender === 'Prefer not to say' || currentGender === 'Prefer Not to Say / Private') {
        setSelectedGenderId('prefer_not_to_say');
      } else {
        setSelectedGenderId('');
        setCustomGenderText('');
      }
      setSelectedPronouns(currentPronouns || '');
      setVisibility(currentVisibility || 'public');
    }
  }, [isOpen, currentGender, currentPronouns, currentVisibility]);

  // Filtered genders
  const filteredGenders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return WORLDWIDE_GENDERS.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Query filter
      if (!query) return true;
      const matchLabel = item.label.toLowerCase().includes(query);
      const matchOrigin = item.culturalOrigin.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(query));
      const matchCategory = item.categoryLabel.toLowerCase().includes(query);
      return matchLabel || matchOrigin || matchDesc || matchKeywords || matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleApply = () => {
    let finalGender = '';
    if (selectedGenderId === 'self_described') {
      finalGender = customGenderText.trim() || 'Self-Described Identity';
    } else {
      const match = WORLDWIDE_GENDERS.find(g => g.id === selectedGenderId);
      finalGender = match ? match.label : currentGender || '';
    }

    const finalPronouns = customPronounsText.trim() || selectedPronouns.trim();

    onSave({
      gender: finalGender,
      pronouns: finalPronouns || undefined,
      visibility
    });
    onClose();
  };

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return WORLDWIDE_GENDERS.length;
    return WORLDWIDE_GENDERS.filter(g => g.category === catId).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C0A20]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white/95 dark:bg-[#1E0B24]/95 border border-pink-200/80 dark:border-pink-900/60 rounded-3xl w-full max-w-3xl shadow-2xl shadow-pink-500/10 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-pink-200/80 dark:border-pink-900/60 flex items-center justify-between bg-pink-50/60 dark:bg-[#16081A]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 dark:bg-pink-500/25 text-pink-600 dark:text-pink-300 flex items-center justify-center border border-pink-300/60 dark:border-pink-800/60 shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif-display font-bold text-pink-950 dark:text-white">
                  Worldwide Gender & Identity Directory
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                  🏳️‍🌈 {WORLDWIDE_GENDERS.length} Global Identities
                </span>
              </div>
              <p className="text-xs text-pink-800/70 dark:text-pink-300/70 mt-0.5">
                Honoring global traditions, indigenous cultural heritages, and modern expansive LGBTQIA+ spectrums.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-pink-400 hover:text-pink-700 dark:hover:text-pink-200 hover:bg-pink-100/60 dark:hover:bg-pink-950/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-pink-200/80 dark:border-pink-900/60 space-y-3 bg-white/95 dark:bg-[#1E0B24]/95">
          <div className="relative">
            <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by gender name, cultural origin (e.g. Zapotec, Samoa, Lakota, India), or keyword..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50/70 dark:bg-[#16081A] text-sm text-pink-950 dark:text-white outline-none focus:ring-2 focus:ring-pink-400/40 transition-all placeholder:text-pink-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 dark:hover:text-pink-200 text-xs p-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {GENDER_CATEGORIES.map(cat => {
              const count = getCategoryCount(cat.id);
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full shrink-0 font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs shadow-pink-500/20'
                      : 'bg-pink-50 dark:bg-[#16081A] text-pink-800 dark:text-pink-300 border border-pink-200/80 dark:border-pink-900/60 hover:bg-pink-100 dark:hover:bg-pink-950/60'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area: Scrollable Gender List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredGenders.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Globe className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No matching gender identities found for "{searchQuery}"
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Haven honors all identities. You can choose "Self-Described / Custom Identity" below to define your own identity freely.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedGenderId('self_described');
                  setCustomGenderText(searchQuery);
                  setSearchQuery('');
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> Use "{searchQuery}" as Custom Identity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredGenders.map(gender => {
                const isSelected = selectedGenderId === gender.id;
                const isCultural = gender.category === 'cultural_indigenous';
                return (
                  <div
                    key={gender.id}
                    onClick={() => {
                      setSelectedGenderId(gender.id);
                      if (gender.id !== 'self_described') {
                        setCustomGenderText('');
                      }
                    }}
                    className={`cursor-pointer rounded-2xl p-3.5 border transition-all text-left flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-pink-500 bg-pink-100/70 dark:bg-pink-950/60 ring-2 ring-pink-500/20 shadow-pink-glow'
                        : 'border-pink-200/70 dark:border-pink-900/50 bg-white/90 dark:bg-[#1E0B24]/60 hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50/50 dark:hover:bg-[#1E0B24]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-pink-950 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span>{gender.label}</span>
                            {isCultural && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-medium">
                                Cultural Heritage
                              </span>
                            )}
                          </h4>
                          <div className="text-[11px] font-mono text-pink-600 dark:text-pink-400">
                            {gender.culturalOrigin}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-pink-600 text-white'
                            : 'border border-pink-300 dark:border-pink-700 group-hover:border-pink-500'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-xs text-pink-900/80 dark:text-pink-200/80 mt-2 line-clamp-3 leading-relaxed">
                        {gender.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-pink-100 dark:border-pink-900/50 flex items-center justify-between text-[10px] text-pink-700/70 dark:text-pink-300/70">
                      <span>{gender.categoryLabel}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveGenderDetail(gender);
                        }}
                        className="hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1 font-medium"
                      >
                        <BookOpen className="w-3 h-3" /> Cultural Context
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Self-Described Custom Input if Selected */}
          {selectedGenderId === 'self_described' && (
            <div className="mt-4 p-4 rounded-2xl bg-pink-100/70 dark:bg-pink-950/50 border border-pink-300 dark:border-pink-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-pink-900 dark:text-pink-200">
                <Sparkles className="w-4 h-4 text-pink-600" />
                Describe Your Personal Gender Identity
              </div>
              <input
                type="text"
                value={customGenderText}
                onChange={e => setCustomGenderText(e.target.value)}
                placeholder="Enter your unique gender expression or traditional identity..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-300 dark:border-pink-700 bg-white dark:bg-[#16081A] text-sm text-pink-950 dark:text-white outline-none focus:ring-2 focus:ring-pink-400/40"
                autoFocus
              />
              <p className="text-[11px] text-pink-800/80 dark:text-pink-300/80">
                This identity will be saved and displayed on your Haven profile according to your visibility preference.
              </p>
            </div>
          )}
        </div>

        {/* Pronouns & Visibility Configuration Footer Section */}
        <div className="p-4 sm:p-5 border-t border-pink-200/80 dark:border-pink-900/60 bg-pink-50/80 dark:bg-[#16081A]/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pronoun Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-pink-900 dark:text-pink-200">
                Pronouns (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PRONOUNS.slice(0, 6).map(p => {
                  const isPSelected = selectedPronouns === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setSelectedPronouns(isPSelected ? '' : p);
                        setCustomPronounsText('');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isPSelected
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E0B24] border border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-200 hover:bg-pink-100 dark:hover:bg-pink-950/60'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={customPronounsText || (!COMMON_PRONOUNS.slice(0, 6).includes(selectedPronouns) ? selectedPronouns : '')}
                onChange={e => {
                  setCustomPronounsText(e.target.value);
                  setSelectedPronouns(e.target.value);
                }}
                placeholder="Or type custom pronouns (e.g. ze/zir, fae/faer)..."
                className="w-full mt-1.5 px-3 py-1.5 rounded-lg border border-pink-200 dark:border-pink-800 bg-white dark:bg-[#1E0B24] text-xs text-pink-950 dark:text-white outline-none focus:ring-2 focus:ring-pink-400/40"
              />
            </div>

            {/* Profile Visibility */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-pink-900 dark:text-pink-200">
                Gender Visibility on Profile
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                    visibility === 'public'
                      ? 'border-pink-500 bg-pink-100 dark:bg-pink-950/60 text-pink-900 dark:text-pink-100 font-semibold shadow-xs'
                      : 'border-pink-200 dark:border-pink-800 bg-white dark:bg-[#1E0B24] text-pink-700/70 dark:text-pink-300/70'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Public</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('friends_only')}
                  className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                    visibility === 'friends_only'
                      ? 'border-pink-500 bg-pink-100 dark:bg-pink-950/60 text-pink-900 dark:text-pink-100 font-semibold shadow-xs'
                      : 'border-pink-200 dark:border-pink-800 bg-white dark:bg-[#1E0B24] text-pink-700/70 dark:text-pink-300/70'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Family Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                    visibility === 'private'
                      ? 'border-pink-500 bg-pink-100 dark:bg-pink-950/60 text-pink-900 dark:text-pink-100 font-semibold shadow-xs'
                      : 'border-pink-200 dark:border-pink-800 bg-white dark:bg-[#1E0B24] text-pink-700/70 dark:text-pink-300/70'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private</span>
                </button>
              </div>
              <p className="text-[11px] text-pink-700/70 dark:text-pink-300/70">
                {visibility === 'public' && 'Visible to everyone viewing your profile and memoirs.'}
                {visibility === 'friends_only' && 'Only chosen family members with cryptographic verification can view your gender.'}
                {visibility === 'private' && 'Hidden from public and family; stored only for your personal profile.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-pink-200/60 dark:border-pink-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-950/60 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!selectedGenderId || (selectedGenderId === 'self_described' && !customGenderText.trim())}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs shadow-pink-500/20 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Apply Gender & Identity to Profile</span>
            </button>
          </div>
        </div>

        {/* Cultural Context Detail Sub-Modal */}
        {activeGenderDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {activeGenderDetail.categoryLabel}
                  </span>
                  <h3 className="text-lg font-serif-display font-bold text-slate-900 dark:text-white mt-1">
                    {activeGenderDetail.label}
                  </h3>
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    Cultural Heritage & Origin: {activeGenderDetail.culturalOrigin}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGenderDetail(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p>{activeGenderDetail.description}</p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex flex-wrap gap-1">
                  {activeGenderDetail.keywords.map(kw => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGenderId(activeGenderDetail.id);
                    setActiveGenderDetail(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Select This Identity
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
