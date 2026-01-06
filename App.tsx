
import React, { useState, useEffect, useRef } from 'react';
import { Winner, Settings } from './types';
import { getCelebrationMessage } from './services/geminiService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [items, setItems] = useState<string[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [currentShuffleName, setCurrentShuffleName] = useState<string>("");
  const [lastWinner, setLastWinner] = useState<Winner | null>(null);
  const [settings, setSettings] = useState<Settings>({
    removeAfterPick: true,
    soundEnabled: true,
    autoAI: true,
  });

  const shuffleIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l !== "");
    setItems(lines);
  }, [inputText]);

  const triggerConfetti = () => {
    // @ts-ignore
    window.confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C']
    });
  };

  const handleDraw = async () => {
    if (items.length === 0 || isShuffling) return;

    setIsShuffling(true);
    setLastWinner(null);
    let counter = 0;
    
    // REDUCED: maxShuffles from 35 to 12 for faster result
    const maxShuffles = 12;

    // REDUCED: Interval from 70ms to 40ms for snappier feel
    shuffleIntervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * items.length);
      setCurrentShuffleName(items[randomIndex]);
      counter++;

      if (counter >= maxShuffles) {
        if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
        const winnerIndex = Math.floor(Math.random() * items.length);
        const winnerName = items[winnerIndex];
        finishDraw(winnerName, winnerIndex);
      }
    }, 40);
  };

  const finishDraw = async (winnerName: string, index: number) => {
    // Start AI fetch immediately, but don't block the UI update
    const cheerMessagePromise = settings.autoAI ? getCelebrationMessage(winnerName) : Promise.resolve("");

    const newWinner: Winner = {
      id: Math.random().toString(36).substr(2, 9),
      name: winnerName,
      timestamp: Date.now(),
    };

    setLastWinner(newWinner);
    setIsShuffling(false);
    triggerConfetti();

    // Remove from input if setting is enabled
    if (settings.removeAfterPick) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setInputText(newItems.join('\n'));
    }

    // Wait for AI message if enabled, then update winner history
    const cheerMessage = await cheerMessagePromise;
    const finalWinner = { ...newWinner, cheerMessage };
    
    setWinners(prev => [finalWinner, ...prev]);
    setLastWinner(finalWinner);
  };

  const clearHistory = () => {
    if (window.confirm("ต้องการล้างประวัติการสุ่มทั้งหมด?")) {
      setWinners([]);
      setLastWinner(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      {/* Header Section */}
      <header className="text-center mb-12 animate-pop-in">
        <div className="inline-block bg-white p-2 px-6 rounded-full shadow-lg mb-4">
          <span className="text-3xl">🎁</span>
        </div>
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 drop-shadow-sm uppercase tracking-tighter">
          Lucky Winner
        </h1>
        <p className="text-gray-600 mt-2 font-medium">สุ่มสิ่งของและรางวัลของคุณอย่างรวดเร็วและสนุกสนาน!</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className="glass-white p-6 rounded-3xl shadow-2xl transition-all hover:shadow-cyan-100">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-700">
              <span className="mr-2">📝</span> รายการของรางวัล ({items.length})
            </h2>
            <textarea
              className="w-full h-80 bg-white/50 border-2 border-orange-100 rounded-2xl p-4 text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none font-medium text-sm custom-scrollbar"
              placeholder="ใส่ชื่อของรางวัลที่นี่...&#10;(1 บรรทัดต่อ 1 อย่าง)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isShuffling}
            />
          </div>

          <div className="glass-white p-6 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-700">
              <span className="mr-2">⚙️</span> ตั้งค่า
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 transition-colors cursor-pointer group">
                <span className="text-gray-600 font-medium group-hover:text-gray-900">ตัดออกหลังสุ่มได้</span>
                <input 
                  type="checkbox" 
                  className="w-6 h-6 accent-orange-500" 
                  checked={settings.removeAfterPick}
                  onChange={() => setSettings(s => ({...s, removeAfterPick: !s.removeAfterPick}))}
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 transition-colors cursor-pointer group">
                <span className="text-gray-600 font-medium group-hover:text-gray-900">AI ช่วยแสดงความยินดี</span>
                <input 
                  type="checkbox" 
                  className="w-6 h-6 accent-cyan-500" 
                  checked={settings.autoAI}
                  onChange={() => setSettings(s => ({...s, autoAI: !s.autoAI}))}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Main Picker Display */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-10 order-1 lg:order-2">
          <div className="relative w-full max-w-[480px] group">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity ${isShuffling ? 'animate-pulse' : ''}`}></div>
            
            <div className={`relative aspect-square flex items-center justify-center rounded-full border-8 border-white shadow-2xl glass-white overflow-hidden ${isShuffling ? 'scale-105' : 'scale-100'} transition-transform duration-300`}>
              <div className="text-center p-10 flex flex-col items-center justify-center h-full w-full">
                {isShuffling ? (
                  <div className="space-y-4">
                    <div className="text-5xl animate-bounce">🎰</div>
                    <div className="text-3xl md:text-4xl font-black text-orange-600 truncate max-w-xs md:max-w-md px-4">
                      {currentShuffleName}
                    </div>
                  </div>
                ) : lastWinner ? (
                  <div className="animate-pop-in space-y-6">
                    <div className="text-6xl animate-bounce">⭐</div>
                    <div>
                      <p className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-2">ยินดีด้วย! คุณได้รับ</p>
                      <h3 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight px-4 break-words">
                        {lastWinner.name}
                      </h3>
                    </div>
                    {lastWinner.cheerMessage && (
                      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm max-w-xs mx-auto animate-fade-in">
                        <p className="text-sm text-orange-700 italic font-medium leading-relaxed">
                           "{lastWinner.cheerMessage}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-7xl opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">🎡</div>
                    <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">พร้อมแล้วกดหมุนได้เลย!</p>
                  </div>
                )}
              </div>
              <div className={`absolute inset-0 border-[16px] border-dotted border-white/20 rounded-full ${isShuffling ? 'spin-slow' : ''}`}></div>
            </div>
          </div>

          <button
            onClick={handleDraw}
            disabled={isShuffling || items.length === 0}
            className={`group relative overflow-hidden w-full max-w-[320px] py-6 rounded-full text-2xl font-black transition-all transform active:scale-95 shadow-xl hover:shadow-orange-200 ${
              isShuffling || items.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:-translate-y-1'
            }`}
          >
            <span className="relative z-10">{isShuffling ? 'กำลังสุ่ม...' : 'หมุนเลย!'}</span>
            {!isShuffling && items.length > 0 && (
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            )}
          </button>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-3 space-y-6 order-3">
          <div className="glass-white p-6 rounded-3xl shadow-2xl flex flex-col h-[600px] lg:h-[720px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold flex items-center text-gray-700">
                <span className="mr-2">🏆</span> รายการที่สุ่มได้
              </h2>
              <button 
                onClick={clearHistory}
                className="p-2 px-3 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all"
              >
                ล้างประวัติ
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {winners.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-300 space-y-2 opacity-50">
                  <div className="text-4xl">🏜️</div>
                  <p className="font-bold">ยังไม่มีรางวัลถูกสุ่ม</p>
                </div>
              ) : (
                winners.map((winner) => (
                  <div key={winner.id} className="animate-pop-in p-4 bg-white/60 rounded-2xl border-2 border-transparent hover:border-orange-200 hover:bg-white transition-all shadow-sm group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-gray-700 group-hover:text-orange-600 transition-colors">{winner.name}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-400 font-bold">
                        {new Date(winner.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    {winner.cheerMessage && (
                      <p className="text-[11px] text-gray-500 italic line-clamp-2 leading-relaxed">
                        {winner.cheerMessage}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-gray-500/60 font-bold text-sm">
        <p>© 2024 LUCKY SPIN - สุ่มเร็ว ทันใจ ได้รางวัลแน่นอน 🎡</p>
      </footer>
    </div>
  );
};

export default App;
