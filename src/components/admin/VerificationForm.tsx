"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/Field";
import {
  markVerified,
  askForEvidence,
  markRejected,
} from "@/app/organisations/actions";
import type { VerificationStatus } from "@/lib/data/organisations";

type Mode = "none" | "evidence" | "reject";

/**
 * The decision.
 *
 * Verifying is one button because it is the common case and should not be
 * buried behind a form. The other two require a note, which is sent to the
 * organisation word for word: a refusal with no reason gives them nothing to
 * act on, and this state is reversible.
 */
export function VerificationForm({
  organisationId,
  status,
  listingCount,
  noteError,
  otherError,
}: {
  organisationId: string;
  status: VerificationStatus;
  listingCount: number;
  noteError: boolean;
  otherError: string | null;
}) {
  const [mode, setMode] = useState<Mode>(noteError ? "evidence" : "none");

  return (
    <div className="flex flex-col gap-5 border-t border-hairline pt-7">
      {otherError ? (
        <p
          role="alert"
          className="m-0 rounded-control border border-red-200 bg-red-50 px-4 py-3 text-[16px] leading-[1.5] text-red-700"
        >
          {otherError}
        </p>
      ) : null}

      {status !== "verified" ? (
        <form action={markVerified} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={organisationId} />
          <Button type="submit">This organisation is real, verify it</Button>
          <span className="text-[14px] leading-[1.5] text-ink-60">
            {listingCount === 0
              ? "They have nothing waiting yet."
              : `Unblocks ${listingCount} listing${listingCount === 1 ? "" : "s"}, which still ${listingCount === 1 ? "goes" : "go"} through review before anyone sees ${listingCount === 1 ? "it" : "them"}.`}
          </span>
        </form>
      ) : (
        <form action={markRejected} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={organisationId} />
          <p className="m-0 text-[16px] leading-[1.6] text-ink-70">
            Already verified. Withdrawing it stops anything new going live and
            needs a reason, which they are sent.
          </p>
          <TextAreaField
            label="Why are you withdrawing this?"
            name="note"
            rows={2}
            required
            error={noteError ? "Say why before withdrawing." : undefined}
          />
          <Button type="submit" variant="destructive" size="inline" className="self-start">
            Withdraw verification
          </Button>
        </form>
      )}

      {status !== "verified" ? (
        <div className="flex flex-col gap-4 border-t border-hairline-soft pt-5">
          {mode === "none" ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="inline"
                onClick={() => setMode("evidence")}
              >
                Ask for more
              </Button>
              <Button
                variant="secondary"
                size="inline"
                onClick={() => setMode("reject")}
              >
                Decline for now
              </Button>
            </div>
          ) : (
            <form
              action={mode === "evidence" ? askForEvidence : markRejected}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="id" value={organisationId} />
              <TextAreaField
                label={
                  mode === "evidence"
                    ? "What do you need from them?"
                    : "Why can't you verify them?"
                }
                name="note"
                rows={3}
                required
                placeholder={
                  mode === "evidence"
                    ? "e.g. We could not find SC123456 on the register. Send us a link to your entry, or the name of a funder we can check with."
                    : "e.g. We could not confirm this organisation exists at the address given."
                }
                hint="Sent to them word for word, so write it to them rather than about them."
                error={noteError ? "Say what you need before sending." : undefined}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  variant={mode === "reject" ? "destructive" : "primary"}
                  size="inline"
                >
                  {mode === "evidence" ? "Ask for this" : "Decline for now"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="inline"
                  onClick={() => setMode("none")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
