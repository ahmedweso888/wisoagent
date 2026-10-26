import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, type MotionProps } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  MessageCircle,
  PlayCircle,
  X,
} from "lucide-react";

import laptopAsset from "@/assets/wiso-laptop.png";
import { Footer } from "@/components/common/Footer";
import {
  SiteHeader,
  type HeaderLink,
} from "@/components/common/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  useFaq,
  useFeatureFlags,
  usePublicContest,
  usePublicPlans,
  useSectionMap,
  useTeachers,
  type SiteSection,
} from "@/hooks/useSiteContent";
import { toArabicSafeNumber } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "wiso agent - ويسو إيجنت",
      },
      {
        name: "description",
        content:
          "مش مجرد أسئلة وخلاص. WISO بيفهم منهجك، بيظبطلك خطة مذاكرة، وبيعرفك إيه اللي ناقصك وبيحتاج شغل.",
      },
      {
        name: "google-site-verification",
        content: "UIwzs-JkXUIkM6UCZY_rbawdUJeSKoICwWlnOuVpxYw",
      },
      {
        property: "og:title",
        content: "WISO Agent — مذاكرتك على مزاج مستواك",
      },
      {
        property: "og:description",
        content:
          "خطة مذاكرة، أسئلة، تحليل لأدائك، ومعرفة بنقط ضعفك — وكل ده بيتطور معاك.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  component: Landing,
});

/** Section order and anchors are fixed in code; the copy is admin-managed. */
const SECTION_ORDER = [
  { key: "about", label: "عن WISO" },
  { key: "how", label: "إزاي بيشتغل" },
  { key: "features", label: "المميزات" },
  { key: "teachers", label: "المدرسون" },
  { key: "pricing", label: "الباقات" },
  { key: "competition", label: "المسابقة" },
  { key: "faq", label: "الأسئلة الشائعة" },
] as const;

const JOURNEY = [
  "المنهج",
  "الخطة",
  "الأسئلة",
  "الحل",
  "تحليل الأداء",
  "نقاط الضعف",
  "تطوير الخطة",
];

