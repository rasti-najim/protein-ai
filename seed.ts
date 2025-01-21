import { createSeedClient } from "@snaplet/seed";

const main = async () => {
  const seed = await createSeedClient({dryRun: true});

  // Truncate all tables in the database
  await seed.$resetDatabase(["!public.streak_levels"]);

  const userId = "f759fce0-7d6a-4736-8819-ae65b39a87cc";

  // Helper function to generate a random protein amount within a range
  const randomProtein = (min: number, max: number) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Common meal names for variety
  const mealNames = [
    "Chicken Breast with Rice",
    "Protein Shake",
    "Greek Yogurt with Whey",
    "Salmon with Quinoa",
    "Steak and Sweet Potato",
    "Turkey and Vegetables",
    "Tuna Salad",
    "Egg White Omelette",
    "Protein Smoothie Bowl",
    "Lean Ground Beef Bowl"
  ];

  const meals = [];
  
  // Generate 100 meals spanning 3 months (90 days)
  // Starting from 90 days ago
  for (let i = 90; i >= 0; i--) {
    // For the last 30 days, ensure protein > 121g
    const proteinAmount = i <= 30 
      ? randomProtein(122, 180)  // Guaranteed to meet goal
      : randomProtein(80, 160);  // May or may not meet goal

    meals.push({
      name: mealNames[Math.floor(Math.random() * mealNames.length)],
      protein_amount: proteinAmount,
      user_id: userId,
      created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    });
  }

  await seed.meals(meals);

  process.exit();
};

main();