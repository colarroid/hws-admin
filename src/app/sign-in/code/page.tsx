import { redirect } from "next/navigation";
import { Page } from "@/components/ui/Page";
import { CodeForm } from "@/components/admin/CodeForm";

export default async function CodePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/sign-in");

  return (
    <Page width={460} top={80} gap={22}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[38px]">
          Check your email
        </h1>
        <p className="m-0 text-[17px] leading-[1.6] text-ink-70">
          If <strong className="text-ink">{email}</strong> has access, a code is
          on its way.
        </p>
      </div>
      <CodeForm email={email} />
    </Page>
  );
}
