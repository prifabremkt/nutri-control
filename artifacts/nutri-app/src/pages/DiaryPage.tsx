import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Flame, Droplets, Plus, Trash2, Search, Pencil, X } from "lucide-react";
import {
  useGetDiaryEntries,
  useAddDiaryEntry,
  useDeleteDiaryEntry,
  useGetHydration,
  useAddHydration,
  useSearchFoods,
  useGetProfile,
  getGetDiaryEntriesQueryKey,
  getGetHydrationQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

function MacroRing({ value, max, label, unit, color }: {
  value: number; max: number; label: string; unit: string; color: string;
}) {
  const pct = Math.min(value / (max || 1), 1);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#f0f0f0" strokeWidth="8" />
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-gray-800">{Math.round(value)}</span>
          <span className="text-xs text-gray-400">/{Math.round(max)}{unit}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-xs text-gray-400">{Math.max(0, Math.round(max - value))}{unit} restam</span>
    </div>
  );
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Cafe da manha",
  lunch: "Almoco",
  dinner: "Jantar",
  snack: "Lanche",
};

export default function DiaryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("lunch");
  const [searchMode, setSearchMode] = useState<"taco" | "manual">("taco");
  const [searchQuery, setSearchQuery] = useState("");
  const [manualFood, setManualFood] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", quantity: "100" });

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const queryClient = useQueryClient();

  const { data: diary, isLoading: diaryLoading } = useGetDiaryEntries(
    { date: dateStr },
    { query: { enabled: !!dateStr, queryKey: getGetDiaryEntriesQueryKey({ date: dateStr }) } }
  );
  const { data: hydration } = useGetHydration(
    { date: dateStr },
    { query: { enabled: !!dateStr, queryKey: getGetHydrationQueryKey({ date: dateStr }) } }
  );
  const { data: profile } = useGetProfile();

  const addEntry = useAddDiaryEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDiaryEntriesQueryKey({ date: dateStr }) });
        setShowAddFood(false);
        setSearchQuery("");
        setManualFood({ name: "", calories: "", protein: "", carbs: "", fat: "", quantity: "100" });
      },
    },
  });
  const deleteEntry = useDeleteDiaryEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDiaryEntriesQueryKey({ date: dateStr }) });
      },
    },
  });
  const addHydration = useAddHydration({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetHydrationQueryKey({ date: dateStr }) });
      },
    },
  });

  const { data: searchResults } = useSearchFoods(
    { q: searchQuery, limit: 15 },
    { query: { enabled: searchQuery.length >= 2 } }
  );

  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const totalCal = diary?.totalCalories ?? 0;
  const targetCal = profile?.targetCalories ?? 2000;
  const calRemain = Math.max(0, targetCal - totalCal);
  const calPct = Math.min(totalCal / (targetCal || 1), 1);

  const totalWater = hydration?.totalMl ?? 0;
  const targetWater = profile?.targetWaterMl ?? 2500;

  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

  function handleAddFromTaco(food: { id: number; name: string; calories: number; proteinG: number; carbsG: number; fatG: number; servingG: number }) {
    const qty = 100;
    const ratio = qty / (food.servingG || 100);
    addEntry.mutate({
      date: dateStr,
      mealType: selectedMeal,
      foodId: food.id,
      foodName: food.name,
      quantityG: qty,
      calories: food.calories * ratio,
      proteinG: food.proteinG * ratio,
      carbsG: food.carbsG * ratio,
      fatG: food.fatG * ratio,
    });
  }

  function handleManualAdd() {
    if (!manualFood.name || !manualFood.calories) return;
    const qty = parseFloat(manualFood.quantity) || 100;
    addEntry.mutate({
      date: dateStr,
      mealType: selectedMeal,
      foodName: manualFood.name,
      quantityG: qty,
      calories: parseFloat(manualFood.calories) || 0,
      proteinG: parseFloat(manualFood.protein) || 0,
      carbsG: parseFloat(manualFood.carbs) || 0,
      fatG: parseFloat(manualFood.fat) || 0,
    });
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-500 text-white pt-12 pb-6 px-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-violet-200">Bem-vindo de volta</p>
            <h1 className="text-2xl font-bold">{profile?.name ?? "Voce"}</h1>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "IMC", value: profile?.bmi?.toFixed(1) ?? "—" },
            { label: "TMB", value: profile?.bmr ? `${Math.round(profile.bmr)}` : "—" },
            { label: "TDEE", value: profile?.tdee ? `${Math.round(profile.tdee)}` : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs text-violet-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Nav */}
      <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
        {/* Date navigator */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-gray-800">
            {isToday ? "Hoje" : format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
          </span>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Calories */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Calorias</p>
                <p className="text-xl font-bold text-gray-800">{Math.round(totalCal)} <span className="text-sm font-normal text-gray-400">/ {Math.round(targetCal)} kcal</span></p>
              </div>
            </div>
            <div className="bg-violet-100 text-violet-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              {Math.round(calRemain)} restam
            </div>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${calPct * 100}%` }}
            />
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-3 gap-2">
            <MacroRing value={diary?.totalProteinG ?? 0} max={profile?.targetProteinG ?? 150} label="Proteina" unit="g" color="#7c3aed" />
            <MacroRing value={diary?.totalCarbsG ?? 0} max={profile?.targetCarbsG ?? 200} label="Carboidrato" unit="g" color="#f59e0b" />
            <MacroRing value={diary?.totalFatG ?? 0} max={profile?.targetFatG ?? 60} label="Gordura" unit="g" color="#ef4444" />
          </div>
        </div>

        {/* Hydration */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets size={20} className="text-blue-400" />
              <span className="font-semibold text-gray-800">Hidratacao</span>
            </div>
            <span className="text-sm text-gray-400">{hydration?.cups ?? 0} copos</span>
          </div>
          <div className="h-7 bg-blue-50 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center transition-all duration-500"
              style={{ width: `${Math.min(totalWater / targetWater, 1) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-medium text-blue-600">{Math.round(totalWater)}ml / {Math.round(targetWater)}ml</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mb-3">Faltam {Math.max(0, Math.round(targetWater - totalWater))}ml para a meta</p>
          <div className="grid grid-cols-3 gap-2">
            {[150, 250, 500].map((ml) => (
              <button
                key={ml}
                onClick={() => addHydration.mutate({ date: dateStr, amountMl: ml })}
                className="border border-gray-200 rounded-xl py-2 text-sm font-medium text-gray-600 flex items-center justify-center gap-1 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 transition-colors"
              >
                <Plus size={14} /> {ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* Add Food */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={20} className="text-violet-600" />
            <h3 className="font-semibold text-gray-800">Adicionar Alimento</h3>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Refeicao</label>
            <div className="grid grid-cols-4 gap-1">
              {mealTypes.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMeal(m)}
                  className={`py-2 text-xs rounded-xl font-medium transition-colors ${selectedMeal === m ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {MEAL_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSearchMode("taco")}
              className={`flex-1 py-2 text-sm rounded-xl font-medium flex items-center justify-center gap-1 transition-colors ${searchMode === "taco" ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              <Search size={14} /> Tabela TACO
            </button>
            <button
              onClick={() => setSearchMode("manual")}
              className={`flex-1 py-2 text-sm rounded-xl font-medium flex items-center justify-center gap-1 transition-colors ${searchMode === "manual" ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              <Pencil size={14} /> Manual
            </button>
          </div>

          {searchMode === "taco" ? (
            <div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar alimento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              {searchResults && searchResults.length > 0 && searchQuery.length >= 2 && (
                <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                  {searchResults.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleAddFromTaco(food)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-violet-50 border border-gray-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-800">{food.name}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round(food.calories)} kcal · P: {Math.round(food.proteinG)}g · C: {Math.round(food.carbsG)}g · G: {Math.round(food.fatG)}g
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nome do alimento"
                value={manualFood.name}
                onChange={(e) => setManualFood({ ...manualFood, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Calorias (kcal)" value={manualFood.calories} onChange={(e) => setManualFood({ ...manualFood, calories: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                <input type="number" placeholder="Quantidade (g)" value={manualFood.quantity} onChange={(e) => setManualFood({ ...manualFood, quantity: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                <input type="number" placeholder="Proteina (g)" value={manualFood.protein} onChange={(e) => setManualFood({ ...manualFood, protein: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                <input type="number" placeholder="Carboidrato (g)" value={manualFood.carbs} onChange={(e) => setManualFood({ ...manualFood, carbs: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                <input type="number" placeholder="Gordura (g)" value={manualFood.fat} onChange={(e) => setManualFood({ ...manualFood, fat: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
              </div>
              <button
                onClick={handleManualAdd}
                disabled={!manualFood.name || !manualFood.calories}
                className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-violet-700 transition-colors"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>

        {/* Meals today */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Refeicoes de Hoje</h3>
          {diaryLoading ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">Carregando...</div>
          ) : diary?.entries && diary.entries.length > 0 ? (
            <div className="space-y-3">
              {mealTypes.map((meal) => {
                const entries = diary.entries.filter((e: { mealType: string }) => e.mealType === meal);
                if (entries.length === 0) return null;
                const mealCal = entries.reduce((s: number, e: { calories: number }) => s + e.calories, 0);
                return (
                  <div key={meal} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <span className="font-semibold text-sm text-gray-700">{MEAL_LABELS[meal]}</span>
                      <span className="text-sm text-violet-600 font-medium">{Math.round(mealCal)} kcal</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {entries.map((entry: { id: number; foodName: string; quantityG: number; calories: number; proteinG: number; carbsG: number; fatG: number }) => (
                        <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{entry.foodName}</p>
                            <p className="text-xs text-gray-400">{entry.quantityG}g · {Math.round(entry.calories)} kcal · P:{Math.round(entry.proteinG)}g C:{Math.round(entry.carbsG)}g G:{Math.round(entry.fatG)}g</p>
                          </div>
                          <button
                            onClick={() => deleteEntry.mutate({ id: entry.id })}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm border border-gray-100">
              <div className="w-12 h-12 text-gray-300 mb-3 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-500">Nenhuma refeicao registrada hoje</p>
              <p className="text-sm text-gray-400 mt-1">Adicione seu primeiro alimento acima</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
