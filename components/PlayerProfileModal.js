import React from 'react';
import htm from 'htm';
import { Skeleton } from './ui.js';

const html = htm.bind(React.createElement);

export default function PlayerProfileModal({ player, onClose, isLoading }) {
  if (!player && !isLoading) return null;

  const getRatingColor = (rating) => {
    if (rating >= 8.5) return 'text-amber-500 bg-amber-50';
    if (rating >= 7.5) return 'text-green-500 bg-green-50';
    if (rating >= 6.5) return 'text-blue-500 bg-blue-50';
    if (rating >= 5.5) return 'text-yellow-500 bg-yellow-50';
    return 'text-red-500 bg-red-50';
  };

  const getRatingBarColor = (rating) => {
    if (rating >= 8.5) return 'bg-amber-500';
    if (rating >= 7.5) return 'bg-green-500';
    if (rating >= 6.5) return 'bg-blue-500';
    if (rating >= 5.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressWidth = (value, max = 10) => {
    const percentage = (value / max) * 100;
    return `${Math.min(Math.max(percentage, 0), 100)}%`;
  };

  return html`
    <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-950/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-md w-full overflow-hidden shadow-2xl animate-fadeIn relative border border-gray-100">
        <!-- Close Button -->
        <button 
          onClick=${onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white transition w-8 h-8 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        ${isLoading ? html`
          <div className="p-8">
            <${Skeleton} className="h-40 w-full mb-6 rounded-xl" />
            <div className="space-y-4">
              <${Skeleton} className="h-8 w-3/4" />
              <${Skeleton} className="h-8 w-1/2" />
              <${Skeleton} className="h-8 w-full" />
            </div>
          </div>
        ` : html`
          <!-- EA Sports FC Style Header -->
          <div className="relative h-48 bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6 flex flex-col justify-end text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase mb-1 block">
                  ${player.class} Sinfi • ${player.position || 'Mövqe Yoxdur'}
                </span>
                <h2 className="text-3xl font-black tracking-tight leading-none">${player.name}</h2>
              </div>
              
              <div className=${`flex flex-col items-center justify-center w-16 h-20 rounded-xl ${getRatingColor(player.overallRating)} border-2 border-white/20 shadow-lg`}>
                <span className="text-2xl font-black tabular-nums leading-none tracking-tighter">${player.overallRating || '0.0'}</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-80">OVR</span>
              </div>
            </div>
          </div>

          <!-- Opta Stats Grid -->
          <div className="p-6">
            <h3 className="text-sm font-black text-purple-950 uppercase tracking-widest mb-4">Əsas Göstəricilər</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Oyun</span>
                <span className="text-2xl font-black tabular-nums text-purple-950">${player.matchesPlayed || 0}</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Qol</span>
                <span className="text-2xl font-black tabular-nums text-green-600">${player.goals || 0}</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Asist</span>
                <span className="text-2xl font-black tabular-nums text-blue-600">${player.assists || 0}</span>
              </div>
            </div>

            <h3 className="text-sm font-black text-purple-950 uppercase tracking-widest mb-4">Texniki Analiz</h3>
            
            <div className="space-y-4">
              <!-- Rating Progress -->
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-gray-600 uppercase">Orta Reytinq</span>
                  <span className="text-sm font-black tabular-nums text-purple-950">${player.overallRating || 0}/10</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className=${`h-full rounded-full transition-all duration-1000 ease-out ${getRatingBarColor(player.overallRating)}`} 
                    style=${{ width: getProgressWidth(player.overallRating, 10) }}
                  ></div>
                </div>
              </div>

              <!-- Goal Contribution -->
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-gray-600 uppercase">Hücum Töhfəsi</span>
                  <span className="text-sm font-black tabular-nums text-purple-950">${(player.goals || 0) + (player.assists || 0)}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                    style=${{ width: getProgressWidth((player.goals || 0) + (player.assists || 0), 20) }}
                  ></div>
                </div>
              </div>
              
              <!-- Form (Matches Played relative to total possible, estimated) -->
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-gray-600 uppercase">Davamlılıq</span>
                  <span className="text-sm font-black tabular-nums text-purple-950">${player.matchesPlayed || 0}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-1000 ease-out" 
                    style=${{ width: getProgressWidth(player.matchesPlayed || 0, 15) }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}
