import { Page } from "@/components/ui/Page";
import { SignInForm } from "@/components/admin/SignInForm";

export default function SignInPage() {
  return (
    <Page width={460} top={80} gap={22}>
      <div className="flex flex-col gap-[10px]">
        <h1 className="m-0 font-display text-[32px] font-medium leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
          HWS admin
        </h1>
        <p className="m-0 text-[17px] leading-[1.55] text-ink-70">
          Sign in with a one-time code. Accounts are created by hand, not here.
        </p>
      </div>
      <SignInForm />
    </Page>
  );
}
