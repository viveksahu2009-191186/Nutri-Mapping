
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Plus, 
  User, 
  Settings, 
  History, 
  Zap,
  ChevronRight,
  Utensils,
  Target,
  Trophy,
  Loader2,
  ArrowRight,
  Sparkles,
  X as CloseIcon,
  Wand2,
  Info,
  Map as MapIcon
} from 'lucide-react';
import { UserProfile, FoodItem, AnalysisResult, RDA } from './types';
import { calculateRDA, MOCK_LOGS, COMMON_FOODS } from './constants';
import { analyzeFoodInput } from './services/geminiService';
import CameraInput from './components/CameraInput';
import NutrientProgress from './components/NutrientProgress';

const App: React.FC = () => {
  // State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 28,
    sex: 'male',
    weight: 75,
    height: 180,
    activityLevel: 'moderate',
    goal: 'muscle-gain'
  });
  
  const [logs, setLogs] = useState<FoodItem[]>(MOCK_LOGS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'profile'>('dashboard');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState<AnalysisResult | null>(null);
  const [showRdaMapper, setShowRdaMapper] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Calculations
  const rda = useMemo(() => calculateRDA(userProfile), [userProfile]);
  
  const todayStats = useMemo(() => {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const todaysLogs = logs.filter(l => l.timestamp > startOfDay);
    
    const stats: Record<string, number> = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      vitaminA: 0,
      vitaminC: 0,
      iron: 0,
      calcium: 0,
      potassium: 0
    };

    todaysLogs.forEach(l => {
      stats.calories += l.calories;
      l.nutrients.forEach(n => {
        const normalizedName = n.name.toLowerCase();
        if (normalizedName === 'protein') stats.protein += n.amount;
        else if (normalizedName === 'fat') stats.fat += n.amount;
        else if (normalizedName === 'carbs') stats.carbs += n.amount;
        else if (normalizedName === 'iron') stats.iron += n.amount;
        else if (normalizedName === 'calcium') stats.calcium += n.amount;
        else if (normalizedName.includes('vitamin a')) stats.vitaminA += n.amount;
        else if (normalizedName.includes('vitamin c')) stats.vitaminC += n.amount;
        else if (normalizedName === 'potassium') stats.potassium += n.amount;
      });
    });
    
    return stats;
  }, [logs]);

  // Handle Autocomplete
  useEffect(() => {
    const lastWord = textInput.split(/[, ]+/).pop() || '';
    if (lastWord.length > 1) {
      const filtered = COMMON_FOODS.filter(food => 
        food.toLowerCase().startsWith(lastWord.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [textInput]);

  const selectSuggestion = (suggestion: string) => {
    const words = textInput.split(/([, ]+)/);
    words.pop(); // remove last typed word
    setTextInput(words.join('') + suggestion + ', ');
    setSuggestions([]);
  };

  // Handlers
  const handleAnalyze = async (image?: string) => {
    const inputToAnalyze = image ? { imageBase64: image } : { text: textInput };
    if (!inputToAnalyze.text && !inputToAnalyze.imageBase64) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodInput(inputToAnalyze, userProfile);
      setShowResult(result);
      setTextInput('');
    } catch (err) {
      alert("Error analyzing food: " + (err as Error).message);
    } finally {
      setIsAnalyzing(false);
      setIsCapturing(false);
    }
  };

  const confirmLoggedFood = () => {
    if (!showResult) return;
    
    const newItems: FoodItem[] = showResult.items.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      calories: item.calories,
      timestamp: Date.now(),
      nutrients: [
        { name: 'Protein', amount: item.macros.protein, unit: 'g', category: 'macro' },
        { name: 'Fat', amount: item.macros.fat, unit: 'g', category: 'macro' },
        { name: 'Carbs', amount: item.macros.carbs, unit: 'g', category: 'macro' },
        ...item.micros.map(m => ({ name: m.name, amount: m.amount, unit: m.unit, category: 'micro' as const }))
      ]
    }));

    setLogs(prev => [...prev, ...newItems]);
    setShowResult(null);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <header className="p-6 pb-2 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">NutriMap AI</h1>
            <p className="text-sm text-slate-500">Fuel your body intelligently</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowRdaMapper(true)}
              className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm active:scale-95 transition-transform"
            >
              <MapIcon size={20} />
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Zap size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div 
              onClick={() => setShowRdaMapper(true)}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Target size={18} className="text-indigo-600" />
                  Today's Progress
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  {Math.round((todayStats.calories / rda.calories) * 100)}% Goal
                </span>
              </div>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * Math.min(todayStats.calories / rda.calories, 1))} strokeLinecap="round" className="text-indigo-600 transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-bold text-slate-900">{todayStats.calories}</span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">kcal</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Target</span>
                    <span className="font-semibold text-slate-800">{rda.calories} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Remaining</span>
                    <span className="font-semibold text-indigo-600">{Math.max(0, rda.calories - todayStats.calories)} kcal</span>
                  </div>
                  <div className="pt-2">
                    <button className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                      VIEW FULL RDA MAP <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <NutrientProgress label="Protein" current={Math.round(todayStats.protein)} target={rda.protein} unit="g" color="bg-blue-500" />
                <NutrientProgress label="Fats" current={Math.round(todayStats.fat)} target={rda.fat} unit="g" color="bg-amber-500" />
                <NutrientProgress label="Carbs" current={Math.round(todayStats.carbs)} target={rda.carbs} unit="g" color="bg-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setIsCapturing(true)} className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95 transition-transform">
                <div className="p-2 bg-white/10 rounded-xl"><Camera size={24} /></div>
                <span className="font-medium">Snap Food</span>
              </button>
              <button onClick={() => setActiveTab('logs')} className="bg-white border border-slate-200 text-slate-900 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <div className="p-2 bg-slate-100 rounded-xl"><Wand2 size={24} className="text-indigo-600" /></div>
                <span className="font-medium">Magic Log</span>
              </button>
            </div>

            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/30 overflow-hidden relative">
              <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/10" />
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Nutrient Gap Finder</h3>
                <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                  Based on today's logs, you're tracking well on protein but could use more micronutrients like Vitamin C.
                </p>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-indigo-600"><Utensils size={18} /></div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold">AI Suggestion</p>
                    <p className="text-indigo-200">Add a small bowl of citrus berries or spinach.</p>
                  </div>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-800">AI Nutrient Mapping</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">Describe what you ate. AI will map it to your nutrition goals.</p>
              <div className="relative">
                <textarea rows={3} placeholder="Example: 2 scrambled eggs, avocado toast..." className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                {suggestions.length > 0 && (
                  <div ref={suggestionsRef} className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
                    {suggestions.map((s, idx) => (
                      <button key={idx} onClick={() => selectSuggestion(s)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-none flex items-center justify-between group">
                        <span className="text-slate-700 font-medium">{s}</span>
                        <Plus size={14} className="text-slate-300 group-hover:text-indigo-600" />
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => handleAnalyze()} disabled={!textInput || isAnalyzing} className="mt-3 w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                  {isAnalyzing ? <><Loader2 className="animate-spin" size={18} /> Mapping...</> : <><Sparkles size={18} /> Magic Analyze</>}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={18} /> History</h3>
              </div>
              {logs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200"><p className="text-sm text-slate-400">No logs yet today</p></div>
              ) : (
                logs.sort((a,b) => b.timestamp - a.timestamp).map((log) => (
                  <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Utensils size={20} /></div>
                      <div>
                        <h4 className="font-bold text-slate-900">{log.name}</h4>
                        <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                          <span>P: {Math.round(log.nutrients.find(n => n.name === 'Protein')?.amount || 0)}g</span>
                          <span>F: {Math.round(log.nutrients.find(n => n.name === 'Fat')?.amount || 0)}g</span>
                          <span>C: {Math.round(log.nutrients.find(n => n.name === 'Carbs')?.amount || 0)}g</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{log.calories} kcal</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">JD</div>
              <h2 className="text-xl font-bold text-slate-900">John Doe</h2>
              <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="bg-slate-50 p-3 rounded-2xl"><p className="text-[10px] text-slate-400 font-bold">Weight</p><p className="font-bold text-slate-800">{userProfile.weight}kg</p></div>
                <div className="bg-slate-50 p-3 rounded-2xl"><p className="text-[10px] text-slate-400 font-bold">Goal</p><p className="font-bold text-slate-800 text-[10px] uppercase">{userProfile.goal.replace('-', ' ')}</p></div>
                <div className="bg-slate-50 p-3 rounded-2xl"><p className="text-[10px] text-slate-400 font-bold">Age</p><p className="font-bold text-slate-800">{userProfile.age}</p></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RDA Mapper Modal */}
      {showRdaMapper && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900">RDA Nutrient Map</h2>
              <button onClick={() => setShowRdaMapper(false)} className="p-2 bg-slate-100 rounded-full"><CloseIcon size={20} /></button>
            </div>
            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Macronutrients</h4>
                <div className="space-y-4">
                  <NutrientProgress label="Protein" current={Math.round(todayStats.protein)} target={rda.protein} unit="g" color="bg-blue-500" />
                  <NutrientProgress label="Fats" current={Math.round(todayStats.fat)} target={rda.fat} unit="g" color="bg-amber-500" />
                  <NutrientProgress label="Carbs" current={Math.round(todayStats.carbs)} target={rda.carbs} unit="g" color="bg-emerald-500" />
                </div>
              </section>
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Micronutrients</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400">Iron</p>
                    <p className="text-lg font-bold">{Math.round(todayStats.iron)} / {rda.iron}mg</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400">Calcium</p>
                    <p className="text-lg font-bold">{Math.round(todayStats.calcium)} / {rda.calcium}mg</p>
                  </div>
                </div>
              </section>
              <button onClick={() => setShowRdaMapper(false)} className="w-full bg-slate-100 py-4 rounded-2xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Analysis Result</h2>
              <button onClick={() => setShowResult(null)} className="p-2 bg-slate-100 rounded-full"><CloseIcon size={20} /></button>
            </div>
            <div className="space-y-6">
              {showResult.items.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-xs text-slate-500">{item.portion} • {item.calories} kcal</p>
                </div>
              ))}
              <div className="bg-indigo-50 p-4 rounded-2xl">
                <h5 className="font-bold text-indigo-900 text-sm mb-1">AI Summary</h5>
                <p className="text-indigo-700 text-xs">{showResult.summary}</p>
              </div>
              <button onClick={confirmLoggedFood} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Log to Dairy</button>
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      {isCapturing && <CameraInput onCapture={(base64) => handleAnalyze(base64)} onCancel={() => setIsCapturing(false)} />}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[60] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Analyzing Nutrients</h2>
          <p className="text-slate-500">Processing food items and mapping your targets...</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 z-30">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold uppercase">Home</span>
          </button>
          <div className="relative -top-10">
            <button onClick={() => setIsCapturing(true)} className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
              <Camera size={28} />
            </button>
          </div>
          <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center transition-colors ${activeTab === 'logs' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <History size={24} />
            <span className="text-[10px] font-bold uppercase">Logs</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center transition-colors ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <User size={24} />
            <span className="text-[10px] font-bold uppercase">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
