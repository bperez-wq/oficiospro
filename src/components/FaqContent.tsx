"use client";

import { Reveal } from "@/components/Reveal";
import { faqContent, type FaqItem } from "@/data/i18nContent/faqContent";
import { useI18n } from "@/lib/i18n/I18nProvider";

function QuestionCard({ item }: { item: FaqItem }) {
  return (
    <article className="panel">
      <p className="eyebrow">{item.segment}</p>
      <h3 className="text-xl font-black">{item.question}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-muted">{item.answer}</p>
    </article>
  );
}

export function FaqContent() {
  const { locale } = useI18n();
  const content = faqContent[locale] ?? faqContent.es;

  return (
    <>
      <Reveal delay={0}>
        <section className="grid gap-4">
          <div>
            <p className="eyebrow">{content.creditsEyebrow}</p>
            <h2 className="text-3xl font-black text-ink">{content.creditsTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">{content.creditsIntro}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.creditQuestions.map((item) => (
              <QuestionCard key={item.question} item={item} />
            ))}
          </div>
        </section>
      </Reveal>
      <Reveal delay={80}>
        <section className="grid gap-4">
          <div>
            <p className="eyebrow">{content.generalEyebrow}</p>
            <h2 className="text-3xl font-black text-ink">{content.generalTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.generalQuestions.map((item) => (
              <QuestionCard key={item.question} item={item} />
            ))}
          </div>
        </section>
      </Reveal>
    </>
  );
}
