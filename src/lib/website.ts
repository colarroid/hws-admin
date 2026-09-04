/**
 * Turning what someone types into a link that works.
 *
 * People do not type schemes. They type `example.org`, or `www.example.org`,
 * or paste `https://example.org/about?utm_source=...` out of a browser bar.
 * Requiring `https://` rejects the first two, which is a form failing over
 * punctuation it could have supplied itself.
 *
 * So the scheme is added when it is missing, and `https` is the assumption:
 * every host worth linking to serves it, and guessing `http` would downgrade
 * a woman's connection on the strength of a typo.
 *
 * What is not accepted is anything that is not a web address. `javascript:`
 * and `data:` are links this platform would render and a woman would click,
 * so the scheme is checked rather than assumed harmless once one is present.
 */

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** A hostname with at least one dot and a plausible ending. Not a validator. */
const HOSTNAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export type WebsiteResult =
  | { ok: true; value: string | null }
  | { ok: false; error: string };

export function normaliseWebsite(raw: string | null | undefined): WebsiteResult {
  const trimmed = (raw ?? "").trim();

  // Optional. An organisation without a website is not a broken form.
  if (!trimmed) return { ok: true, value: null };

  // A bare `//example.org` is protocol-relative, which means nothing outside
  // a page. Strip it and let the scheme be added below.
  const stripped = trimmed.replace(/^\/\//, "");

  const withScheme = SCHEME.test(stripped) ? stripped : `https://${stripped}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, error: "That does not look like a web address." };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: "That does not look like a web address." };
  }

  if (!HOSTNAME.test(url.hostname)) {
    return {
      ok: false,
      error: "That does not look like a web address. Try example.org.",
    };
  }

  // Kept whole rather than reduced to the host: a small organisation's page
  // is often a path on somebody else's site, and cutting it back to the
  // domain would send women to a stranger's homepage.
  return { ok: true, value: url.toString() };
}
