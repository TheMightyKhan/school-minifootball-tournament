/**
 * ============================================================================
 * FAYL ADI: components/Players.js
 * MƏQSƏDİ: Bütün Turnir Oyunçularının Kataloqu və Reytinq Kartları
 * 
 * BU KOMPONENTİN VƏZİFƏLƏRİ:
 *   1. Oyunçuların ada, sinfə və mövqeyə (Hücumçu, Yarımmüdafiəçi, Müdafiəçi, Qapıçı) görə süzgəci.
 *   2. Hər oyunçunun Sofascore canlı reytinq nişanı, qol, assist və oyun sayı.
 *   3. Kart üzərinə kliklədikdə oyunçunun tam fərdi karyera profilinin açılması.
 * ============================================================================
 */
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Skeleton, EmptyState } from './ui.js';
import { db, getSofascoreBadgeStyle } from '../services/database.js';
import { t as fallbackT, getDivisionLabel as fallbackGetDivisionLabel, isMatchDivision } from '../services/i18n.js';

const html = htm.bind(React.createElement);

export default function Players({ activeDivision, activeYear, lang = 'en', t = (k) => fallbackT(k, lang), onOpenPlayerProfile }) {
  const [players, setPlayers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlayersData = async () => {
      const allPlayers = await db.getPlayers(activeYear);
      const allClasses = await db.getClasses(activeYear);
      setPlayers(allPlayers);
      setClasses(allClasses);
    };
    loadPlayersData();
  }, [activeDivision, activeYear]);

  useEffect(() => {
    setSelectedClass('All');
  }, [activeDivision, activeYear]);

  const activeClasses = classes.filter(c => isMatchDivision(c.division, activeDivision));
  const activePlayers = players.filter(p => 
    isMatchDivision(p.division, activeDivision) &&
    !p.isOwnGoal &&
    !/avtoqol|özünə qol|ö\.q|ozune qol/i.test(p.name || '')
  );

  // Guarantee strict uniqueness per card
  const seenPlayerKeys = new Set();
  const uniqueActivePlayers = [];
  activePlayers.forEach(p => {
    const key = p.id || `${p.name}_${p.class}_${p.year}`;
    if (!seenPlayerKeys.has(key)) {
      seenPlayerKeys.add(key);
      uniqueActivePlayers.push(p);
    }
  });

  const filteredPlayers = uniqueActivePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || player.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Sort by overall rating descending, then goals descending
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if ((b.overallRating || 0) !== (a.overallRating || 0)) return (b.overallRating || 0) - (a.overallRating || 0);
    return (b.goals || 0) - (a.goals || 0);
  });

  const getDivisionLabel = (div) => fallbackGetDivisionLabel(div, lang);

  return html`
    <div className="space-y-6 animate-fadeIn">
      <!-- Title & Header -->
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-2xl font-black text-purple-950 font-sans tracking-tight">${t('playersTitle')} - ${getDivisionLabel(activeDivision)}</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">${lang === 'az' ? 'Sofascore reytinq sistemi və mövsüm statistikası' : 'Sofascore rating system and season stats'}</p>
        </div>
      </div>

      <!-- Filters Panel -->
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input
            type="text"
            value=${searchTerm}
            onChange=${(e) => setSearchTerm(e.target.value)}
            placeholder=${t('searchPlayerPlaceholder')}
            className="w-full bg-gray-50/50 border border-gray-200 text-purple-950 text-sm rounded-2xl focus:ring-purple-600 focus:border-purple-600 block pl-11 pr-4 py-3 min-h-[44px] transition-all"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value=${selectedClass}
            onChange=${(e) => setSelectedClass(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 text-purple-950 text-sm rounded-2xl focus:ring-purple-600 focus:border-purple-600 block px-4 py-3 min-h-[44px] font-semibold transition-all appearance-none"
          >
            <option value="All">${t('filterClassAll')}</option>
            ${activeClasses.map(cls => html`
              <option key=${cls.id} value=${cls.name}>${cls.name} ${lang === 'az' ? 'Sinfi' : 'Grade'}</option>
            `)}
          </select>
        </div>
      </div>

      <!-- Loading / Empty / Data -->
      ${isLoading ? html`
        <div className="flex flex-col gap-3">
          <${Skeleton} className="h-20 w-full rounded-2xl" />
          <${Skeleton} className="h-20 w-full rounded-2xl" />
          <${Skeleton} className="h-20 w-full rounded-2xl" />
        </div>
      ` : sortedPlayers.length === 0 ? html`
        <${EmptyState} message=${t('noPlayersFound')} icon=${html`<svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>`} />
      ` : html`
        <div className="flex flex-col gap-3">
          ${sortedPlayers.map((player, idx) => {
            const rating = player.overallRating || 6.5;
            const badgeClass = getSofascoreBadgeStyle(rating);
            const posLower = (player.position || '').toLowerCase();
            const isKeeper = player.isKeeper || posLower.includes('qap') || posLower.includes('gk');
            const isDef = posLower.includes('müdafiə') || posLower.includes('def') || posLower.includes('defans');
            const isMid = posLower.includes('yarımmüdafiə') || posLower.includes('mid');
            
            let posBadgeColor = "bg-rose-100 text-rose-700 border-rose-200"; // Default FWD
            let posText = "FWD";
            if (isKeeper) { posBadgeColor = "bg-amber-100 text-amber-700 border-amber-200"; posText = "GK"; }
            else if (isDef) { posBadgeColor = "bg-sky-100 text-sky-700 border-sky-200"; posText = "DEF"; }
            else if (isMid) { posBadgeColor = "bg-emerald-100 text-emerald-700 border-emerald-200"; posText = "MID"; }

            return html`
              <div 
                key=${player.id} 
                onClick=${() => onOpenPlayerProfile && onOpenPlayerProfile(player.name)}
                className="group flex flex-col sm:flex-row items-center gap-4 bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
              >
                <!-- Rank Indicator for Top 3 -->
                ${idx < 3 ? html`
                  <div className="absolute top-0 left-0 w-1.5 h-full ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-amber-700'}"></div>
                ` : html`
                  <div className="absolute top-0 left-0 w-1 h-full bg-gray-100 group-hover:bg-purple-200 transition-colors"></div>
                `}

                <!-- Player Identity -->
                <div className="flex-1 flex items-center gap-4 pl-2 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center border border-purple-200 shrink-0 shadow-sm text-purple-700 font-black text-lg">
                    ${player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-gray-900 text-lg group-hover:text-purple-700 transition-colors line-clamp-1">${player.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">${player.class}</span>
                      <span className=`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${posBadgeColor}`>
                        ${posText}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Stats Divider on Mobile -->
                <div className="w-full h-px bg-gray-100 sm:hidden mt-2 mb-1"></div>

                <!-- Stats / Rating -->
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pr-2">
                  
                  <div className="flex items-center gap-5 sm:gap-6 text-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">QOL</span>
                      <span className="text-lg font-black text-gray-900 tabular-nums leading-tight">${player.goals || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">AST</span>
                      <span className="text-lg font-black text-gray-900 tabular-nums leading-tight">${player.assists || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">OYN</span>
                      <span className="text-lg font-black text-gray-500 tabular-nums leading-tight">${player.matchesPlayed || 0}</span>
                    </div>
                  </div>

                  <!-- Sofascore Badge -->
                  <div className=`w-12 h-12 rounded-xl flex items-center justify-center font-black tabular-nums text-lg shadow-sm ${badgeClass}`>
                    ${rating}
                  </div>
                </div>

              </div>
            `;
          })}
        </div>
      `}
    </div>
  `;
}
