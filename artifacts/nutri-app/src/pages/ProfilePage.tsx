import { useState, useEffect } from "react";
import { User, Calculator, Clock, Lock, ChevronDown, ChevronUp } from "lucide-react";
import {
  useGetProfile,
  useUpdateProfile,
  getGetProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentario",
  lightly_active: "Levemente ativo",
  moderately_active: "Moderadamente ativo",
  very_active: "Muito ativo",
  extra_active: "Extremamente ativo",
};

const GOAL_LABELS: Record<string, string> = {
  maintain: "Manter peso",
  lose_mild: "Perda leve (-250 kcal)",
  lose_moderate: "Perda moderada (-500 kcal)",
  lose_aggressive: "Perda acelerada (-750 kcal)",
  gain: "Ganho de massa (+300 kcal)",
};

const BMI_LABELS = (bmi: number) => {
  if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-blue-500" };
  if (bmi < 25) return { label: "Normal", color: "text-green-500" };
  if (bmi < 30) return { label: "Sobrepeso", color: "text-amber-500" };
  return { label: "Obesidade", color: "text-red-500" };
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        setDirty(false);
      },
    },
  });

  const [form, setForm] = useState({
    name: "", age: "", sex: "F", weightKg: "", heightCm: "",
    activityLevel: "lightly_active", caloricGoal: "maintain",
    intermittentFasting: false, fastingStartHour: 20, fastingEndHour: 12,
  });
  const [dirty, setDirty] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showFasting, setShowFasting] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        age: String(profile.age),
        sex: profile.sex,
        weightKg: String(profile.weightKg),
        heightCm: String(profile.heightCm),
        activityLevel: profile.activityLevel,
        caloricGoal: profile.caloricGoal,
        intermittentFasting: profile.intermittentFasting,
        fastingStartHour: profile.fastingStartHour ?? 20,
        fastingEndHour: profile.fastingEndHour ?? 12,
      });
    }
  }, [profile]);

  function handleSave() {
    updateProfile.mutate({
      name: form.name,
      age: parseInt(form.age),
      sex: form.sex as "M" | "F",
      weightKg: parseFloat(form.weightKg),
      heightCm: parseFloat(form.heightCm),
      activityLevel: form.activityLevel as "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active",
      caloricGoal: form.caloricGoal as "maintain" | "lose_mild" | "lose_moderate" | "lose_aggressive" | "gain",
      intermittentFasting: form.intermittentFasting,
      fastingStartHour: form.fastingStartHour,
      fastingEndHour: form.fastingEndHour,
    });
  }

  function update<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm({ ...form, [k]: v });
    setDirty(true);
  }

  if (isLoading) return <div className="pt-20 text-center text-gray-400">Carregando...</div>;

  const bmiInfo = profile ? BMI_LABELS(profile.bmi) : null;

  return (
    <div className="pb-4">
      <div className="bg-gradient-to-br from-violet-600 to-purple-500 text-white pt-12 pb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile?.name}</h1>
            <p className="text-sm text-violet-200">
              {profile?.weightKg}kg · {profile?.heightCm}cm · {profile?.age} anos
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Profile form */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-violet-500" />
            <h3 className="font-semibold text-gray-800">Perfil</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Idade</label>
                <input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sexo</label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => update("sex", "M")}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${form.sex === "M" ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    Masc
                  </button>
                  <button
                    onClick={() => update("sex", "F")}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${form.sex === "F" ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    Fem
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Peso (kg)</label>
                <input type="number" step="0.1" value={form.weightKg} onChange={(e) => update("weightKg", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Altura (cm)</label>
                <input type="number" value={form.heightCm} onChange={(e) => update("heightCm", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nivel de Atividade</label>
              <select
                value={form.activityLevel}
                onChange={(e) => update("activityLevel", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white"
              >
                {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Objetivo Calorico</label>
              <select
                value={form.caloricGoal}
                onChange={(e) => update("caloricGoal", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white"
              >
                {Object.entries(GOAL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={!dirty}
              className="w-full py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
            >
              <User size={16} /> Salvar Alteracoes
            </button>
          </div>
        </div>

        {/* Nutritional Calculator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-4"
            onClick={() => setShowCalc(!showCalc)}
          >
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-violet-500" />
              <span className="font-semibold text-gray-800">Calculadora Nutricional</span>
            </div>
            <span className="text-sm text-violet-600">{showCalc ? "Fechar" : "Abrir"}</span>
          </button>
          {showCalc && profile && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "IMC", value: String(profile.bmi), sub: bmiInfo?.label, subColor: bmiInfo?.color },
                  { label: "TMB (kcal)", value: String(Math.round(profile.bmr)) },
                  { label: "TDEE (kcal)", value: String(Math.round(profile.tdee)) },
                  { label: "Meta (kcal)", value: String(Math.round(profile.targetCalories)) },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-gray-800">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    {item.sub && <p className={`text-xs font-medium mt-0.5 ${item.subColor}`}>{item.sub}</p>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Proteina", value: `${Math.round(profile.targetProteinG)}g`, bg: "bg-violet-50 text-violet-700" },
                  { label: "Carboidrato", value: `${Math.round(profile.targetCarbsG)}g`, bg: "bg-amber-50 text-amber-700" },
                  { label: "Gordura", value: `${Math.round(profile.targetFatG)}g`, bg: "bg-red-50 text-red-700" },
                ].map((m) => (
                  <div key={m.label} className={`${m.bg} rounded-xl p-3 text-center`}>
                    <p className="text-lg font-bold">{m.value}</p>
                    <p className="text-xs">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Intermittent Fasting */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-violet-500" />
              <span className="font-semibold text-gray-800">Jejum Intermitente</span>
            </div>
            <button
              onClick={() => {
                update("intermittentFasting", !form.intermittentFasting);
                setShowFasting(!form.intermittentFasting);
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.intermittentFasting ? "bg-violet-600" : "bg-gray-200"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.intermittentFasting ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>
          {form.intermittentFasting && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Inicio do jejum (h)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={form.fastingStartHour}
                    onChange={(e) => update("fastingStartHour", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fim do jejum (h)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={form.fastingEndHour}
                    onChange={(e) => update("fastingEndHour", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Janela de alimentacao: {form.fastingEndHour}h ate {form.fastingStartHour}h ({form.fastingStartHour - form.fastingEndHour < 0 ? 24 + form.fastingStartHour - form.fastingEndHour : form.fastingStartHour - form.fastingEndHour}h de jejum)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
