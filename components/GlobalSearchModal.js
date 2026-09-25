/**
 * ============================================================================
 * FAYL ADI: components/GlobalSearchModal.js
 * MƏQSƏDİ: Turnir Üzrə Universal Çox-Obyektli Qlobal Axtarış Pəncərəsi
 * 
 * BU KOMPONENTİN VƏZİFƏLƏRİ:
 *   1. Real-vaxt axtarış: İstifadəçi yazdıqca dərhal nəticələri filtrləyir.
 *   2. 3 istiqamətdə eyni vaxtda axtarış:
 *      - Oyunçular (adı, sinfi, illəri, qol sayı, reytinqi)
 *      - Siniflər / Komandalar (kateqoriyası, oynadığı illər)
 *      - Matçlar (komandalar, hesablar, mərhələlər)
 *   3. Klaviatura qısayolu (Ctrl+K / Cmd+K) ilə dərhal açılma.
 * ============================================================================
 */
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { db, getSofascoreBadgeStyle } from '../services/database.js';
import { t as fallbackT } from '../services/i18n.js';

const html = htm.bind(React.createElement);

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectPlayer,
  onSelectClass,
  onSelectMatch,
  lang = 'en',
  t = (k) => fallbackT(k, lang)
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ players: [], classes: [], matches: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setQuery('');
      setResults({ players: [], classes: [], matches: [] });
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ players: [], classes: [], matches: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      db.searchAll(query).then(res => {
        setResults(res || { players: [], classes: [], matches: [] });
        setLoading(false);
      }).catch(err => {
        console.error("Global search error:", err);
        setLoading(false);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.players.length + results.classes.length + results.matches.length;
  const popularQueries = ['Taleh', 'Ağamir', '11A', '10A', 'Final', '11F', '6A'];

  return html`
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-[16px] flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 animate-fadeIn"
      onClick=${(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-[20px] p-2 max-w-2xl w-full shadow-2xl border border-white/40 dark:border-white/10 flex flex-col max-h-[85vh] ring-1 ring-black/5">
        
        <!-- Search Input Header -->
        <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 rounded-[14px] shadow-sm border border-gray-100 dark:border-zinc-800">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          
          <input
            ref=${inputRef}
            type="text"
            value=${query}
            onInput=${(e) => setQuery(e.target.value)}
            placeholder=${lang === 'az' ? 'Axtarış (Oyunçular, Komandalar, Matçlar...)' : 'Search (Players, Teams, Matches...)'}
            className="flex-1 bg-transparent text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />

          ${loading && html`
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent shrink-0"></div>
          `}

          <div className="flex items-center gap-1.5 shrink-0 hidden sm:flex">
            ${query && html`
              <button onClick=${() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            `}
            <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md text-[10px] font-bold text-gray-500 tracking-widest shadow-sm">ESC</kbd>
          </div>
        </div>

        <!-- Results Area -->
        <div className="overflow-y-auto flex-1 p-2 space-y-4 mt-2">
          
          ${query.trim() === '' ? html`
            <div className="p-8 text-center text-gray-400 dark:text-zinc-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-sm font-medium">${lang === 'az' ? 'Axtarışa başlamaq üçün yazın' : 'Type to start searching'}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                ${popularQueries.map(pq => html`
                  <button
                    key=${pq}
                    onClick=${() => setQuery(pq)}
                    className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    ${pq}
                  </button>
                `)}
              </div>
            </div>
          ` : totalResults === 0 && !loading ? html`
            <div className="p-12 text-center text-gray-400">
              <p className="text-sm font-medium">${lang === 'az' ? 'Heç nə tapılmadı' : 'No results found'}</p>
            </div>
          ` : html`
            <div className="space-y-6">
              
              <!-- Players Category -->
              ${results.players.length > 0 && html`
                <div>
                  <div className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">${t('players')}</div>
                  <div className="flex flex-col gap-1">
                    ${results.players.map(player => {
                      const rating = player.overallRating || 6.5;
                      const badgeClass = getSofascoreBadgeStyle(rating);
                      return html`
                        <div
                          key=${player.id}
                          onClick=${() => { onSelectPlayer(player); onClose(); }}
                          className="group flex items-center justify-between p-2.5 rounded-[12px] hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-zinc-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                              ${player.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-purple-600 transition-colors">${player.name}</div>
                              <div className="text-[10px] text-gray-500 font-medium">${player.class} • ${player.position || 'Oyunçu'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex text-[10px] text-gray-400 font-semibold gap-3">
                              <span>${player.goals} Qol</span>
                              <span>${player.assists} Ast</span>
                            </div>
                            <div className=`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black tabular-nums ${badgeClass}`>${rating}</div>
                            <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded text-[9px] font-bold text-gray-400">↵</kbd>
                          </div>
                        </div>
                      `;
                    })}
                  </div>
                </div>
              `}

              <!-- Classes Category -->
              ${results.classes.length > 0 && html`
                <div>
                  <div className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">${lang === 'az' ? 'Komandalar' : 'Teams'}</div>
                  <div className="flex flex-col gap-1">
                    ${results.classes.map(cls => html`
                      <div
                        key=${cls.id}
                        onClick=${() => { onSelectClass(cls); onClose(); }}
                        className="group flex items-center justify-between p-2.5 rounded-[12px] hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-zinc-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                            ${cls.name}
                          </div>
                          <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">${cls.name} ${lang === 'az' ? 'Sinfi' : 'Class'}</div>
                        </div>
                        <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded text-[9px] font-bold text-gray-400">↵</kbd>
                      </div>
                    `)}
                  </div>
                </div>
              `}

              <!-- Matches Category -->
              ${results.matches.length > 0 && html`
                <div>
                  <div className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">${t('matches')}</div>
                  <div className="flex flex-col gap-1">
                    ${results.matches.map(match => html`
                      <div
                        key=${match.id}
                        onClick=${() => { onSelectMatch(match); onClose(); }}
                        className="group flex items-center justify-between p-2.5 rounded-[12px] hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-zinc-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-black shrink-0">
                            VS
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-sky-600 transition-colors">${match.team1} <span className="text-gray-400 font-normal px-1">vs</span> ${match.team2}</div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase">${match.stage} ${match.isFinished ? `• ${match.score1} - ${match.score2}` : ''}</div>
                          </div>
                        </div>
                        <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded text-[9px] font-bold text-gray-400">↵</kbd>
                      </div>
                    `)}
                  </div>
                </div>
              `}

            </div>
          `}

        </div>
      </div>
    </div>
  `;
}
