import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "social-tracker-v2";

const emptyPlatform = {
  username: "",
  followers: "",
  views: "",
  likes: "",
};

function safeNumber(value) {
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function loadSaved() {
  if (typeof window === "undefined") return { tiktok: emptyPlatform, instagram: emptyPlatform };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      tiktok: { ...emptyPlatform, ...(saved.tiktok || {}) },
      instagram: { ...emptyPlatform, ...(saved.instagram || {}) },
    };
  } catch {
    return { tiktok: emptyPlatform, instagram: emptyPlatform };
  }
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function PlatformSection({
  title,
  accent,
  platform,
  setPlatform,
  description,
  children,
}) {
  return (
    <Card className="rounded-3xl shadow-xl border-slate-200 overflow-hidden">
      <div className={`h-2 ${accent}`} />
      <CardContent className="p-5 md:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Chromebook ready
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Username"
            value={platform.username}
            onChange={(e) => setPlatform({ ...platform, username: e.target.value })}
          />
          <Input
            placeholder="Followers"
            value={platform.followers}
            onChange={(e) => setPlatform({ ...platform, followers: e.target.value })}
          />
          <Input
            placeholder="Views"
            value={platform.views}
            onChange={(e) => setPlatform({ ...platform, views: e.target.value })}
          />
          <Input
            placeholder="Likes"
            value={platform.likes}
            onChange={(e) => setPlatform({ ...platform, likes: e.target.value })}
          />
        </div>

        {children}
      </CardContent>
    </Card>
  );
}

function TikTokEmbed({ username }) {
  useEffect(() => {
    if (!username) return;
    const existing = document.querySelector('script[data-tiktok-embed="true"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      script.setAttribute("data-tiktok-embed", "true");
      document.body.appendChild(script);
    } else {
      // Re-run the embed script when the username changes.
      try {
        // TikTok embed script scans the page on load; a soft refresh helps in React.
        window.tiktokEmbedLoadedAt = Date.now();
      } catch {
        // no-op
      }
    }
  }, [username]);

  if (!username) {
    return (
      <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-500">
        Type a TikTok username to load the creator profile card.
      </div>
    );
  }

  const profileUrl = `https://www.tiktok.com/@${username.replace(/^@/, "")}`;
  const uniqueId = username.replace(/^@/, "");

  return (
    <div className="rounded-2xl border bg-white p-3 shadow-sm">
      <blockquote
        className="tiktok-embed"
        cite={profileUrl}
        data-unique-id={uniqueId}
        data-embed-type="creator"
        style={{ maxWidth: 720, minWidth: 288 }}
      >
        <section>
          <a target="_blank" rel="noreferrer" href={`${profileUrl}?refer=creator_embed`}>
            @{uniqueId}
          </a>
        </section>
      </blockquote>
    </div>
  );
}

export default function SocialTracker() {
  const saved = loadSaved();
  const [tiktok, setTiktok] = useState(saved.tiktok);
  const [instagram, setInstagram] = useState(saved.instagram);
  const [status, setStatus] = useState("Ready");
  const [activeTab, setActiveTab] = useState("overview");

  const totals = useMemo(() => {
    const totalViews = safeNumber(tiktok.views) + safeNumber(instagram.views);
    const totalFollowers = safeNumber(tiktok.followers) + safeNumber(instagram.followers);
    const totalLikes = safeNumber(tiktok.likes) + safeNumber(instagram.likes);

    return { totalViews, totalFollowers, totalLikes };
  }, [tiktok, instagram]);

  function saveAll() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tiktok, instagram }));
    setStatus("Saved locally in this browser");
  }

  function resetAll() {
    setTiktok(emptyPlatform);
    setInstagram(emptyPlatform);
    localStorage.removeItem(STORAGE_KEY);
    setStatus("Reset");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border bg-white/80 p-5 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Social Media Tracker
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                Track TikTok and Instagram followers, views, and likes. TikTok can show a live creator profile card by username. Instagram keeps a clean tracker layout and can use connected API data later.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={activeTab === "overview" ? "default" : "outline"} onClick={() => setActiveTab("overview")}>Overview</Button>
              <Button variant={activeTab === "tiktok" ? "default" : "outline"} onClick={() => setActiveTab("tiktok")}>TikTok</Button>
              <Button variant={activeTab === "instagram" ? "default" : "outline"} onClick={() => setActiveTab("instagram")}>Instagram</Button>
              <Button variant="outline" onClick={saveAll}>Save</Button>
              <Button variant="outline" onClick={resetAll}>Reset</Button>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">Status: {status}</div>
        </header>

        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="rounded-3xl shadow-xl lg:col-span-1">
              <CardContent className="p-5 space-y-4">
                <h2 className="text-xl font-bold">Combined Stats</h2>
                <div className="grid gap-3">
                  <StatPill label="Total Followers" value={totals.totalFollowers.toLocaleString()} />
                  <StatPill label="Total Views" value={totals.totalViews.toLocaleString()} />
                  <StatPill label="Total Likes" value={totals.totalLikes.toLocaleString()} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-xl lg:col-span-2">
              <CardContent className="p-5 md:p-6 space-y-4">
                <h2 className="text-xl font-bold">Quick Setup</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border bg-slate-50 p-4">
                    <div className="font-semibold">TikTok</div>
                    <p className="mt-1 text-sm text-slate-600">
                      Type a username and the page will render a TikTok creator profile card. TikTok’s embed for creator profiles shows followers, following, likes, and recent videos.
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-slate-50 p-4">
                    <div className="font-semibold">Instagram</div>
                    <p className="mt-1 text-sm text-slate-600">
                      Instagram live stats require an authorized professional account connection through Meta’s API. The tracker is ready for manual entry now and can be wired to an API later.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "tiktok" && (
          <PlatformSection
            title="TikTok"
            accent="bg-black"
            platform={tiktok}
            setPlatform={setTiktok}
            description="Enter a TikTok username and the profile card will load directly on the page."
          >
            <TikTokEmbed username={tiktok.username} />
          </PlatformSection>
        )}

        {activeTab === "instagram" && (
          <PlatformSection
            title="Instagram"
            accent="bg-pink-500"
            platform={instagram}
            setPlatform={setInstagram}
            description="Track Instagram stats now, and connect an official API later for live lookups on professional accounts."
          >
            <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">Live Instagram lookup</p>
              <p>
                Instagram Graph API access is designed for business and creator accounts, and the IG User object includes fields such as username and followers_count for eligible professional accounts.
              </p>
              <p>
                This page is ready for a future API connector. For now, use the inputs above to track the numbers you want.
              </p>
            </div>
          </PlatformSection>
        )}

        <Card className="rounded-3xl shadow-xl">
          <CardContent className="p-5 md:p-6">
            <h2 className="text-xl font-bold text-slate-900">Live Snapshot</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatPill label="TikTok Followers" value={safeNumber(tiktok.followers).toLocaleString()} />
              <StatPill label="TikTok Views" value={safeNumber(tiktok.views).toLocaleString()} />
              <StatPill label="Instagram Followers" value={safeNumber(instagram.followers).toLocaleString()} />
              <StatPill label="Instagram Views" value={safeNumber(instagram.views).toLocaleString()} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
