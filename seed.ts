import { createSeedClient } from "@snaplet/seed";

const main = async () => {
  const seed = await createSeedClient({dryRun: true});

  // Truncate all tables in the database
  await seed.$resetDatabase(["!public.streak_levels"]);

  // Seed the database with 10 auth_users
  await seed.auth_users((x) => x(10));

  await seed.public_users((x) => x(10));

  await seed.meals((x) => x(10));

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes

  console.log("Database seeded successfully!");

  process.exit();
};

main();