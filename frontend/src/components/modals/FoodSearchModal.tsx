'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Plus,
  Minus,
  Sparkles,
  QrCode,
  Zap,
  Check,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Food, ParsedFoodItem } from '@/lib/types';
import { api } from '@/lib/api';

interface FoodSearchModalProps {
  isOpen: boolean;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  logDate?: string;
  onClose: () => void;
  onFoodAdded: () => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  mealType,
  logDate,
  onClose,
  onFoodAdded,
}) => {
  const [currentMealType, setCurrentMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>(mealType);
  const [activeTab, setActiveTab] = useState<'search' | 'ai' | 'barcode' | 'quick'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

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
  const [quickServings, setQuickServings] = useState('1');

  // Barcode State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeFood, setBarcodeFood] = useState<Food | null>(null);
  const [barcodeServings, setBarcodeServings] = useState(1.0);

  // Selected food for serving / quantity adjustment modal
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState<number>(1.0);
  const [servingsInput, setServingsInput] = useState<string>('1');
  const [portionMode, setPortionMode] = useState<'serving' | 'gram'>('serving');
  const [customGrams, setCustomGrams] = useState<string>('100');

  useEffect(() => {
    setCurrentMealType(mealType);
  }, [mealType]);

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

  const openServingModal = (food: Food) => {
    setSelectedFood(food);
    setServings(1.0);
    setServingsInput('1');
    const isGramUnit = food.servingUnit?.toLowerCase().includes('g') || food.servingUnit?.toLowerCase().includes('gam');
    setPortionMode(isGramUnit ? 'gram' : 'serving');
    const standardSize = food.servingSize > 0 ? food.servingSize : 100;
    setCustomGrams(String(standardSize));
  };

  const handleServingsInputChange = (val: string) => {
    setServingsInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setServings(num);
      const standardSize = selectedFood?.servingSize || 100;
      setCustomGrams(String(Math.round(num * standardSize)));
    }
  };

  const handleCustomGramsChange = (val: string) => {
    setCustomGrams(val);
    const g = parseFloat(val);
    const standardSize = selectedFood?.servingSize || 100;
    if (!isNaN(g) && g > 0 && standardSize > 0) {
      const calcServings = Math.round((g / standardSize) * 100) / 100;
      setServings(calcServings);
      setServingsInput(String(calcServings));
    }
  };

  const stepServing = (delta: number) => {
    const next = Math.max(0.1, Math.round((servings + delta) * 10) / 10);
    setServings(next);
    setServingsInput(String(next));
    const standardSize = selectedFood?.servingSize || 100;
    setCustomGrams(String(Math.round(next * standardSize)));
  };

  const stepGrams = (delta: number) => {
    const currentG = parseFloat(customGrams) || 100;
    const nextG = Math.max(10, currentG + delta);
    handleCustomGramsChange(String(nextG));
  };

  const selectPresetServing = (val: number) => {
    setServings(val);
    setServingsInput(String(val));
    const standardSize = selectedFood?.servingSize || 100;
    setCustomGrams(String(Math.round(val * standardSize)));
  };

  const handleLogFood = async (food: Food, s: number = 1.0) => {
    const effectiveServings = s > 0 ? s : 1.0;
    try {
      await api.logMeal({
        logDate: logDate || new Date().toISOString().split('T')[0],
        mealType: currentMealType,
        foodName: food.name,
        foodId: food.id,
        servings: effectiveServings,
        calories: Math.round(food.calories * effectiveServings * 10) / 10,
        proteinG: Math.round(food.proteinG * effectiveServings * 10) / 10,
        carbsG: Math.round(food.carbsG * effectiveServings * 10) / 10,
        fatG: Math.round(food.fatG * effectiveServings * 10) / 10,
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

  const handleUpdateAiItemQuantity = (index: number, newQty: number) => {
    const validQty = Math.max(0.1, Math.round(newQty * 10) / 10);
    setAiParsedItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const currentQty = item.quantity > 0 ? item.quantity : 1.0;
        const ratio = validQty / currentQty;
        return {
          ...item,
          quantity: validQty,
          calories: Math.round(item.calories * ratio),
          proteinG: Math.round(item.proteinG * ratio * 10) / 10,
          carbsG: Math.round(item.carbsG * ratio * 10) / 10,
          fatG: Math.round(item.fatG * ratio * 10) / 10,
        };
      })
    );
  };

  const handleAddAiItem = async (item: ParsedFoodItem) => {
    try {
      await api.logMeal({
        logDate: logDate || new Date().toISOString().split('T')[0],
        mealType: currentMealType,
        foodName: item.matchedFoodName,
        foodId: item.foodId,
        servings: item.quantity,
        calories: Math.round(item.calories * 10) / 10,
        proteinG: Math.round(item.proteinG * 10) / 10,
        carbsG: Math.round(item.carbsG * 10) / 10,
        fatG: Math.round(item.fatG * 10) / 10,
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
    const s = parseFloat(quickServings) || 1.0;

    try {
      await api.logMeal({
        logDate: logDate || new Date().toISOString().split('T')[0],
        mealType: currentMealType,
        foodName: quickName.trim() || 'Nhập nhanh calo',
        servings: s,
        calories: Math.round(cals * s * 10) / 10,
        proteinG: Math.round((parseFloat(quickProtein) || 0) * s * 10) / 10,
        carbsG: Math.round((parseFloat(quickCarbs) || 0) * s * 10) / 10,
        fatG: Math.round((parseFloat(quickFat) || 0) * s * 10) / 10,
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
      setBarcodeServings(1.0);
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

  // Live nutritional calculations for selected food
  const effectiveServings = servings > 0 ? servings : 1.0;
  const liveCalories = selectedFood ? Math.round(selectedFood.calories * effectiveServings) : 0;
  const liveProtein = selectedFood ? Math.round(selectedFood.proteinG * effectiveServings * 10) / 10 : 0;
  const liveCarbs = selectedFood ? Math.round(selectedFood.carbsG * effectiveServings * 10) / 10 : 0;
  const liveFat = selectedFood ? Math.round(selectedFood.fatG * effectiveServings * 10) / 10 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border space-y-2.5 bg-[#0F111C]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Thêm món vào <span className="text-brand-blue">{mealLabels[currentMealType]}</span>
              </h2>
              <p className="text-[11px] text-gray-400">Chọn bữa bạn muốn nạp thức ăn:</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1A1D2A] hover:bg-[#252B40] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[320px]">
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
                      onClick={() => openServingModal(food)}
                      className="p-3 bg-[#161926] hover:bg-[#1D2132] border border-border/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-brand-blue transition-colors">
                            {food.name}
                          </h4>
                          {food.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          1 phần chuẩn = {food.servingSize} {food.servingUnit} • {food.brand || 'Viện Dinh Dưỡng'}
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
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openServingModal(food);
                          }}
                          title="Chọn số lượng & Thêm món"
                          className="w-8 h-8 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all ml-1 active:scale-90"
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
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Kết quả bóc tách ({aiParsedItems.length} món) • Có thể chỉnh số lượng:
                  </h4>
                  {aiParsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#161926] border border-border rounded-2xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold text-white">{item.matchedFoodName}</h5>
                          <p className="text-[11px] text-gray-400">
                            {item.proteinG}g P • {item.carbsG}g C • {item.fatG}g F
                          </p>
                        </div>
                        <span className="font-mono font-bold text-white text-base">
                          {item.calories} <span className="text-[10px] text-gray-400">kcal</span>
                        </span>
                      </div>

                      {/* Stepper for Quantity adjustment */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                        <div className="flex items-center gap-1.5 bg-[#1A1D2A] px-2 py-1 rounded-xl border border-border/60">
                          <button
                            type="button"
                            onClick={() => handleUpdateAiItemQuantity(idx, item.quantity - 0.5)}
                            className="w-6 h-6 rounded-lg bg-[#252B40] text-white flex items-center justify-center text-xs active:scale-95"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs text-white min-w-[28px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateAiItemQuantity(idx, item.quantity + 0.5)}
                            className="w-6 h-6 rounded-lg bg-[#252B40] text-white flex items-center justify-center text-xs active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-[11px] text-gray-400 ml-1">{item.unit || 'phần'}</span>
                        </div>

                        <button
                          onClick={() => handleAddAiItem(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-blue text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm món
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
                  className="px-4 py-2.5 rounded-2xl bg-brand-cyan text-black font-bold text-xs flex items-center gap-1.5 active:scale-95"
                >
                  {barcodeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Tra cứu
                </button>
              </div>

              {barcodeFood && (
                <div className="p-4 bg-[#161926] border border-brand-cyan/40 rounded-2xl space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{barcodeFood.name}</h4>
                      <p className="text-xs text-gray-400">{barcodeFood.brand} • Chuẩn: {barcodeFood.servingSize} {barcodeFood.servingUnit}</p>
                    </div>
                    <span className="text-lg font-extrabold text-white font-mono">
                      {Math.round(barcodeFood.calories * barcodeServings)} <span className="text-xs text-gray-400 font-normal">kcal</span>
                    </span>
                  </div>

                  {/* Barcode Quantity Stepper */}
                  <div className="space-y-2 bg-[#1A1D2A] p-3 rounded-2xl border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300 font-semibold">Chọn số lượng:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBarcodeServings((s) => Math.max(0.1, Math.round((s - 0.5) * 10) / 10))}
                          className="w-7 h-7 rounded-lg bg-[#252B40] text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-white text-sm min-w-[32px] text-center">
                          {barcodeServings}x
                        </span>
                        <button
                          type="button"
                          onClick={() => setBarcodeServings((s) => Math.round((s + 0.5) * 10) / 10)}
                          className="w-7 h-7 rounded-lg bg-[#252B40] text-white flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      {[0.5, 1.0, 1.5, 2.0].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBarcodeServings(val)}
                          className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold ${
                            barcodeServings === val ? 'bg-brand-cyan text-black' : 'bg-[#12141D] text-gray-400'
                          }`}
                        >
                          {val}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-[#1A1D2A] p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Đạm</span>
                      <span className="font-bold text-macro-protein">{Math.round(barcodeFood.proteinG * barcodeServings * 10) / 10}g</span>
                    </div>
                    <div className="bg-[#1A1D2A] p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Carb</span>
                      <span className="font-bold text-macro-carbs">{Math.round(barcodeFood.carbsG * barcodeServings * 10) / 10}g</span>
                    </div>
                    <div className="bg-[#1A1D2A] p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Béo</span>
                      <span className="font-bold text-macro-fat">{Math.round(barcodeFood.fatG * barcodeServings * 10) / 10}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLogFood(barcodeFood, barcodeServings)}
                    className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Check className="w-4 h-4" /> Xác nhận thêm {barcodeServings}x vào {mealLabels[currentMealType]}
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
                  placeholder="Ví dụ: Bữa trưa văn phòng, Cơm sườn trứng"
                  className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Tổng Calo 1 phần (kcal) *</label>
                  <input
                    type="number"
                    required
                    value={quickCals}
                    onChange={(e) => setQuickCals(e.target.value)}
                    placeholder="Ví dụ: 550"
                    className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Số lượng phần ăn</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={quickServings}
                    onChange={(e) => setQuickServings(e.target.value)}
                    placeholder="1.0"
                    className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-blue"
                  />
                </div>
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
                className="w-full py-2.5 rounded-2xl bg-brand-amber text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md mt-2 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current" />
                Lưu nhanh {parseFloat(quickServings) || 1} phần Calo
              </button>
            </form>
          )}
        </div>

        {/* Dedicated Serving / Quantity Selection Dialog Overlay */}
        {selectedFood && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setSelectedFood(null)}
          >
            <div
              className="bg-[#121522] border border-border/90 rounded-3xl w-full max-w-sm p-4 sm:p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Food Header */}
              <div className="flex justify-between items-start border-b border-border/60 pb-3">
                <div className="pr-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                      {selectedFood.name}
                    </h3>
                    {selectedFood.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Chuẩn: <span className="text-gray-200 font-semibold">{selectedFood.servingSize} {selectedFood.servingUnit}</span>
                    {selectedFood.brand ? ` • ${selectedFood.brand}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="w-8 h-8 rounded-full bg-[#1A1D2A] hover:bg-[#252B40] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Meal Selector Inside Serving Modal */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400">Ghi nhận vào bữa:</label>
                <div className="grid grid-cols-4 gap-1.5 bg-[#181B28] p-1 rounded-2xl border border-border/60">
                  {[
                    { id: 'BREAKFAST', label: 'Sáng' },
                    { id: 'LUNCH', label: 'Trưa' },
                    { id: 'DINNER', label: 'Tối' },
                    { id: 'SNACK', label: 'Phụ' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCurrentMealType(m.id as any)}
                      className={`py-1 rounded-xl text-xs font-semibold text-center transition-all ${
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

              {/* Unit Mode Switcher: Servings vs Grams */}
              <div className="flex bg-[#181B28] p-1 rounded-2xl border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => setPortionMode('serving')}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                    portionMode === 'serving'
                      ? 'bg-[#252B40] text-white shadow'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Theo Khẩu phần ({selectedFood.servingUnit || 'phần'})
                </button>
                <button
                  type="button"
                  onClick={() => setPortionMode('gram')}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                    portionMode === 'gram'
                      ? 'bg-[#252B40] text-white shadow'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Theo Grams (g)
                </button>
              </div>

              {/* Stepper & Custom Number Input */}
              {portionMode === 'serving' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 bg-[#181B28] p-2.5 rounded-2xl border border-border/60">
                    <button
                      type="button"
                      onClick={() => stepServing(-0.5)}
                      className="w-10 h-10 rounded-xl bg-[#22273A] hover:bg-[#2C334D] text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="flex-1 flex flex-col items-center">
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          value={servingsInput}
                          onChange={(e) => handleServingsInputChange(e.target.value)}
                          className="w-20 text-center font-mono font-black text-2xl text-white bg-transparent border-b border-brand-blue/60 focus:border-brand-blue focus:outline-none pb-0.5"
                        />
                        <span className="text-xs text-gray-400 font-semibold">
                          {selectedFood.servingUnit || 'phần'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        ≈ {Math.round(effectiveServings * (selectedFood.servingSize || 100))}g
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => stepServing(0.5)}
                      className="w-10 h-10 rounded-xl bg-[#22273A] hover:bg-[#2C334D] text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex items-center justify-between gap-1.5">
                    {[0.5, 1.0, 1.5, 2.0, 3.0].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => selectPresetServing(val)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          servings === val
                            ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30 scale-105'
                            : 'bg-[#181B28] hover:bg-[#22273A] text-gray-300'
                        }`}
                      >
                        {val}x
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 bg-[#181B28] p-2.5 rounded-2xl border border-border/60">
                    <button
                      type="button"
                      onClick={() => stepGrams(-25)}
                      className="w-10 h-10 rounded-xl bg-[#22273A] hover:bg-[#2C334D] text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="flex-1 flex flex-col items-center">
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number"
                          step="10"
                          min="1"
                          max="5000"
                          value={customGrams}
                          onChange={(e) => handleCustomGramsChange(e.target.value)}
                          className="w-24 text-center font-mono font-black text-2xl text-white bg-transparent border-b border-brand-cyan/60 focus:border-brand-cyan focus:outline-none pb-0.5"
                        />
                        <span className="text-xs text-gray-400 font-semibold">gram (g)</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        ≈ {effectiveServings} phần chuẩn
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => stepGrams(25)}
                      className="w-10 h-10 rounded-xl bg-[#22273A] hover:bg-[#2C334D] text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Gram Pills */}
                  <div className="flex items-center justify-between gap-1.5">
                    {[50, 100, 150, 200, 300].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleCustomGramsChange(String(val))}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          Math.round(parseFloat(customGrams)) === val
                            ? 'bg-brand-cyan text-black shadow-md shadow-brand-cyan/30 scale-105'
                            : 'bg-[#181B28] hover:bg-[#22273A] text-gray-300'
                        }`}
                      >
                        {val}g
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Nutrition Summary Box */}
              <div className="bg-[#181B28] border border-border/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-baseline justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-gray-400 font-semibold">Năng lượng nạp vào:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-white font-mono">{liveCalories}</span>
                    <span className="text-xs text-gray-400 font-semibold">kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-0.5">
                  <div className="bg-[#121522] p-2 rounded-xl border border-brand-blue/20">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Đạm (P)</span>
                    <span className="font-mono font-bold text-macro-protein">{liveProtein}g</span>
                  </div>
                  <div className="bg-[#121522] p-2 rounded-xl border border-brand-cyan/20">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Carb (C)</span>
                    <span className="font-mono font-bold text-macro-carbs">{liveCarbs}g</span>
                  </div>
                  <div className="bg-[#121522] p-2 rounded-xl border border-brand-amber/20">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Béo (F)</span>
                    <span className="font-mono font-bold text-macro-fat">{liveFat}g</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => handleLogFood(selectedFood, effectiveServings)}
                className="w-full py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/30 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>
                  Thêm vào {mealLabels[currentMealType]} • {liveCalories} kcal
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
