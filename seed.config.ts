import { SeedPg } from "@snaplet/seed/adapter-pg";
import { defineConfig } from "@snaplet/seed/config";
import { Client } from "pg";

export default defineConfig({
  adapter: async () => {
    const client = new Client("postgresql://postgres.iyekvkszjdxzdtogzyzq:Fodofp79P8xcogaP@aws-0-us-east-1.pooler.supabase.com:6543/postgres");
    await client.connect();
    return new SeedPg(client);
  },
  select: ["!*", "public.*", "auth.users", "auth.identities", "auth.sessions"],
});
