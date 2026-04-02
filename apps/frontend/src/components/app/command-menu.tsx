"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { buildGitHubConnectUrl, logout } from "@/lib/api-client";
import { useAuth } from "./auth-context";
import { isAdmin } from "@/lib/auth";

export function CommandMenu() {
  const router = useRouter();
  const { user, logout: localLogout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isAdminUser = isAdmin(user?.role);

  const items = [
    {
      label: "Dashboard",
      shortcut: "G D",
      action: () => startTransition(() => router.push(isAdminUser ? "/admin" : "/dashboard")),
    },
    {
      label: "Analyze Repository",
      shortcut: "G A",
      action: () => startTransition(() => router.push("/analyze")),
      hidden: isAdminUser || !user,
    },
    {
      label: "Market Fit",
      shortcut: "G M",
      action: () => startTransition(() => router.push("/dashboard/market-fit")),
      hidden: isAdminUser || !user,
    },
    {
      label: "Login",
      shortcut: "G L",
      action: () => startTransition(() => router.push("/login")),
      hidden: !!user,
    },
    {
      label: "Connect GitHub",
      shortcut: "G H",
      action: () => {
        if (!user) {
          startTransition(() => router.push("/login"));
          return;
        }
        window.location.assign(buildGitHubConnectUrl());
      },
      hidden: !user || isAdminUser,
    },
    {
      label: "Sign Out",
      shortcut: "G O",
      action: async () => {
        await logout();
        localLogout();
        startTransition(() => router.push("/login"));
      },
      hidden: !user,
    },
  ].filter((item) => !item.hidden);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-xl border-0 bg-transparent shadow-none">
        <CommandInput placeholder="Jump to a screen or action..." />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {items.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => {
                  setOpen(false);
                  item.action();
                }}
              >
                {item.label}
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
