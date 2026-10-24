const configuredSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
// Preserve existing deployments when the flag is absent. An explicit false
// disables all three Auth widgets and token requirements without deleting the key.
export const turnstileSiteKey = process.env.NEXT_PUBLIC_CAPTCHA_ENABLED?.trim().toLowerCase() === "false"
  ? ""
  : configuredSiteKey;

export type TurnstileApi = {
  ready: (callback: () => void) => void;
  render: (container: HTMLElement, options: {
    sitekey: string; theme: "light" | "dark"; language: "en" | "auto";
    size: "flexible" | "compact"; action: "login" | "register" | "forgot";
    "response-field": false; callback: (token: string) => void;
    "expired-callback": () => void; "error-callback": () => void;
    "timeout-callback": () => void;
  }) => string;
  remove: (id: string) => void;
};

declare global { interface Window { turnstile?: TurnstileApi } }
let loading: Promise<TurnstileApi> | null = null;

// Shared across client navigation. A failed load can be retried.
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    let finished = false;
    const fail = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      script.remove();
      loading = null;
      reject(new Error("captcha_unavailable"));
    };
    const timeout = setTimeout(fail, 20000);
    script.onerror = fail;
    script.onload = () => {
      if (!window.turnstile) return fail();
      // Explicit rendering is available once the asynchronous script has loaded.
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve(window.turnstile);
    };
    document.head.appendChild(script);
  });
  return loading;
}
