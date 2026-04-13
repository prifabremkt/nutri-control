import { useState } from "react";
import { format } from "date-fns";
import { TrendingUp, Scale, Plus, X } from "lucide-react";
import {
  useGetProgress,
  useLogWeight,
  useGetDiarySummary,
  getGetProgressQueryKey,
  getGetDiarySummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function ProgressPage() {
  const queryClient = useQueryClient();
  const { data: progress, isLoading } = useGetProgress();
  const { data: weeklySummary } = useGetDiarySummary();
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const logWeight = useLogWeight({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDiarySummaryQueryKey() });
        setShowWeightForm(false);
        setNewWeight("");
      },
    },
  });

  function handleLogWeight() {
    if (!newWeight) return;
    logWeight.mutate({
      date: format(new Date(), "yyyy-MM-dd"),
      weightKg: parseFloat(newWeight),
    });
  }

  const weightData = (progress?.weightEntries ?? [])
    .slice()
    .reverse()
    .map((e) => ({ date: format(new Date(e.date + "T12:00:00"), "dd/MM"), peso: e.weightKg }));

  const calorieData = (weeklySummary ?? [])
    .slice()
    .reverse()
    .map((s) => ({
      date: format(new Date(s.date + "T12:00:00"), "dd/MM"),
      consumido: Math.round(s.totalCalories),
      meta: Math.round(s.targetCalories),
    }));

  const latestWeight = progress?.weightEntries?.[0]?.weightKg;
  const prevWeight = progress?.weightEntries?.[1]?.weightKg;
  const weightDiff = latestWeight && prevWeight ? latestWeight - prevWeight : null;

  const avgCal = weeklySummary && weeklySummary.length > 0
    ? Math.round(weeklySummary.reduce((s, d) => s + d.totalCalories, 0) / weeklySummary.length)
    : 0;

  return (
    <div className="pb-4">
      <div className="bg-gradient-to-br from-violet-600 to-purple-500 text-white pt-12 pb-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-violet-200">Acompanhe seu</p>
            <h1 className="text-2xl font-bold">Progresso</h1>
          </div>
          <button
            onClick={() => setShowWeightForm(!showWeightForm)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {showWeightForm ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-lg font-bold">{latestWeight ? `${latestWeight}kg` : "—"}</p>
            <p className="text-xs text-violet-100">Peso atual</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className={`text-lg font-bold ${weightDiff !== null && weightDiff < 0 ? "text-green-300" : weightDiff !== null && weightDiff > 0 ? "text-red-300" : ""}`}>
              {weightDiff !== null ? `${weightDiff > 0 ? "+" : ""}${weightDiff.toFixed(1)}kg` : "—"}
            </p>
            <p className="text-xs text-violet-100">Variacao</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-lg font-bold">{avgCal || "—"}</p>
            <p className="text-xs text-violet-100">Media kcal</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {showWeightForm && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Registrar peso</h3>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Peso em kg"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
              />
              <button
                onClick={handleLogWeight}
                disabled={!newWeight}
                className="px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-violet-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Weight chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Scale size={18} className="text-violet-500" />
            <h3 className="font-semibold text-gray-800">Evolucao do Peso</h3>
          </div>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weightData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip formatter={(v) => [`${v} kg`, "Peso"]} />
                <Area type="monotone" dataKey="peso" stroke="#7c3aed" strokeWidth={2} fill="url(#weightGrad)" dot={{ r: 4, fill: "#7c3aed" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Nenhum registro de peso ainda. Clique em + para adicionar.
            </div>
          )}
        </div>

        {/* Calories chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-violet-500" />
            <h3 className="font-semibold text-gray-800">Calorias por Dia</h3>
          </div>
          {calorieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={calorieData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="consumido" name="Consumido" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meta" name="Meta" fill="#e9d5ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Registre alimentos no diario para ver seus dados aqui.
            </div>
          )}
        </div>

        {/* Weight history */}
        {progress?.weightEntries && progress.weightEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Historico de Peso</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {progress.weightEntries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-600">{format(new Date(entry.date + "T12:00:00"), "dd/MM/yyyy")}</span>
                  <span className="font-semibold text-gray-800">{entry.weightKg} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
