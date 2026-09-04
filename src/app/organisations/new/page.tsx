import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/ui/Page";
import { OrganisationForm } from "@/components/admin/OrganisationForm";
import { requireAdmin } from "@/lib/data/admin";
import { getAccessZones, getMarkets } from "@/lib/data/markets";

export const metadata: Metadata = { title: "Add an organisation" };

/**
 * Adding an organisation nobody has signed up.
 *
 * Most of the PathGrid map will never make an account. Business Gateway, NHS
 * Inform, Public Health Scotland and Skills Development Scotland are standing
 * infrastructure, and a platform that waits for them to fill in a form is a
 * platform with nothing on it.
 */
export default async function NewOrganisationPage() {
  await requireAdmin();

  const [zones, markets] = await Promise.all([getAccessZones(), getMarkets()]);

  return (
    <Page width={820} top={56} gap={26}>
      <Link
        href="/organisations"
        className="inline-flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-bold text-ink no-underline"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Organisations
      </Link>

      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-normal leading-[1.1] tracking-[-0.01em] sm:text-[42px]">
          Add an organisation
        </h1>
        <p className="m-0 max-w-[64ch] text-[17px] leading-[1.55] text-ink-70">
          For the ones who will never sign up themselves. They go live on
          Discover as soon as you save, and can be handed over later by
          inviting somebody into them.
        </p>
      </div>

      <OrganisationForm zones={zones} markets={markets} />
    </Page>
  );
}
