/**
 * ============================================================================
 * FAYL ADI: components/PublicAiChatbot.js
 * MƏQSƏDİ: Sayt Ziyarətçiləri Üçün Üzən Süni İntellekt Çatbotu
 * 
 * BU KOMPONENTİN VƏZİFƏLƏRİ:
 *   1. Saytın sağ aşağı küncündə həmişə əlçatan interaktiv düymə və çat pəncərəsi.
 *   2. Ziyarətçilərin istənilən dildə (AZ, EN, RU, TR) suallarına Google Gemini AI ilə cavab.
 *   3. Cari mövsüm və kateqoriya kontekstini dərhal nəzərə alma.
 *   4. Hazır sürətli sual düymələri ("Bombardir kimdir?", "Lider kimdir?").
 * ============================================================================
 */
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { db } from '../services/database.js?v=20260910_0080';
import { askPublicChatbot } from '../services/geminiAssistant.js?v=20260910_0080';

const html = htm.bind(React.createElement);

export default function PublicAiChatbot({ activeYear = '2022-2023', activeDivision = '10-11', lang = 'az' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: lang === 'en' 
        ? 'Hello! I am TDV BTL Tournament AI Assistant. Ask me anything about standings, top scorers, or match schedules!' 
        : 'Salam! Mən TDV BTL Mini-Futbol Turnirinin AI köməkçisiyəm. Qrup cədvəli, bombardirlər və ya oyunlar barədə istənilən sualı verə bilərsiniz! ⚽'
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e, directText = null) => {
    if (e) e.preventDefault();
    const textToSend = (directText || query).trim();
    if (!textToSend || isLoading) return;

    setQuery('');
    const newMsgs = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMsgs);
    setIsLoading(true);

    try {
      // Gather real-time context from database
      const [allPlayers, allMatches, allClasses] = await Promise.all([
        db.getPlayers(activeYear),
        db.getMatches(activeYear),
        db.getClasses(activeYear)
      ]);

      // Calculate top 5 scorers
      const topScorers = [...allPlayers]
        .sort((a, b) => (b.goals || 0) - (a.goals || 0))
        .slice(0, 8)
        .map(p => ({ name: p.name, class: p.class, goals: p.goals || 0, assists: p.assists || 0 }));

      // Recent matches
      const recentMatches = [...allMatches]
        .slice(0, 6)
        .map(m => ({ teamA: m.teamA, teamB: m.teamB, scoreA: m.scoreA, scoreB: m.scoreB, stage: m.stage }));

      const contextData = {
        activeYear,
        activeDivision,
        totalPlayers: allPlayers.length,
        totalClasses: allClasses.length,
        totalMatches: allMatches.length,
        topScorers,
        recentMatches
      };

      const reply = await askPublicChatbot(textToSend, contextData);
      setMessages([...newMsgs, { role: 'model', text: reply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages([
        ...newMsgs,
        {
          role: 'model',
          text: lang === 'en' 
            ? 'Sorry, AI service is busy. Please try again in a moment.' 
            : 'Bağışlayın, hazırda AI xidməti məşğuldur. Zəhmət olmasa bir az sonra yenidən cəhd edin.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return html`
    <div 
      className="fixed bottom-20 right-3.5 lg:bottom-6 lg:right-6 z-40 font-sans pointer-events-none"
      style=${{ marginBottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}
    >
      <!-- Floating Action Button (FAB) -->
      ${!isOpen && html`
        <button
          onClick=${() => setIsOpen(true)}
          className="pointer-events-auto flex items-center gap-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white px-4 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all active:scale-95 border border-white/10"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">${lang === 'az' ? 'AI Köməkçi' : 'AI Assistant'}</span>
        </button>
      `}

      <!-- Chat Window Modal -->
      ${isOpen && html`
        <div className="pointer-events-auto w-[calc(100vw-1.5rem)] sm:w-[380px] max-w-[380px] h-[460px] sm:h-[550px] max-h-[75vh] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div className="bg-white dark:bg-[#1C1C1E] border-b border-gray-100 dark:border-white/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">AI Assistant</h3>
                <p className="text-[10px] text-gray-500 font-medium">TDV BTL Tournament</p>
              </div>
            </div>
            <button onClick=${() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Messages Area -->
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-[#141415]" ref=${messagesEndRef}>
            <div className="flex flex-col gap-4 min-h-full">
              ${messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return html`
                  <div key=${idx} className=`flex ${isUser ? 'justify-end' : 'justify-start'}`>
                    <div className=`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                      isUser 
                        ? 'bg-[#1C1C1E] dark:bg-white text-white dark:text-gray-900 rounded-br-sm shadow-sm' 
                        : 'bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-transparent text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                    }`>
                      ${msg.text}
                    </div>
                  </div>
                `;
              })}
              
              ${isLoading && html`
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-transparent rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style=${{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style=${{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style=${{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- Quick Prompts (Linear Style Pills) -->
          ${messages.length <= 2 && !isLoading && html`
            <div className="px-4 py-2 bg-gray-50/50 dark:bg-[#141415] flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 dark:border-white/5">
              ${quickQuestions.map(q => html`
                <button
                  key=${q}
                  onClick=${() => handleAsk(q)}
                  className="shrink-0 px-3 py-1.5 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-full text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors shadow-sm"
                >
                  ${q}
                </button>
              `)}
            </div>
          `}

          <!-- Input Area -->
          <div className="p-3 bg-white dark:bg-[#1C1C1E] border-t border-gray-100 dark:border-white/5">
            <div className="flex items-end gap-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-1.5 focus-within:border-gray-300 dark:focus-within:border-white/20 focus-within:ring-2 focus-within:ring-gray-100 dark:focus-within:ring-white/5 transition-all">
              <textarea
                value=${query}
                onInput=${(e) => {
                  setQuery(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = (e.target.scrollHeight < 100 ? e.target.scrollHeight : 100) + 'px';
                }}
                onKeyDown=${handleKeyDown}
                placeholder=${lang === 'az' ? 'Soruş...' : 'Ask anything...'}
                className="flex-1 bg-transparent border-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 resize-none max-h-[100px] min-h-[24px] py-2 px-3 overflow-y-auto"
                rows="1"
              ></textarea>
              <button
                onClick=${() => handleAsk()}
                disabled=${!query.trim() || isLoading}
                className="shrink-0 p-2 rounded-xl bg-[#1C1C1E] dark:bg-white text-white dark:text-gray-900 disabled:opacity-40 disabled:active:scale-100 hover:bg-[#2C2C2E] transition-all active:scale-95 mb-0.5 mr-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[9px] text-gray-400 font-medium">Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}
