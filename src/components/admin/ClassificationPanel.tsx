import { Lock, TriangleAlert } from "lucide-react";
import type { AccessZone, Market } from "@/lib/data/markets";

/**
 * How this organisation is classified, and nothing that changes it.
 *
 * Both halves used to be editable here and neither is now.
 *
 * Zones are the organisation's own account of where it works, chosen at
 * onboarding. Markets are HWS's judgement about what a woman can reach
 * through them. Different owners, but the same reason for locking: both
 * decide who appears where on a public site, and a screen whose job is
 * deciding a verification should not also be a place where a stray click
 * silently rewrites that.
 *
 * Shown rather than hidden, because deciding a verification without seeing
 * how somebody is classified is deciding on a name and a registration
 * number.
 *
 * Set at creation, for an organisation entered by hand, or at onboarding for
 * the zones an organisation picks itself. Nowhere else.
 *
 * A server component now: there is no state left to hold.
 */
export function ClassificationPanel({
  zones,
  markets,
  primaryZoneId,
  alsoZoneIds,
  marketIds,
}: {
  zones: AccessZone[];
  markets: Market[];
  primaryZoneId: string | null;
  alsoZoneIds: string[];
  marketIds: string[];
}) {
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;
  const marketLabel = (id: string) =>
    markets.find((m) => m.id === id)?.label ?? id;

  const chip =
    "rounded-pill-sm bg-surface px-[13px] py-[7px] text-[15px] text-ink shadow-hairline";

  return (
    <div className="flex flex-col gap-4 rounded-card bg-ground px-5 py-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Lock
            size={15}
            strokeWidth={2}
            className="shrink-0 text-ink-60"
            aria-hidden="true"
          />
          <h3 className="m-0 eyebrow text-ink-60">Access Zones</h3>
        </div>

        {primaryZoneId || alsoZoneIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {primaryZoneId ? (
              <span className={`${chip} font-semibold`}>
                {zoneName(primaryZoneId)}
                <span className="font-normal text-ink-60"> · primary</span>
              </span>
            ) : null}
            {alsoZoneIds.map((id) => (
              <span key={id} className={chip}>
                {zoneName(id)}
              </span>
            ))}
          </div>
        ) : (
          <p className="m-0 text-[15px] leading-[1.5] text-ink-70">
            None chosen. This organisation has not finished onboarding.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-hairline-soft pt-4">
        <h3 className="m-0 eyebrow text-ink-60">Secondary markets</h3>

        {marketIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {marketIds.map((id) => (
              <span key={id} className={chip}>
                {marketLabel(id)}
              </span>
            ))}
          </div>
        ) : (
          /*
           * Said loudly, because this is now the one thing about an
           * organisation that cannot be put right from this screen, and it is
           * the thing that decides whether a woman describing a need ever
           * meets them. An organisation with no markets is found by zone and
           * by the words in its own text, and by nothing else.
           */
          <div className="flex items-start gap-2 rounded-control border border-red-200 bg-red-50 px-4 py-3">
            <TriangleAlert
              size={16}
              strokeWidth={2}
              className="mt-[3px] shrink-0 text-red-700"
              aria-hidden="true"
            />
            <p className="m-0 max-w-[58ch] text-[15px] leading-[1.5] text-red-700">
              <strong>No markets.</strong> A woman who describes a need rather
              than naming a zone will not be shown this organisation. Markets
              are set when an organisation is entered by hand, so one that
              onboarded itself arrives without any.
            </p>
          </div>
        )}
      </div>

      <p className="m-0 max-w-[64ch] text-[14px] leading-[1.55] text-ink-60">
        Not changed from here. Zones are chosen by the organisation at
        onboarding; markets are set when one is added by hand. Both decide
        where an organisation appears on the public site, so changing either
        is a deliberate act rather than something done while reading a
        verification.
      </p>
    </div>
  );
}
