import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/data/admin";

export default async function AdminIndex() {
  const admin = await getAdmin();
  redirect(admin ? "/queue" : "/sign-in");
}
