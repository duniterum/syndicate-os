import { useQuery } from "@tanstack/react-query";

// Runtime "is the wallet auth zone live?" signal. When the server auth zone is
// dark (challenge / session return 404), the sign-in entry points render a calm
// "coming soon" state instead of letting RainbowKit surface its raw "Error
// preparing message". The UI therefore follows the real backend posture with no
// build-time flag and no new env var — and flips itself back on automatically
// the moment the zone is enabled.
//
// The actual /api/auth probe stays INSIDE the wallet module (reached via dynamic
// import), so the auth-zone transport boundary is unchanged and this non-wallet
// file never statically imports @/wallet/.
export type AuthAvailability = "loading" | "live" | "dark";

export function useAuthAvailability(): AuthAvailability {
  const { data, isPending } = useQuery({
    queryKey: ["auth", "availability"],
    queryFn: async (): Promise<"live" | "dark"> => {
      const { fetchAuthAvailability } = await import("@/wallet/walletSession");
      return fetchAuthAvailability();
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
  // Fail-closed while loading or on any error: treat as dark so the raw error
  // can never flash before the probe resolves.
  return isPending ? "loading" : (data ?? "dark");
}
