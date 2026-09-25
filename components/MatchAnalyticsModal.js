import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Skeleton } from './ui.js';

const html = htm.bind(React.createElement);

export default function MatchAnalyticsModal({ match, teamAPlayers = [], teamBPlayers = [], onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    if (!match) return;
    
    // Simulate AI loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setAiAnalysis({
        possessionA: 55,
        possessionB: 45,
        shotsA: match.scoreA * 3 + 2,
        shotsB: match.scoreB * 3 + 1,
        xgA: (match.scoreA * 0.8 + 0.4).toFixed(2),
        xgB: (match.scoreB * 0.8 + 0.2).toFixed(2),
        summary: `${match.teamA} oyuna nəzarət etdi, lakin ${match.teamB} təhlükəli əks hücumlarla yadda qaldı. ${match.scoreA > match.scoreB ? match.teamA + ' komandasının xG göstəriciləri qələbəni əsaslandırır.' : match.scoreA < match.scoreB ? match.teamB + ' komandası şanslarını daha yaxşı dəyərləndirdi.' : 'Oyun qarşılıqlı hücumlarla, bərabər səviyyədə keçdi.'}`
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [match]);

  if (!match) return null;

  const ComparisonBar = ({ label, valueA, valueB, format = (v) => v, isReversed = false }) => {
    const total = Number(valueA) + Number(valueB);
    const pctA = total > 0 ? (Number(valueA) / total) * 100 : 50;
    const pctB = total > 0 ? (Number(valueB) / total) * 100 : 50;

    return html`
      <div className="mb-5">
        <div className="flex justify-between items-end mb-2 text-xs font-bold">
          <span className="text-indigo-700 w-12 text-left tabular-nums">${format(valueA)}</span>
          <span className="text-gray-400 uppercase tracking-widest text-[10px] text-center flex-1">${label}</span>
          <span className="text-rose-700 w-12 text-right tabular-nums">${format(valueB)}</span>
        </div>
        <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-100 gap-1">
          <div 
            className="h-full bg-indigo-500 rounded-r-sm transition-all duration-1000 ease-out" 
            style=${{ width: `${pctA}%` }}
          ></div>
          <div 
            className="h-full bg-rose-500 rounded-l-sm transition-all duration-1000 ease-out" 
            style=${{ width: `${pctB}%` }}
          ></div>
        </div>
      </div>
    `;
  };

  return html`
    <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn relative border border-gray-100">
        
        <!-- Header -->
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 p-6 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-widest">
              ${match.stage} • Matç Analitikası
            </span>
          </div>
          <button 
            onClick=${onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition w-8 h-8 rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6">
          <!-- Score Board -->
          <div className="flex justify-between items-center mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="text-center w-1/3">
              <h3 className="text-xl md:text-2xl font-black text-purple-950 truncate">${match.teamA}</h3>
            </div>
            <div className="flex flex-col items-center justify-center w-1/3">
              <div className="bg-purple-950 text-white rounded-xl px-4 py-2 font-black text-2xl md:text-3xl shadow-lg tabular-nums tracking-widest">
                ${match.scoreA} - ${match.scoreB}
              </div>
              ${(match.penaltyScoreA !== null && match.penaltyScoreA !== undefined && match.penaltyScoreA !== '') && html`
                <span className="text-[10px] text-green-600 font-extrabold mt-2 uppercase tracking-widest">Pen: ${match.penaltyScoreA} - ${match.penaltyScoreB}</span>
              `}
            </div>
            <div className="text-center w-1/3">
              <h3 className="text-xl md:text-2xl font-black text-purple-950 truncate">${match.teamB}</h3>
            </div>
          </div>

          <!-- AI Analysis Section -->
          <div className="mb-8">
            <h4 className="text-sm font-black text-purple-950 uppercase tracking-widest mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Süni İntellekt Təhlili (xG & Stats)
            </h4>
            
            ${isLoading ? html`
              <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50">
                <${Skeleton} className="h-4 w-full mb-2 bg-indigo-100/50" />
                <${Skeleton} className="h-4 w-5/6 mb-6 bg-indigo-100/50" />
                
                <div className="space-y-4 mt-6">
                  <${Skeleton} className="h-10 w-full bg-indigo-100/50" />
                  <${Skeleton} className="h-10 w-full bg-indigo-100/50" />
                  <${Skeleton} className="h-10 w-full bg-indigo-100/50" />
                </div>
              </div>
            ` : html`
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-600 font-medium leading-relaxed mb-8 italic border-l-4 border-indigo-500 pl-4">
                  "${aiAnalysis.summary}"
                </p>

                <div className="space-y-6">
                  <${ComparisonBar} 
                    label="Topa Sahib Olma" 
                    valueA=${aiAnalysis.possessionA} 
                    valueB=${aiAnalysis.possessionB} 
                    format=${(v) => v + '%'} 
                  />
                  
                  <${ComparisonBar} 
                    label="Ümumi Zərbələr" 
                    valueA=${aiAnalysis.shotsA} 
                    valueB=${aiAnalysis.shotsB} 
                  />
                  
                  <${ComparisonBar} 
                    label="Gözlənilən Qollar (xG)" 
                    valueA=${aiAnalysis.xgA} 
                    valueB=${aiAnalysis.xgB} 
                  />
                </div>
              </div>
            `}
          </div>

        </div>
      </div>
    </div>
  `;
}
