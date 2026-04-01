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
import { buildGitHubConnectUrl } from "@/lib/api";
import { clearSessionTokens, getAccessToken } from "@/lib/auth";

export function CommandMenu() {
  const router = useRouter();
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

  const items = [
    {
      label: "Dashboard",
      shortcut: "G D",
      action: () => startTransition(() => router.push("/dashboard")),
    },
    {
      label: "Analyze Repository",
      shortcut: "G A",
      action: () => startTransition(() => router.push("/analyze")),
    },
    {
      label: "Login",
      shortcut: "G L",
      action: () => startTransition(() => router.push("/login")),
    },
    {
      label: "Connect GitHub",
      shortcut: "G H",
      action: () => {
        if (!getAccessToken()) {
          startTransition(() => router.push("/login"));
          return;
        }

        window.location.assign(buildGitHubConnectUrl());
      },
    },
    {
      label: "Sign Out",
      shortcut: "G O",
      action: () => {
        clearSessionTokens();
        startTransition(() => router.push("/login"));
      },
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="SLH Command Menu">
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
