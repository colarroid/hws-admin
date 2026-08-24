import { Page } from "@/components/ui/Page";

/**
 * Placeholder.
 *
 * The three admin tools are the listing review queue, organisation
 * verification, and Access Zone management. None of them has been designed,
 * and the handoff calls that the largest gap in the project: the whole trust
 * model rests on all three.
 *
 * This exists so the deployment target is real while the designs are done.
 */
export default function AdminIndex() {
  return (
    <Page width={660}>
      <h1 className="m-0 font-display text-[44px] font-medium leading-[1.1] tracking-[-0.01em]">
        Not built yet
      </h1>
      <p className="m-0 text-[17px] leading-[1.6] text-ink-70">
        Three tools live here once they are designed: the listing review queue,
        organisation verification, and Access Zone management.
      </p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[17px] leading-[1.6] text-ink-70">
        <li>
          <strong className="text-ink">Review queue.</strong> Nothing publishes
          without it. The verified stamp on the woman-facing side means nothing
          if organisations self-publish.
        </li>
        <li>
          <strong className="text-ink">Verification.</strong> Checks an
          organisation against charity or company registration, once.
        </li>
        <li>
          <strong className="text-ink">Access Zones.</strong> Add, rename,
          re-describe or retire a zone without a release. Retiring one needs a
          destination for whatever is attached to it.
        </li>
      </ul>
    </Page>
  );
}
