import { createSeedClient } from "@snaplet/seed";

const main = async () => {
  const seed = await createSeedClient({dryRun: true});

  // Truncate all tables in the database
  await seed.$resetDatabase(["!public.streak_levels"]);

  const userId = "cffe0d90-281b-498f-8528-731c624851b8"

  await seed.meals([
    {
      name: "Breakfast",
      protein_amount: 20,
      user_id: userId,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
    {
      name: "Lunch",
      protein_amount: 30,
      user_id: userId,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      name: "Dinner",
      protein_amount: 40,
      user_id: userId,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      name: "Protein Shake",
      protein_amount: 25,
      user_id: userId,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      name: "Chicken Breast",
      protein_amount: 35,
      user_id: userId,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      name: "Greek Yogurt",
      protein_amount: 15,
      user_id: userId,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      name: "Salmon",
      protein_amount: 45,
      user_id: userId,
      created_at: new Date(), // today
    },
  ]);

  process.exit();
};

main();