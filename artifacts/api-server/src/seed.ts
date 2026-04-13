import { db, usersTable, foodsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

const USERS = [
  { email: "prifabre.ads@gmail.com", password: "159369", name: "Prifabre" },
  { email: "gobboviviane@gmail.com", password: "159369", name: "Viviane" },
];

const EXTRA_FOODS = [
  { name: "Cuscuz de milho cozido", calories: 130, proteinG: 3.0, carbsG: 27.0, fatG: 1.0, fiberG: 1.8, servingG: 100 },
  { name: "Tapioca (goma, crua)", calories: 350, proteinG: 0.2, carbsG: 86.5, fatG: 0.1, fiberG: 0.8, servingG: 100 },
  { name: "Tapioca pronta (beiju)", calories: 170, proteinG: 0.5, carbsG: 42.0, fatG: 0.3, fiberG: 0.5, servingG: 100 },
  { name: "Queijo muçarela", calories: 280, proteinG: 22.0, carbsG: 2.0, fatG: 20.0, fiberG: 0, servingG: 100 },
  { name: "Queijo prato", calories: 330, proteinG: 22.5, carbsG: 1.8, fatG: 26.0, fiberG: 0, servingG: 100 },
  { name: "Queijo cottage", calories: 100, proteinG: 12.0, carbsG: 3.4, fatG: 4.3, fiberG: 0, servingG: 100 },
  { name: "Queijo minas frescal", calories: 264, proteinG: 17.4, carbsG: 2.8, fatG: 20.2, fiberG: 0, servingG: 100 },
  { name: "Queijo parmesão ralado", calories: 392, proteinG: 35.7, carbsG: 3.2, fatG: 26.0, fiberG: 0, servingG: 100 },
  { name: "Requeijão cremoso", calories: 250, proteinG: 11.0, carbsG: 3.2, fatG: 22.0, fiberG: 0, servingG: 100 },
  { name: "Alface americana", calories: 14, proteinG: 0.9, carbsG: 2.4, fatG: 0.2, fiberG: 1.2, servingG: 100 },
  { name: "Alface crespa", calories: 11, proteinG: 0.9, carbsG: 1.8, fatG: 0.1, fiberG: 1.0, servingG: 100 },
  { name: "Rúcula", calories: 25, proteinG: 2.1, carbsG: 3.0, fatG: 0.6, fiberG: 1.6, servingG: 100 },
  { name: "Couve folha", calories: 38, proteinG: 3.5, carbsG: 4.8, fatG: 0.7, fiberG: 2.0, servingG: 100 },
  { name: "Espinafre", calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.3, fiberG: 2.2, servingG: 100 },
  { name: "Brócolis cozido", calories: 35, proteinG: 2.7, carbsG: 5.4, fatG: 0.4, fiberG: 2.6, servingG: 100 },
  { name: "Repolho cru", calories: 22, proteinG: 1.3, carbsG: 4.0, fatG: 0.1, fiberG: 1.8, servingG: 100 },
  { name: "Abobrinha cozida", calories: 16, proteinG: 1.1, carbsG: 3.0, fatG: 0.2, fiberG: 1.0, servingG: 100 },
  { name: "Pepino", calories: 13, proteinG: 0.5, carbsG: 2.5, fatG: 0.1, fiberG: 0.5, servingG: 100 },
  { name: "Berinjela cozida", calories: 18, proteinG: 0.9, carbsG: 3.8, fatG: 0.2, fiberG: 2.0, servingG: 100 },
  { name: "Quiabo cozido", calories: 27, proteinG: 2.0, carbsG: 4.9, fatG: 0.1, fiberG: 2.5, servingG: 100 },
  { name: "Chuchu cozido", calories: 20, proteinG: 0.8, carbsG: 4.0, fatG: 0.1, fiberG: 1.5, servingG: 100 },
  { name: "Cenoura crua", calories: 34, proteinG: 0.6, carbsG: 7.6, fatG: 0.2, fiberG: 2.8, servingG: 100 },
  { name: "Beterraba cozida", calories: 43, proteinG: 1.4, carbsG: 9.5, fatG: 0.1, fiberG: 1.9, servingG: 100 },
  { name: "Creme de leite (caixinha)", calories: 327, proteinG: 2.5, carbsG: 3.0, fatG: 34.0, fiberG: 0, servingG: 100 },
  { name: "Leite Moça (leite condensado)", calories: 325, proteinG: 7.5, carbsG: 54.5, fatG: 8.5, fiberG: 0, servingG: 100 },
  { name: "Manteiga", calories: 748, proteinG: 0.9, carbsG: 0.0, fatG: 83.0, fiberG: 0, servingG: 100 },
  { name: "Margarina", calories: 540, proteinG: 0.4, carbsG: 0.5, fatG: 60.0, fiberG: 0, servingG: 100 },
  { name: "Maionese", calories: 666, proteinG: 1.4, carbsG: 4.1, fatG: 72.0, fiberG: 0, servingG: 100 },
  { name: "Iogurte grego integral", calories: 133, proteinG: 6.4, carbsG: 7.7, fatG: 8.8, fiberG: 0, servingG: 100 },
  { name: "Cebola crua", calories: 39, proteinG: 1.0, carbsG: 9.0, fatG: 0.1, fiberG: 1.7, servingG: 100 },
  { name: "Alho", calories: 149, proteinG: 6.4, carbsG: 33.1, fatG: 0.5, fiberG: 2.1, servingG: 100 },
  { name: "Tomate cru", calories: 15, proteinG: 0.8, carbsG: 3.0, fatG: 0.2, fiberG: 1.2, servingG: 100 },
  { name: "Farinha de trigo", calories: 360, proteinG: 10.0, carbsG: 76.0, fatG: 1.0, fiberG: 2.3, servingG: 100 },
  { name: "Farinha de mandioca torrada", calories: 360, proteinG: 1.3, carbsG: 87.0, fatG: 0.3, fiberG: 6.5, servingG: 100 },
  { name: "Fubá de milho", calories: 355, proteinG: 8.8, carbsG: 73.0, fatG: 1.8, fiberG: 3.8, servingG: 100 },
  { name: "Amido de milho (maisena)", calories: 381, proteinG: 0.3, carbsG: 91.5, fatG: 0.1, fiberG: 0.9, servingG: 100 },
  { name: "Pão de queijo", calories: 311, proteinG: 8.2, carbsG: 39.5, fatG: 13.5, fiberG: 0.5, servingG: 100 },
  { name: "Batata doce cozida", calories: 77, proteinG: 1.4, carbsG: 17.8, fatG: 0.1, fiberG: 2.3, servingG: 100 },
  { name: "Inhame cozido", calories: 100, proteinG: 1.5, carbsG: 22.7, fatG: 0.1, fiberG: 4.1, servingG: 100 },
  { name: "Macaxeira (mandioca) cozida", calories: 125, proteinG: 1.0, carbsG: 30.1, fatG: 0.3, fiberG: 1.9, servingG: 100 },
  { name: "Milho cozido (espiga)", calories: 86, proteinG: 3.2, carbsG: 18.7, fatG: 1.2, fiberG: 2.7, servingG: 100 },
  { name: "Lentilha cozida", calories: 112, proteinG: 8.8, carbsG: 19.5, fatG: 0.4, fiberG: 8.0, servingG: 100 },
  { name: "Grão de bico cozido", calories: 164, proteinG: 8.9, carbsG: 27.4, fatG: 2.6, fiberG: 7.6, servingG: 100 },
  { name: "Amendoim torrado", calories: 581, proteinG: 26.0, carbsG: 19.8, fatG: 49.6, fiberG: 8.0, servingG: 100 },
  { name: "Pasta de amendoim", calories: 588, proteinG: 25.0, carbsG: 20.0, fatG: 50.0, fiberG: 6.0, servingG: 100 },
  { name: "Castanha de caju torrada", calories: 570, proteinG: 15.0, carbsG: 32.7, fatG: 46.3, fiberG: 3.3, servingG: 100 },
  { name: "Castanha do Pará", calories: 656, proteinG: 14.5, carbsG: 11.7, fatG: 66.4, fiberG: 7.5, servingG: 100 },
  { name: "Azeite de oliva", calories: 884, proteinG: 0.0, carbsG: 0.0, fatG: 100.0, fiberG: 0, servingG: 100 },
  { name: "Óleo de coco", calories: 862, proteinG: 0.0, carbsG: 0.0, fatG: 100.0, fiberG: 0, servingG: 100 },
  { name: "Molho de tomate", calories: 39, proteinG: 1.4, carbsG: 8.0, fatG: 0.4, fiberG: 1.6, servingG: 100 },
  { name: "Chocolate meio amargo (70%)", calories: 546, proteinG: 5.5, carbsG: 45.0, fatG: 38.0, fiberG: 10.9, servingG: 100 },
  { name: "Mel", calories: 309, proteinG: 0.3, carbsG: 84.0, fatG: 0.0, fiberG: 0.2, servingG: 100 },
  { name: "Açúcar refinado", calories: 387, proteinG: 0.0, carbsG: 99.7, fatG: 0.0, fiberG: 0, servingG: 100 },
  { name: "Açúcar mascavo", calories: 373, proteinG: 0.0, carbsG: 96.2, fatG: 0.0, fiberG: 0, servingG: 100 },
  { name: "Proteína whey (pó)", calories: 380, proteinG: 76.0, carbsG: 8.0, fatG: 6.0, fiberG: 0, servingG: 100 },
  { name: "Aveia em flocos", calories: 394, proteinG: 13.9, carbsG: 66.6, fatG: 8.5, fiberG: 9.1, servingG: 100 },
  { name: "Granola", calories: 387, proteinG: 9.0, carbsG: 65.0, fatG: 11.0, fiberG: 5.0, servingG: 100 },
  { name: "Pão francês", calories: 300, proteinG: 8.0, carbsG: 58.0, fatG: 3.1, fiberG: 2.3, servingG: 100 },
  { name: "Pão integral", calories: 253, proteinG: 10.0, carbsG: 47.0, fatG: 3.2, fiberG: 6.2, servingG: 100 },
  { name: "Biscoito cream cracker", calories: 430, proteinG: 9.5, carbsG: 70.0, fatG: 12.0, fiberG: 2.4, servingG: 100 },
  { name: "Macarrão cozido", calories: 149, proteinG: 5.0, carbsG: 30.0, fatG: 0.9, fiberG: 1.8, servingG: 100 },
  { name: "Pizza (fatia, queijo)", calories: 270, proteinG: 11.0, carbsG: 33.0, fatG: 10.0, fiberG: 2.0, servingG: 100 },
  { name: "Hambúrguer bovino grelhado", calories: 245, proteinG: 20.0, carbsG: 0.0, fatG: 18.0, fiberG: 0, servingG: 100 },
  { name: "Salsicha cozida", calories: 280, proteinG: 14.0, carbsG: 3.0, fatG: 24.0, fiberG: 0, servingG: 100 },
  { name: "Linguiça calabresa grelhada", calories: 330, proteinG: 18.0, carbsG: 2.0, fatG: 28.0, fiberG: 0, servingG: 100 },
  { name: "Sardinha em óleo (lata)", calories: 208, proteinG: 24.0, carbsG: 0.0, fatG: 12.0, fiberG: 0, servingG: 100 },
  { name: "Atum em água (lata)", calories: 128, proteinG: 28.0, carbsG: 0.0, fatG: 1.0, fiberG: 0, servingG: 100 },
  { name: "Salmão grelhado", calories: 208, proteinG: 20.0, carbsG: 0.0, fatG: 13.8, fiberG: 0, servingG: 100 },
  { name: "Tilápia grelhada", calories: 96, proteinG: 20.1, carbsG: 0.0, fatG: 1.7, fiberG: 0, servingG: 100 },
  { name: "Camarão cozido", calories: 99, proteinG: 21.0, carbsG: 0.0, fatG: 1.1, fiberG: 0, servingG: 100 },
  { name: "Carne moída refogada (patinho)", calories: 219, proteinG: 26.0, carbsG: 0.0, fatG: 13.0, fiberG: 0, servingG: 100 },
  { name: "Alcatra grelhada", calories: 185, proteinG: 28.0, carbsG: 0.0, fatG: 8.0, fiberG: 0, servingG: 100 },
  { name: "Costela bovina assada", calories: 390, proteinG: 22.0, carbsG: 0.0, fatG: 34.0, fiberG: 0, servingG: 100 },
  { name: "Frango inteiro assado", calories: 239, proteinG: 27.0, carbsG: 0.0, fatG: 14.0, fiberG: 0, servingG: 100 },
  { name: "Banana prata", calories: 92, proteinG: 1.3, carbsG: 23.8, fatG: 0.1, fiberG: 2.0, servingG: 100 },
  { name: "Maçã", calories: 55, proteinG: 0.3, carbsG: 13.7, fatG: 0.3, fiberG: 2.0, servingG: 100 },
  { name: "Mamão papaia", calories: 40, proteinG: 0.5, carbsG: 10.0, fatG: 0.1, fiberG: 1.8, servingG: 100 },
  { name: "Melancia", calories: 33, proteinG: 0.6, carbsG: 8.1, fatG: 0.1, fiberG: 0.4, servingG: 100 },
  { name: "Abacate", calories: 160, proteinG: 2.0, carbsG: 8.5, fatG: 14.7, fiberG: 6.7, servingG: 100 },
  { name: "Manga (polpa)", calories: 64, proteinG: 0.8, carbsG: 16.4, fatG: 0.3, fiberG: 1.6, servingG: 100 },
  { name: "Morango", calories: 30, proteinG: 0.8, carbsG: 6.8, fatG: 0.3, fiberG: 2.0, servingG: 100 },
  { name: "Uva itália", calories: 68, proteinG: 0.7, carbsG: 16.9, fatG: 0.4, fiberG: 0.9, servingG: 100 },
  { name: "Laranja pera", calories: 47, proteinG: 0.9, carbsG: 11.5, fatG: 0.1, fiberG: 2.0, servingG: 100 },
];

export async function seedDatabase() {
  try {
    for (const u of USERS) {
      const [existing] = await db.select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, u.email))
        .limit(1);
      if (!existing) {
        const hash = await bcrypt.hash(u.password, 10);
        await db.insert(usersTable).values({ email: u.email, passwordHash: hash, name: u.name });
        console.log(`[seed] User created: ${u.email}`);
      }
    }

    for (const food of EXTRA_FOODS) {
      const existing = await db.select({ id: foodsTable.id })
        .from(foodsTable)
        .where(eq(foodsTable.name, food.name))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(foodsTable).values(food);
      }
    }
    console.log("[seed] Foods seeded.");
  } catch (err) {
    console.error("[seed] Error:", err);
  }
}
