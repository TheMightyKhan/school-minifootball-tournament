import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { db } from '../services/database.js';
import { Skeleton, EmptyState } from './ui.js';

const html = htm.bind(React.createElement);

const getRatingClass = (rating) => {
  if (rating >= 8.5) return 'rating-sofascore-legendary';
  if (rating >= 7.5) return 'rating-sofascore-excellent';
  if (rating >= 6.5) return 'rating-sofascore-good';
  if (rating >= 5.5) return 'rating-sofascore-average';
  return 'rating-sofascore-bad';
};

const UserIcon = () => html`<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
const PlayIcon = () => html`<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
const BallIcon = () => html`<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>`;
const TrophyIcon = () => html`<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`;
const ChevronRightIcon = () => html`<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>`;

export default function Dashboard({ setActiveTab, activeDivision, activeYear }) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    totalGoals: 0,
    leader: '-'
  });
  const [topPlayers, setTopPlayers] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [topAssists, setTopAssists] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadDashboardData = async () => {
      try {
        const allPlayers = await db.getPlayers(activeYear);
        const allMatches = await db.getMatches(activeYear);
        const standings = await db.getStandings(activeDivision, activeYear);

        if (!isMounted) return;

        const players = allPlayers.filter(p => p.division === activeDivision);
        const matches = allMatches.filter(m => m.division === activeDivision);

        const totalPlayers = players.length;
        const totalMatches = matches.length;
        const totalGoals = matches.reduce((sum, m) => sum + Number(m.scoreA || 0) + Number(m.scoreB || 0), 0);
        const leader = standings[0] ? standings[0].class : '-';

        setStats({ totalPlayers, totalMatches, totalGoals, leader });

        const rankedPlayers = [...players]
          .filter(p => p.matchesPlayed > 0)
          .sort((a, b) => b.overallRating - a.overallRating)
          .slice(0, 3);
        setTopPlayers(rankedPlayers);

        const scorers = [...players]
          .sort((a, b) => b.goals - a.goals || b.overallRating - a.overallRating)
          .slice(0, 5);
        setTopScorers(scorers);

        const assists = [...players]
          .sort((a, b) => b.assists - a.assists || b.overallRating - a.overallRating)
          .slice(0, 5);
        setTopAssists(assists);

        const recent = [...matches]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
        setRecentMatches(recent);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboardData();
    return () => { isMounted = false; };
  }, [activeDivision, activeYear]);

  const getDivisionLabel = (div) => {
    if (div === '6') return '6-cı Siniflər';
    if (div === '7') return '7-ci Siniflər';
    if (div === '8') return '8-ci Siniflər';
    if (div === '9') return '9-cu Siniflər';
    if (div === '10-11') return '10-11-ci Siniflər';
    if (div === '7-8') return '7-8-ci Siniflər';
    if (div === '9-10') return '9-10-cu Siniflər';
    return '11-ci Siniflər';
  };

  return html`
    <div className="space-y-8 animate-fadeIn">
      <!-- Welcome Banner -->
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-purple-950 via-purple-900 to-purple-800 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-green-500 opacity-10 blur-2xl"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="mb-2 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400 uppercase tracking-widest">
            ${getDivisionLabel(activeDivision)}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            TDV BTL Futbol Turniri
          </h2>
          <p className="mt-2 text-purple-200 text-sm md:text-base">
            Canlı turnir cədvəlləri, fərdi reytinqlər və mərhələli pley-off qarşılaşmaları.
          </p>
        </div>
      </div>

      <!-- Quick Stats Bento Grid -->
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] p-3 shadow-sm border border-purple-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-xl bg-purple-100 p-2.5 text-purple-900">
              <${UserIcon} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Oyunçu</p>
          </div>
          <div>
            ${isLoading ? html`<${Skeleton} className="h-8 w-16" />` : html`<p className="text-3xl font-black text-purple-950">${stats.totalPlayers}</p>`}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-3 shadow-sm border border-purple-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-xl bg-purple-100 p-2.5 text-purple-900">
              <${PlayIcon} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Matç</p>
          </div>
          <div>
            ${isLoading ? html`<${Skeleton} className="h-8 w-16" />` : html`<p className="text-3xl font-black text-purple-950">${stats.totalMatches}</p>`}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-3 shadow-sm border border-purple-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-xl bg-purple-100 p-2.5 text-purple-900">
              <${BallIcon} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Qol</p>
          </div>
          <div>
             ${isLoading ? html`<${Skeleton} className="h-8 w-16" />` : html`<p className="text-3xl font-black text-purple-950">${stats.totalGoals}</p>`}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-[20px] p-3 shadow-sm border border-green-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-xl bg-green-200/50 p-2.5 text-green-700">
              <${TrophyIcon} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold">Lider</p>
          </div>
          <div>
            ${isLoading ? html`<${Skeleton} className="h-8 w-24 bg-green-200" />` : html`<p className="text-3xl font-black text-green-900">${stats.leader}</p>`}
          </div>
        </div>
      </div>

      <!-- Top Ranked Players (Sofascore Rating Showcase) -->
      <div>
        <h3 className="text-xl font-bold text-purple-900 mb-4 border-l-4 border-green-500 pl-2">
          Qrupun Ən Yaxşı Oyunçuları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${isLoading ? html`
            <${Skeleton} className="h-28 rounded-2xl" />
            <${Skeleton} className="h-28 rounded-2xl hidden md:block" />
            <${Skeleton} className="h-28 rounded-2xl hidden md:block" />
          ` : topPlayers.length === 0 ? html`
            <div className="col-span-3">
              <${EmptyState} message="Bu qrupda oynanılmış oyun yoxdur" />
            </div>
          ` : topPlayers.map((player, index) => html`
            <div key=${player.id} className="sport-card-hover bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-900"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded">
                    #${index + 1}
                  </span>
                  <h4 className="text-base font-bold text-purple-950">${player.name}</h4>
                </div>
                <p className="text-xs text-gray-500 mt-1">${player.class} Sinfi • ${player.position}</p>
                <div className="flex gap-3 mt-3 text-xs font-semibold text-gray-600">
                  <span className="flex items-center gap-1"><${BallIcon} /> ${player.goals}</span>
                  <span className="flex items-center gap-1"><${UserIcon} /> ${player.matchesPlayed}</span>
                </div>
              </div>
              
              <div className=${`w-14 h-14 rounded-[14px] flex flex-col items-center justify-center font-black shadow-md ${getRatingClass(player.overallRating)}`}>
                <span className="text-lg leading-none">${player.overallRating}</span>
                <span className="text-[9px] font-medium opacity-80 mt-0.5">Rating</span>
              </div>
            </div>
          `)}
        </div>
      </div>

      <!-- Recent Match Results & Top Stats Grid -->
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Recent Matches -->
        <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-purple-950">Son Matçlar</h3>
            <button onClick=${() => setActiveTab('matches')} className="text-xs font-bold text-purple-900 hover:text-green-600 transition flex items-center space-x-1">
              <span>Bütün oyunlar</span> <${ChevronRightIcon} />
            </button>
          </div>
          <div className="space-y-3">
            ${isLoading ? html`
              <${Skeleton} className="h-16 rounded-[16px]" />
              <${Skeleton} className="h-16 rounded-[16px]" />
            ` : recentMatches.length === 0 ? html`
              <${EmptyState} message="Heç bir matç qeydə alınmayıb" />
            ` : recentMatches.map(match => html`
              <div key=${match.id} className="p-4 rounded-[16px] bg-gray-50 hover:bg-purple-50/50 border border-gray-100 transition flex justify-between items-center">
                <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded uppercase whitespace-nowrap">
                  ${match.stage}
                </span>
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="flex items-center justify-center space-x-4">
                    <span className="font-extrabold text-sm md:text-base text-purple-950 w-16 text-right">${match.teamA}</span>
                    <div className="bg-purple-950 text-white rounded-lg px-3 py-1 font-black text-sm md:text-base shadow-sm">
                      ${match.scoreA} - ${match.scoreB}
                    </div>
                    <span className="font-extrabold text-sm md:text-base text-purple-950 w-16 text-left">${match.teamB}</span>
                  </div>
                  ${(match.penaltyScoreA !== null && match.penaltyScoreA !== undefined && match.penaltyScoreA !== '') && html`
                    <span className="text-[9px] text-green-600 font-extrabold mt-0.5">pen. ${match.penaltyScoreA} - ${match.penaltyScoreB}</span>
                  `}
                </div>
                <span className="text-xs text-gray-400 hidden md:inline">${match.date || 'Təyin edilməyib'}</span>
              </div>
            `)}
          </div>
        </div>

        <!-- Right: Stat Leaders (Goals & Assists) -->
        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          <!-- Top Goalscorers -->
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-purple-950 mb-3 flex items-center">
              <span className="text-green-500 mr-2"><${BallIcon} /></span> Bombardirlər
            </h3>
            <div className="divide-y divide-gray-100">
              ${isLoading ? html`
                <${Skeleton} className="h-10 mt-2" />
                <${Skeleton} className="h-10 mt-2" />
              ` : topScorers.length === 0 ? html`
                <${EmptyState} message="Oyunçu məlumatı tapılmadı" />
              ` : topScorers.map((player, index) => html`
                <div key=${player.id} className="py-2.5 flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-purple-900 w-4">${index + 1}</span>
                    <div>
                      <p className="font-bold text-purple-950">${player.name}</p>
                      <p className="text-xs text-gray-400">${player.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-purple-950 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                      ${player.goals} Qol
                    </span>
                    <span className=${`text-xs font-bold px-1.5 py-0.5 rounded ${getRatingClass(player.overallRating)}`}>
                      ${player.overallRating}
                    </span>
                  </div>
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