function SectionHeading({ section }: { section: SiteSection }) {
  return (
    <div className="max-w-2xl">
      {section.subtitle ? (
        <p className="text-sm font-bold text-primary">
          {section.subtitle}
        </p>
      ) : null}

      {section.title ? (
        <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">
          {section.title}
        </h2>
      ) : null}

      {section.description ? (
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          {section.description}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Reusable scroll reveal animation.
 * Every section fades in and moves upward slightly when entering the viewport.
 */
function RevealSection({
  children,
  className = "",
  delay = 0,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"section">, "style"> &
  Pick<MotionProps, "style"> & {
    delay?: number;
  }) {
  return (
    <motion.section
      {...props}
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 1.1,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function Landing() {
  const { map, isLoading } = useSectionMap();
  const teachers = useTeachers();
  const faq = useFaq();
  const plans = usePublicPlans();
  const contest = usePublicContest();
  const flags = useFeatureFlags();

  // نافذة دعم المنصة
  const [supportOpen, setSupportOpen] = useState(false);

  const teachersVisible =
    flags.data?.["verified_teachers"] !== false &&
    (teachers.data?.length ?? 0) > 0;

  const contestRow = contest.data as
    | {
        enabled?: boolean;
        visible?: boolean;
        prize_egp?: number;
        currency?: string;
      }
    | null
    | undefined;

  const contestVisible =
    flags.data?.["competition"] !== false &&
    Boolean(contestRow?.enabled) &&
    contestRow?.visible !== false;

  const navLinks: HeaderLink[] = SECTION_ORDER.filter((s) => {
    if (!map.has(s.key)) return false;

    if (s.key === "teachers") return teachersVisible;

    if (s.key === "competition") return contestVisible;

    if (s.key === "faq") return (faq.data?.length ?? 0) > 0;

    if (s.key === "pricing") return (plans.data?.length ?? 0) > 0;

    return true;
  }).map((s) => ({
    href: `#${s.key}`,
    label: map.get(s.key)?.subtitle || s.label,
  }));

  const hero = map.get("hero");
  const heroTitle =
    hero?.title ?? "ويسو ايجنت سهلها عليكم يطلاب البكالوريا";
  const heroCta = hero?.cta_label ?? "تسجيل الدخول";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background text-foreground"
    >
      <SiteHeader links={navLinks} ctaLabel={heroCta} />

      <main className="pt-20 sm:pt-24">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--gradient-hero)] px-5 py-14 sm:px-10 sm:py-20">
            <div className="app-grid pointer-events-none absolute inset-0 opacity-40" />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 start-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
            />

            <div className="relative grid items-center gap-8 lg:grid-cols-[.88fr_1.12fr] lg:text-start">
              <div>
                {hero?.subtitle ? (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-5 inline-flex rounded-full border border-[var(--hero-border)] bg-[var(--hero-surface)] px-4 py-2 text-sm font-bold text-[var(--hero-foreground)]"
                  >
                    {hero.subtitle}
                  </motion.p>
                ) : null}

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                  className="font-display text-4xl font-black leading-[1.22] text-[var(--hero-foreground)] sm:text-5xl lg:text-6xl"
                >
                  {heroTitle}
                </motion.h1>

                {hero?.description ? (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.06,
                    }}
                    className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--hero-muted)] sm:text-lg"
                  >
                    {hero.description}
                  </motion.p>
                ) : null}

                {/* أزرار الصفحة الرئيسية */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.12,
                  }}
                  className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
                >
                  {/* تسجيل الدخول */}
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full"
                  >
                    <Link to={hero?.cta_href ?? "/auth"}>
                      {heroCta}
                      <ArrowLeft />
                    </Link>
                  </Button>

                  {/* شوف WISO بيشتغل إزاي */}
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-[var(--hero-border)] bg-transparent text-[var(--hero-foreground)] hover:bg-[var(--hero-surface-hover)] hover:text-[var(--hero-foreground)]"
                  >
                    <a href="#how">
                      شوف WISO بيشتغل إزاي
                    </a>
                  </Button>

                  {/* محتاج مساعدة */}
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => setSupportOpen(true)}
                    className="gap-2 rounded-full border-[var(--hero-border)] bg-[var(--hero-surface)] text-[var(--hero-foreground)] transition-all duration-300 hover:scale-105 hover:bg-[var(--hero-surface-hover)] hover:text-[var(--hero-foreground)]"
                  >
                    <MessageCircle className="size-5" />
                    محتاج مساعدة؟
                  </Button>

                  {/* فيديو شرح إرسال الطلب */}
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="gap-2 rounded-full border-[var(--hero-border)] bg-[var(--hero-surface)] text-[var(--hero-foreground)] transition-all duration-300 hover:scale-105 hover:bg-[var(--hero-surface-hover)] hover:text-[var(--hero-foreground)]"
                  >
                    <a
                      href="/how-to-order.mp4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PlayCircle className="size-5" />
                      إزاي أبعت طلب؟
                    </a>
                  </Button>
                </motion.div>
              </div>

              <motion.img
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.16,
                }}
                src={laptopAsset}
                alt="واجهة WISO على اللابتوب"
                className="hero-laptop relative mx-auto w-full max-w-3xl object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* WISO TOOLS INTRO */}
        <section>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="font-display text-4xl font-black leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white drop-shadow-[0_0_18px_rgba(255,255,255,0.35)] sm:text-5xl lg:text-7xl"
          >
            وعشان WISO حاسس بيك
            <br />
            يا طالب البكالوريا
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.06,
            }}
            className="mx-auto mt-6 max-w-3xl text-lg font-extrabold leading-9 text-[var(--hero-foreground)] drop-shadow-[0_0_12px_rgba(255,255,255,0.25)] sm:text-xl lg:text-2xl"
          >
            عملنالك{" "}
            <span className="font-black text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.8)]">
              SPRIX Agent
            </span>{" "}
            جوه منصة WISO، كخدمة مستقلة جنب خدمة الأسئلة، عشان تريح
            بالك من الثقافة المالية وتركز على باقي موادك! ❤️
            <br />
            <br />

            حلّ مستويات الترم كله مع{" "}
            <span className="font-black text-cyan-300">
              SPRIX Agent
            </span>{" "}
            مقابل{" "}
            <span className="font-black text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.8)]">
              60 جنيه بس
            </span>{" "}
            😍
            <br />

            وجميع مستويات{" "}
            <span className="font-black text-cyan-300">
              QUREO
            </span>{" "}
            مقابل{" "}
            <span className="font-black text-yellow-300">
              70 جنيه
            </span>.
            <br />

            ولو إنت طالب هندسة أو علوم حاسب، تقدر تستفيد من الخدمتين
            مع بعض مقابل{" "}
            <span className="font-black text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.8)]">
              120 جنيه بس
            </span>
            ! 🔥
          </motion.p>
        </section>

        {/* JOURNEY */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{ duration: 0.6 }}
          className="mt-14 border-y border-border bg-card"
        >
          <ol className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-3 px-5 py-5 text-sm font-bold sm:grid-cols-4 lg:grid-cols-7 lg:px-10">
            {JOURNEY.map((label, index) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                }}
                className="flex items-center gap-2 text-primary"
              >
                <span className="num text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {label}
              </motion.li>
            ))}
          </ol>
        </motion.section>

        {/* ABOUT */}
        {map.get("about") ? (
          <RevealSection
            id="about"
            className="mx-auto max-w-7xl px-5 py-20 lg:px-10"
          >
            <SectionHeading section={map.get("about")!} />
          </RevealSection>
        ) : null}

        {/* HOW */}
        {map.get("how") ? (
          <RevealSection
            id="how"
            className="bg-background"
          >
            <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
              <SectionHeading section={map.get("how")!} />

              <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {["about", "features", "adaptive", "planning"]
                  .map((key) => map.get(key))
                  .filter(
                    (s): s is SiteSection => Boolean(s),
                  )
                  .map((s, index) => (
                    <motion.article
                      key={s.section_key}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{
                        once: true,
                        amount: 0.2,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="border-t-2 border-primary/20 pt-5"
                    >
                      <span className="num text-xs font-bold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3 className="mt-5 font-display text-xl font-bold">
                        {s.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {s.description}
                      </p>
                    </motion.article>
                  ))}
              </div>
            </div>
          </RevealSection>
        ) : null}

        {/* FEATURES */}
        {map.get("features") ? (
          <RevealSection
            id="features"
            className="mx-auto max-w-7xl px-5 py-20 lg:px-10"
          >
            <SectionHeading section={map.get("features")!} />

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {["generator", "adaptive", "planning"]
                .map((key) => map.get(key))
                .filter(
                  (s): s is SiteSection => Boolean(s),
                )
                .map((s, index) => (
                  <motion.article
                    key={s.section_key}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{
                      once: true,
                      amount: 0.2,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h3 className="font-display text-lg font-bold">
                      {s.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {s.description}
                    </p>
                  </motion.article>
                ))}
            </div>
          </RevealSection>
        ) : null}

        {/* TEACHERS */}
        {teachersVisible && map.get("teachers") ? (
          <RevealSection
            id="teachers"
            className="bg-background"
          >
            <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
              <SectionHeading section={map.get("teachers")!} />

              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {teachers.data?.map((t, index) => (
                  <motion.article
                    key={t.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{
                      once: true,
                      amount: 0.15,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex gap-4 rounded-xl border border-border bg-card p-5"
                  >
                    {t.image_url ? (
                      <img
                        src={t.image_url}
                        alt={t.name}
                        className="size-16 shrink-0 rounded-full object-cover"
                      />
                    ) : null}

                    <div className="min-w-0">
                      <h3 className="flex items-center gap-1.5 font-bold">
                        {t.name}
                        <BadgeCheck className="size-4 text-primary" />
                      </h3>

                      {t.specialization ? (
                        <p className="text-xs text-primary">
                          {t.specialization}
                        </p>
                      ) : null}

                      {t.description ? (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {t.description}
                        </p>
                      ) : null}

                      {t.verification_url ? (
                        <a
                          href={t.verification_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          توثيق المدرس
                        </a>
                      ) : null}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </RevealSection>
        ) : null}

        {/* PRICING */}
        {(plans.data?.length ?? 0) > 0 && map.get("pricing") ? (
          <RevealSection
            id="pricing"
            className="mx-auto max-w-7xl px-5 py-20 lg:px-10"
          >
            <SectionHeading section={map.get("pricing")!} />

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {plans.data?.map((plan, index) => {
                const features = Array.isArray(plan.features)
                  ? (plan.features as string[])
                  : [];

                return (
                  <motion.article
                    key={plan.id}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{
                      once: true,
                      amount: 0.15,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex flex-col rounded-xl border border-border bg-card p-6"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-xl font-bold">
                        {plan.name_ar}
                      </h3>

                      {plan.badge ? (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                          {plan.badge}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 flex items-baseline gap-2">
                      <span className="num font-display text-3xl font-black">
                        {toArabicSafeNumber(
                          Number(plan.price_egp),
                        )}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        جنيه
                      </span>

                      {plan.original_price_egp ? (
                        <span className="num text-sm text-muted-foreground line-through">
                          {toArabicSafeNumber(
                            Number(plan.original_price_egp),
                          )}
                        </span>
                      ) : null}
                    </p>

                    {plan.description_ar ? (
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {plan.description_ar}
                      </p>
                    ) : null}

                    {features.length ? (
                      <ul className="mt-5 space-y-2.5 text-sm">
                        {features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2"
                          >
                            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <Button
                      asChild
                      className="mt-6 w-full rounded-full"
                    >
                      <Link to="/auth">
                        اشترك الآن
                      </Link>
                    </Button>
                  </motion.article>
                );
              })}
            </div>
          </RevealSection>
        ) : null}

        {/* COMPETITION INFO */}
        {contestVisible && map.get("competition") ? (
          <RevealSection
            id="competition"
            className="bg-background"
          >
            <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
              <SectionHeading
                section={map.get("competition")!}
              />

              {contestRow?.prize_egp ? (
                <motion.p
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: 0.15,
                  }}
                  className="mt-8 font-display text-4xl font-black text-primary"
                >
                  <span className="num">
                    {toArabicSafeNumber(
                      Number(contestRow.prize_egp),
                    )}
                  </span>{" "}
                  <span className="text-2xl">
                    {contestRow.currency ?? "EGP"}
                  </span>
                </motion.p>
              ) : null}
            </div>
          </RevealSection>
        ) : null}

        {/* FAQ */}
        {(faq.data?.length ?? 0) > 0 && map.get("faq") ? (
          <RevealSection
            id="faq"
            className="mx-auto max-w-7xl px-5 py-20 lg:px-10"
          >
            <SectionHeading section={map.get("faq")!} />

            <div className="mt-10 divide-y divide-border border-y border-border">
              {faq.data?.map((item, index) => (
                <motion.details
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                  }}
                  className="group py-5"
                >
                  <summary className="cursor-pointer list-none font-bold">
                    {item.question}
                  </summary>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </motion.details>
              ))}
            </div>
          </RevealSection>
        ) : null}

        {/* CTA */}
        {map.get("cta") ? (
          <RevealSection className="mx-auto max-w-7xl px-4 pb-20 sm:px-5 lg:px-10">
            <div className="rounded-[2rem] border border-border bg-card px-6 py-16 text-center sm:px-10">
              <h2 className="font-display text-3xl font-black sm:text-4xl">
                {map.get("cta")?.title}
              </h2>

              {map.get("cta")?.description ? (
                <p className="mx-auto mt-4 max-w-xl leading-8 text-muted-foreground">
                  {map.get("cta")?.description}
                </p>
              ) : null}

              <Button
                asChild
                size="lg"
                className="mt-8 rounded-full"
              >
                <Link
                  to={map.get("cta")?.cta_href ?? "/auth"}
                >
                  {map.get("cta")?.cta_label ?? heroCta}
                </Link>
              </Button>
            </div>
          </RevealSection>
        ) : null}

        {/* COMPETITION GRAPHIC */}
        {map.get("competition") ? (
          <RevealSection className="mx-auto max-w-7xl px-4 pb-20 sm:px-5 lg:px-10">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
              <div className="relative w-full">
                {map.get("competition")?.image_url ? (
                  <img
                    src={
                      map.get("competition")?.image_url ??
                      undefined
                    }
                    alt={
                      map.get("competition")?.title ??
                      "WISO Competition"
                    }
                    className="h-auto w-full object-cover"
                  />
                ) : null}

                <h2 className="absolute inset-x-0 top-4 text-center font-display text-3xl font-black text-white drop-shadow-lg sm:text-4xl">
                  {map.get("competition")?.title}
                </h2>
              </div>

              <div className="px-6 py-10 text-center sm:px-10">
                {map.get("competition")?.description ? (
                  <p className="mx-auto mt-4 max-w-xl leading-8 text-muted-foreground">
                    {map.get("competition")?.description}
                  </p>
                ) : null}

                <Button
                  asChild
                  size="lg"
                  className="mt-8 rounded-full"
                >
                  <Link
                    to={
                      map.get("competition")?.cta_href ??
                      "/auth"
                    }
                  >
                    {map.get("competition")?.cta_label ??
                      heroCta}
                  </Link>
                </Button>
              </div>
            </div>
          </RevealSection>
        ) : null}

        {/* EMPTY STATE */}
        {!isLoading && map.size === 0 ? (
          <RevealSection className="mx-auto max-w-3xl px-5 py-24 text-center">
            <h2 className="font-display text-2xl font-bold">
              محتوى الصفحة لسه مش متظبط
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              الأقسام بتتضبط من لوحة الإدارة، وأول ما تتفعل
              هتظهر هنا على طول.
            </p>
          </RevealSection>
        ) : null}
      </main>

      <Footer />

      {/* نافذة اختيار دعم WISO */}
      {supportOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSupportOpen(false)}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-dialog-title"
            className="relative w-full max-w-md rounded-[2rem] border border-border bg-card p-7 text-center shadow-2xl"
          >
            {/* زر الإغلاق */}
            <button
              type="button"
              onClick={() => setSupportOpen(false)}
              aria-label="إغلاق"
              className="absolute left-5 top-5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            {/* أيقونة الدعم */}
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <MessageCircle className="size-8 text-primary" />
            </div>

            <h2
              id="support-dialog-title"
              className="mt-5 font-display text-2xl font-black"
            >
              دعم WISO Agent
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              محتاج مساعدة في إرسال طلبك أو عندك أي استفسار؟
              <br />
              اختار أحد أرقام الدعم وهنتواصل معاك عبر واتساب ❤️
            </p>

            {/* أرقام الدعم */}
            <div className="mt-7 grid gap-3">
              {/* دعم المنصة 1 */}
              <Button
                asChild
                size="lg"
                className="h-14 w-full gap-3 rounded-xl text-base font-bold"
              >
                <a
                  href="https://wa.me/201003244623"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-5" />
                  دعم المنصة 1
                </a>
              </Button>

              {/* دعم المنصة 2 */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 w-full gap-3 rounded-xl border-primary/30 text-base font-bold hover:bg-primary/10"
              >
                <a
                  href="https://wa.me/201068622142"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-5" />
                  دعم المنصة 2
                </a>
              </Button>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              فريق WISO موجود لمساعدتك 💚
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
