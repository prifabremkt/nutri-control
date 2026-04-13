import { useState } from "react";
import { ChefHat, Plus, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import {
  useGetRecipes,
  useCreateRecipe,
  useDeleteRecipe,
  getGetRecipesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function RecipesPage() {
  const queryClient = useQueryClient();
  const { data: recipes, isLoading } = useGetRecipes();
  const createRecipe = useCreateRecipe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRecipesQueryKey() });
        setShowForm(false);
        setForm({ name: "", description: "", servings: "1", calories: "", protein: "", carbs: "", fat: "", ingredients: "", instructions: "" });
      },
    },
  });
  const deleteRecipe = useDeleteRecipe({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetRecipesQueryKey() }),
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", servings: "1", calories: "", protein: "", carbs: "", fat: "", ingredients: "", instructions: ""
  });

  function handleSubmit() {
    if (!form.name || !form.calories) return;
    createRecipe.mutate({
      name: form.name,
      description: form.description,
      servings: parseInt(form.servings) || 1,
      caloriesPerServing: parseFloat(form.calories) || 0,
      proteinGPerServing: parseFloat(form.protein) || 0,
      carbsGPerServing: parseFloat(form.carbs) || 0,
      fatGPerServing: parseFloat(form.fat) || 0,
      ingredients: form.ingredients.split("\n").filter(Boolean),
      instructions: form.instructions,
    });
  }

  return (
    <div className="pb-4">
      <div className="bg-gradient-to-br from-violet-600 to-purple-500 text-white pt-12 pb-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-violet-200">Seu livro de</p>
            <h1 className="text-2xl font-bold">Receitas</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {showForm && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Nova Receita</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nome da receita"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
              />
              <input
                type="text"
                placeholder="Descricao (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Porcoes</label>
                  <input type="number" value={form.servings} onChange={(e) => setForm({ ...form, servings: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Calorias/porcao</label>
                  <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Proteina (g)</label>
                  <input type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Carboidrato (g)</label>
                  <input type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Gordura (g)</label>
                  <input type="number" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ingredientes (um por linha)</label>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  rows={4}
                  placeholder="100g arroz&#10;200g frango&#10;..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Modo de preparo</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  rows={3}
                  placeholder="Descreva o preparo..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.calories}
                className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-violet-700 transition-colors"
              >
                Salvar Receita
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Carregando receitas...</div>
        ) : recipes && recipes.length > 0 ? (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                      <ChefHat size={18} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{recipe.name}</p>
                      <p className="text-xs text-gray-400">{Math.round(recipe.caloriesPerServing)} kcal · {recipe.servings} porcao(oes)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRecipe.mutate({ id: recipe.id }); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    {expandedId === recipe.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>
                {expandedId === recipe.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    {recipe.description && <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Proteina", value: `${Math.round(recipe.proteinGPerServing)}g`, color: "bg-violet-100 text-violet-700" },
                        { label: "Carboidrato", value: `${Math.round(recipe.carbsGPerServing)}g`, color: "bg-amber-100 text-amber-700" },
                        { label: "Gordura", value: `${Math.round(recipe.fatGPerServing)}g`, color: "bg-red-100 text-red-700" },
                      ].map((m) => (
                        <div key={m.label} className={`${m.color} rounded-xl p-2 text-center`}>
                          <p className="text-sm font-bold">{m.value}</p>
                          <p className="text-xs">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ingredientes</p>
                        <ul className="space-y-1">
                          {recipe.ingredients.map((ing, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                              <span className="text-violet-400 mt-0.5">·</span> {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {recipe.instructions && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Modo de preparo</p>
                        <p className="text-sm text-gray-700">{recipe.instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center shadow-sm border border-gray-100">
            <ChefHat size={40} className="text-gray-300 mb-3" />
            <p className="font-semibold text-gray-500">Nenhuma receita ainda</p>
            <p className="text-sm text-gray-400 mt-1">Adicione sua primeira receita acima</p>
          </div>
        )}
      </div>
    </div>
  );
}
