import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Article, Book, EventItem } from "@/lib/types";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { BookCard } from "@/components/site/BookCard";
import { ChronicleCard } from "@/components/site/ChronicleCard";
import { EventRow } from "@/components/site/EventRow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Viviane Moluh Peyou — Écrivaine, poétesse, chercheuse" },
      {
        name: "description",
        content:
          "Site officiel de Viviane Moluh Peyou. Romans, poésie, théâtre. La mise en mots des maux.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const books = useQuery({
    queryKey: ["home-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as Book[];
    },
  });

  const articles = useQuery({
    queryKey: ["home-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as Article[];
    },
  });

  const events = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as EventItem[];
    },
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="paper-bg absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="font-quote text-sm tracking-[0.3em] text-gold uppercase">
              {t("home.heroIntro")}
            </p>
            <h1 className="mt-4">Viviane Moluh Peyou</h1>
            <p className="font-quote mt-5 text-2xl text-foreground/85 sm:text-3xl">
              « {t("meta.tagline")} »
            </p>
            <p className="mt-6 max-w-xl text-base text-foreground/80">
              {t("home.introBody")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/livres"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                {t("home.heroCta")}
              </Link>
              <Link
                to="/chroniques"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-primary/30 bg-transparent px-6 text-sm font-medium text-primary transition hover:bg-primary/5"
              >
                {t("home.heroCtaSecondary")}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="relative mx-auto aspect-[4/5] w-full max-w-md"
          >
            <div className="absolute -inset-3 border border-gold/40" />
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              <div className="text-center px-6">
                <p className="font-display text-7xl text-gold/90">V</p>
                <p className="font-quote mt-2 text-primary-foreground/80">Portrait à venir</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="gold-divider" />
        <h2 className="mt-4">{t("home.introTitle")}</h2>
        <p className="font-quote mt-5 text-xl text-foreground/80">
          « {t("home.introBody")} »
        </p>
      </section>

      {/* BOOKS */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2>{t("home.featuredBooks")}</h2>
            <Link to="/livres" className="text-sm text-primary hover:text-gold">
              {t("common.seeAll")} →
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {books.data?.map((b) => (
              <BookCard key={b.id} book={b} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* CHRONICLES */}
      {articles.data && articles.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2>{t("home.latestChronicles")}</h2>
            <Link to="/chroniques" className="text-sm text-primary hover:text-gold">
              {t("common.seeAll")} →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {articles.data.map((a) => (
              <ChronicleCard key={a.id} article={a} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* EVENTS */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <h2>{t("home.upcomingEvents")}</h2>
          <div className="mt-8 space-y-4">
            {events.data && events.data.length > 0 ? (
              events.data.map((e) => <EventRow key={e.id} event={e} lang={lang} />)
            ) : (
              <p className="font-quote text-lg text-muted-foreground">
                {t("home.upcomingEventsEmpty")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="gold-divider" />
        <h2 className="mt-4">{t("home.newsletterTitle")}</h2>
        <p className="mt-3 text-foreground/80">{t("home.newsletterBody")}</p>
        <div className="mt-8 text-left">
          <NewsletterForm source="home" />
        </div>
      </section>
    </>
  );
}
