import type { Metadata } from "next";
import { PublicProfileClient } from "./profile-client";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  // Fetch the profile server-side for OG metadata.
  // Fall back gracefully if unavailable so the page can still render.
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/public/profile/${encodeURIComponent(username)}`, {
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const profile = await res.json();
      const { student, card } = profile;
      const name = student?.name ?? username;
      const tier = card?.tier ?? "Developer";
      const jri = card?.jriScore != null ? Math.round(card.jriScore) : null;
      const dept = student?.department ? ` · ${student.department}` : "";
      const title = `${name} — ${tier} on SLH`;
      const description = jri != null
        ? `${name} has a Job Readiness Index of ${jri}${dept}. Verified on SkillLighthouse.`
        : `${name}'s verified developer profile on SkillLighthouse.`;

      const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/u/${username}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: profileUrl,
          siteName: "SkillLighthouse",
          type: "profile",
        },
        twitter: {
          card: "summary",
          title,
          description,
        },
      };
    }
  } catch {
    // fall through to default metadata
  }

  return {
    title: `${username} — Developer Profile · SLH`,
    description: `Verified developer profile for ${username} on SkillLighthouse.`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  return <PublicProfileClient username={username} />;
}
