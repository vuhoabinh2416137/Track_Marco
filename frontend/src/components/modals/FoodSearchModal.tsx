'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Sparkles, QrCode, Zap, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import { Food, MealLog, ParsedFoodItem } from '@/lib/types';
import { api } from '@/lib/api';

interface FoodSearchModalProps {
  isOpen: boolean;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  onClose: () => void;
  onFoodAdded: () => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  mealType,
  onClose,
  onFoodAdded,
}) => {
  const [currentMealType, setCurrentMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>(mealType);
  const [activeTab, setActiveTab] = useState<'search' | 'ai' | 'barcode' | 'quick'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentMealType(mealType);
  }, [mealType]);

  // AI Prompt State
  const [aiText, setAiText] = useState('');
  const [aiParsedItems, setAiParsedItems] = useState<ParsedFoodItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Quick Add State
  const [quickName, setQuickName] = useState('');
  const [quickCals, setQuickCals] = useState('');
  const [quickProtein, setQuickProtein] = useState('');
  const [quickCarbs, setQuickCarbs] = useState('');
  const [quickFat, setQuickFat] = useState('');

  // Barcode State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeFood, setBarcodeFood] = useState<Food | null>(null);

  // Selected food for serving adjustment
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState(1.0);

  useEffect(() => {
    if (isOpen) {
      handleSearch('');
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    try {
      const foods = await api.searchFoods(query);
      setSearchResults(foods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogFood = async (food: Food, s: number = 1.0) => {
    try {
      await api.logMeal({
        mealType: currentMealType,
        foodName: food.name,
        foodId: food.id,
        servings: s,
        calories: Math.round(food.calories * s * 10) / 10,
        proteinG: Math.round(food.proteinG * s * 10) / 10,
        carbsG: Math.round(food.carbsG * s * 10) / 10,
        fatG: Math.round(food.fatG * s * 10) / 10,
      });
      setSelectedFood(null);
      onFoodAdded();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleParseAi = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const items = await api.parseAiFood(aiText);
      setAiParsedItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAiItem = async (item: ParsedFoodItem) => {
    try {
      await api.logMeal({
        mealType: currentMealType,
        foodName: item.matchedFoodName,
        foodId: item.foodId,
        servings: item.quantity,
        calories: item.calories,
        proteinG: item.proteinG,
        carbsG: item.carbsG,
        fatG: item.fatG,
      });
      onFoodAdded();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cals = parseFloat(quickCals) || 0;
    if (cals <= 0) return;

    try {
      await api.logMeal({
        mealType: currentMealType,
        foodName: quickName.trim() || 'Nhập nhanh calo',
        servings: 1.0,
        calories: cals,
        proteinG: parseFloat(quickProtein) || 0,
        carbsG: parseFloat(quickCarbs) || 0,
        fatG: parseFloat(quickFat) || 0,
      });
      onFoodAdded();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBarcodeLookup = async (code: string) => {
    if (!code.trim()) return;
    setBarcodeLoading(true);
    try {
      const food = await api.getFoodByBarcode(code.trim());
      setBarcodeFood(food);
    } catch (err) {
      alert('Không tìm thấy món ăn với mã vạch này trong kho dữ liệu!');
      setBarcodeFood(null);
    } finally {
      setBarcodeLoading(false);
    }
  };

  if (!isOpen) return null;

  const mealLabels = {
    BREAKFAST: 'Bữa Sáng',
    LUNCH: 'Bữa Trưa',
    DINNER: 'Bữa Tối',
    SNACK: 'Bữa Phụ',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Thêm món vào <span className="text-brand-blue">{mealLabels[currentMealType]}</span>
              </h2>
              <p className="text-[11px] text-gray-400">Chọn bữa bạn muốn nạp thức ăn:</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1A1D2A] flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Meal Selector Pills */}
          <div className="grid grid-cols-4 gap-1.5 bg-[#12141D] p-1 rounded-2xl border border-border">
            {[
              { id: 'BREAKFAST', label: 'Bữa Sáng' },
              { id: 'LUNCH', label: 'Bữa Trưa' },
              { id: 'DINNER', label: 'Bữa Tối' },
              { id: 'SNACK', label: 'Bữa Phụ' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setCurrentMealType(m.id as any)}
                className={`py-1.5 px-1 rounded-xl text-xs font-semibold text-center transition-all ${
                  currentMealType === m.id
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border px-3 bg-[#0D0F16]">
          {[
            { id: 'search', label: 'Tìm kiếm', icon: Search },
            { id: 'ai', label: 'AI Voice/Text', icon: Sparkles },
            { id: 'barcode', label: 'Mã vạch', icon: QrCode },
            { id: 'quick', label: 'Nhập nhanh', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-brand-blue text-brand-blue bg-brand-blue/5'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {/* TAB 1: SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Gõ tên món (Phở, ức gà, bánh mì, cơm tấm...)"
                  className="w-full bg-[#1A1D2A] border border-border rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-blue" />
                  <span className="text-xs">Đang tìm kiếm món ăn...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="p-3 bg-[#161926] hover:bg-[#1D2132] border border-border/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-white tracking-tight">{food.name}</h4>
                          {food.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {food.servingSize} {food.servingUnit} • {food.brand || 'Viện Dinh Dưỡng'}
                        </p>
                        <div className="flex gap-2 text-[10px] text-gray-300 font-mono mt-1">
                          <span className="text-macro-protein font-semibold">{food.proteinG}g P</span>
                          <span className="text-macro-carbs font-semibold">{food.carbsG}g C</span>
                          <span className="text-macro-fat font-semibold">{food.fatG}g F</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <span className="text-base font-extrabold text-white font-mono">
                            {Math.round(food.calories)}
                          </span>
                          <span className="text-[10px] text-gray-400 block -mt-1">kcal</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogFood(food, 1.0);
                          }}
                          className="w-8 h-8 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all ml-1"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI NATURAL LANGUAGE */}
          {activeTab === 'ai' && (
            <div className="space-y-3">
              <div className="p-3 bg-brand-purple/10 border border-brand-purple/30 rounded-2xl text-xs text-brand-purple leading-relaxed">
                💡 <span className="font-semibold">Mẹo:</span> Gõ câu nói tự nhiên như khi bạn gọi đồ ăn:
                <br />
                <span className="italic text-gray-300">"1 tô phở bò tái gầu 1 trứng trần và 1 ly cà phê sữa đá"</span>
              </div>

              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Nhập những gì bạn đã ăn..."
                rows={3}
                className="w-full bg-[#1A1D2A] border border-border rounded-2xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors resize-none"
              />

              <button
                onClick={handleParseAi}
                disabled={aiLoading || !aiText.trim()}
                className="w-full py-2.5 rounded-2xl bg-brand-purple text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {aiLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Bóc tách Calo & Macro tự động
              </button>

              {aiParsedItems.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Kết quả bóc tách ({aiParsedItems.length} món)
                  </h4>
                  {aiParsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#161926] border border-border rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-sm font-semibold text-white">{item.matchedFoodName}</h5>
                        <p className="text-[11px] text-gray-400">
                          {item.quantity} {item.unit} • {item.proteinG}g P, {item.carbsG}g C, {item.fatG}g F
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white text-sm">
                          {item.calories} <span className="text-[10px] text-gray-400">kcal</span>
                        </span>
                        <button
                          onClick={() => handleAddAiItem(item)}
                          className="px-3 py-1.5 rounded-xl bg-brand-blue text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BARCODE */}
          {activeTab === 'barcode' && (
            <div className="space-y-4">
              <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl text-xs text-brand-cyan leading-relaxed">
                📷 Nhập mã vạch sản phẩm (hoặc thử mã mẫu: <span className="font-mono font-bold text-white">8934673123456</span> cho sữa Vinamilk, <span className="font-mono font-bold text-white">8935049500544</span> cho Mì Hảo Hảo)
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Nhập mã vạch 13 số..."
                  className="flex-1 bg-[#1A1D2A] border border-border rounded-2xl px-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-brand-cyan"
                />
                <button
                  onClick={() => handleBarcodeLookup(barcodeInput)}
                  disabled={barcodeLoading || !barcodeInput.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-brand-cyan text-black font-bold text-xs flex items-center gap-1.5"
                >
                  {barcodeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Tra cứu
                </button>
              </div>

              {barcodeFood && (
                <div className="p-4 bg-[#161926] border border-brand-cyan/40 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{barcodeFood.name}</h4>
                      <p className="text-xs text-gray-400">{barcodeFood.brand} • {barcodeFood.servingSize} {barcodeFood.servingUnit}</p>
                    </div>
                    <span className="text-lg font-extrabold text-white font-mono">
                      {barcodeFood.calories} <span className="text-xs text-gray-400 font-normal">kcal</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-[#1A1D2A] p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Đạm</span>
                      <span className="font-bold text-macro-protein">{barcodeFood.proteinG}g</span>
                    </div>
                    <div className="bg-[#1A1D2A] p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Carb</span>
                      <span className="font-bold text-macro-carbs">{barcodeFood.carbsG}g</span>
                    </div>
                    <div className="bg-[#1A1D2A] p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Béo</span>
                      <span className="font-bold text-macro-fat">{barcodeFood.fatG}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLogFood(barcodeFood, 1.0)}
                    className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Xác nhận thêm vào {mealLabels[currentMealType]}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUICK ADD */}
          {activeTab === 'quick' && (
            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Mô tả món ăn (tùy chọn)</label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Ví dụ: Bữa trưa văn phòng"
                  className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Tổng Calo (kcal) *</label>
                <input
                  type="number"
                  required
                  value={quickCals}
                  onChange={(e) => setQuickCals(e.target.value)}
                  placeholder="Ví dụ: 550"
                  className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-macro-protein block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(e.target.value)}
                    placeholder="30"
                    className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-2.5 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-macro-carbs block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={quickCarbs}
                    onChange={(e) => setQuickCarbs(e.target.value)}
                    placeholder="60"
                    className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-2.5 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-macro-fat block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={quickFat}
                    onChange={(e) => setQuickFat(e.target.value)}
                    placeholder="15"
                    className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-2.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-brand-amber text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md mt-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                Lưu nhanh Calo
              </button>
            </form>
          )}
        </div>

        {/* Serving Adjustment Modal Overlay */}
        {selectedFood && (
          <div className="p-4 bg-[#141724] border-t border-border rounded-t-3xl space-y-3 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedFood.name}</h4>
                <p className="text-xs text-gray-400">
                  1 phần = {selectedFood.servingSize} {selectedFood.servingUnit}
                </p>
              </div>
              <button onClick={() => setSelectedFood(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#1A1D2A] p-3 rounded-2xl">
              <span className="text-xs text-gray-300 font-semibold">Khẩu phần:</span>
              <div className="flex items-center gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((val) => (
                  <button
                    key={val}
                    onClick={() => setServings(val)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                      servings === val ? 'bg-brand-blue text-white' : 'bg-[#12141D] text-gray-400'
                    }`}
                  >
                    {val}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono px-1">
              <span className="text-white font-bold">{Math.round(selectedFood.calories * servings)} kcal</span>
              <span className="text-macro-protein">{Math.round(selectedFood.proteinG * servings)}g P</span>
              <span className="text-macro-carbs">{Math.round(selectedFood.carbsG * servings)}g C</span>
              <span className="text-macro-fat">{Math.round(selectedFood.fatG * servings)}g F</span>
            </div>

            <button
              onClick={() => handleLogFood(selectedFood, servings)}
              className="w-full py-2.5 rounded-2xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" /> Xác nhận thêm món
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
