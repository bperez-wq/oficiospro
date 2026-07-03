import Link from "next/link";
import type { AnswerEngineTopic } from "@/data/answerEngineTopics";

/**
 * AnswerBlock: bloque de respuesta directa para AEO/GEO.
 *
 * Muestra una pregunta con respuesta corta citable (para featured snippets y
 * motores de respuesta IA), detalle opcional, CTA y enlaces relacionados.
 *
 * Reglas de uso (docs/soro-seo-editorial-policy.md):
 * - Usar solo con temas de answerEngineTopics con editorialStatus "approved".
 * - Maximo 1-2 bloques por pagina: no convertir paginas en paredes de texto.
 * - Paginas candidatas: /especialistas-fundadores, /formalizacion,
 *   /instituciones, /trabajos/[oficio] y /servicios/[servicio] con baja friccion.
 */

export type AnswerBlockLink = {
  label: string;
  href: string;
};

export function AnswerBlock({
  question,
  shortAnswer,
  detailedAnswer,
  ctaLabel,
  ctaHref,
  relatedLinks = [],
  className = "",
}: {
  question: string;
  shortAnswer: string;
  detailedAnswer?: string;
  ctaLabel?: string;
  ctaHref?: string;
  relatedLinks?: AnswerBlockLink[];
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] border border-line bg-brand-mist p-6 shadow-sm sm:p-8 ${className}`}
      aria-label={question}
    >
      <h2 className="text-lg font-semibold text-ink sm:text-xl">{question}</h2>
      <p className="mt-3 text-base font-medium leading-relaxed text-ink">{shortAnswer}</p>
      {detailedAnswer ? (
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{detailedAnswer}</p>
      ) : null}
      {ctaLabel && ctaHref ? (
        <div className="mt-5">
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand/20"
          >
            {ctaLabel}
          </Link>
        </div>
      ) : null}
      {relatedLinks.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {relatedLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-muted transition hover:border-brand/30 hover:text-brand"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** Variante que consume directamente un tema AEO aprobado. */
export function AnswerBlockFromTopic({
  topic,
  ctaLabel,
  className = "",
}: {
  topic: AnswerEngineTopic;
  ctaLabel?: string;
  className?: string;
}) {
  return (
    <AnswerBlock
      question={topic.question}
      shortAnswer={topic.shortAnswer}
      detailedAnswer={topic.detailedAnswer}
      ctaLabel={ctaLabel}
      ctaHref={ctaLabel ? topic.relatedPage : undefined}
      className={className}
    />
  );
}
