"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { specialistAssistantSuggestedQuestions } from "@/data/specialistAssistantKnowledge";
import { trackEvent } from "@/lib/analytics";
import {
  buildAssistantResponse,
  detectSpecialistAssistantIntent,
  sanitizeSpecialistAssistantQuestion,
  shouldEscalateToHuman,
  type SpecialistAssistantResponse,
  type SpecialistAssistantSession,
} from "@/lib/specialistAssistant";

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  response?: SpecialistAssistantResponse;
};

const storageKey = "oficiospro.specialistAssistantSession";

export function SpecialistAssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [session, setSession] = useState<SpecialistAssistantSession>(() => createSession());
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola. Soy el asistente OficiosPro. Te ayudo a buscar especialistas, ofrecer servicios o resolver dudas con informacion curada de la plataforma.",
    },
  ]);

  useEffect(() => {
    const stored = readStoredSession();
    if (stored) setSession(stored);
  }, []);

  useEffect(() => {
    persistSession(session);
  }, [session]);

  const visibleSuggestions = useMemo(() => specialistAssistantSuggestedQuestions.slice(0, 6), []);
  const hidden = shouldHideAssistant(pathname);

  if (hidden) return null;

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      if (next) {
        void trackEvent({
          eventName: "assistant_opened",
          sourceComponent: "SpecialistAssistantWidget",
          metadata: {
            questionCount: session.questionCount,
            infoSeekingCount: session.infoSeekingCount,
          },
        });
      }
      return next;
    });
  }

  function askSuggested(nextQuestion: string) {
    void handleQuestion(nextQuestion);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleQuestion(question);
  }

  async function handleQuestion(rawQuestion: string) {
    const cleanQuestion = rawQuestion.trim();
    if (!cleanQuestion) return;

    const sanitized = sanitizeSpecialistAssistantQuestion(cleanQuestion);
    const intentGuess = detectSpecialistAssistantIntent(cleanQuestion);
    const nextSession: SpecialistAssistantSession = {
      ...session,
      questionCount: session.questionCount + 1,
      infoSeekingCount: session.infoSeekingCount + 1,
      lastQuestions: [...session.lastQuestions, sanitized].slice(-8),
    };
    const response = buildAssistantResponse(cleanQuestion, nextSession);
    const escalated = shouldEscalateToHuman(nextSession, response.intent);
    const storedSession = { ...nextSession, escalated: nextSession.escalated || escalated };

    setSession(storedSession);
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: sanitized },
      { id: `assistant-${Date.now()}`, role: "assistant", content: response.answer, response },
    ]);
    setQuestion("");

    void trackEvent({
      eventName: "assistant_question_asked",
      sourceComponent: "SpecialistAssistantWidget",
      metadata: {
        questionLength: cleanQuestion.length,
        intentGuess,
        questionCount: storedSession.questionCount,
        infoSeekingCount: storedSession.infoSeekingCount,
      },
    });

    void trackEvent({
      eventName: "assistant_intent_detected",
      sourceComponent: "SpecialistAssistantWidget",
      metadata: {
        intent: response.intent,
        matchedEntryId: response.matchedEntryId,
        confidence: Number(response.confidence.toFixed(2)),
        fallbackType: response.fallbackType,
        escalationRecommended: response.escalationRecommended,
      },
    });

    if (escalated || response.fallbackType) {
      void trackEvent({
        eventName: "assistant_escalated",
        sourceComponent: "SpecialistAssistantWidget",
        metadata: {
          reason: response.fallbackType ?? "escalation_recommended",
          intentGuess,
          questionSanitized: sanitized,
          questionCount: storedSession.questionCount,
          infoSeekingCount: storedSession.infoSeekingCount,
        },
      });
    }
  }

  function registerConcreteAction(link: { href: string; label?: string; eventName?: string; serviceSlug?: string }) {
    setSession((current) => {
      const next = { ...current, infoSeekingCount: 0, escalated: false };
      persistSession(next);
      return next;
    });
    void trackEvent({
      eventName: link.eventName ?? "assistant_action_clicked",
      sourceComponent: "SpecialistAssistantWidget",
      metadata: {
        href: link.href,
        label: link.label,
        serviceSlug: link.serviceSlug,
        source: "assistant",
      },
    });
  }

  return (
    <aside className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-3 z-40 md:right-6">
      {open ? (
        <section
          className="mb-3 grid max-h-[72vh] w-[calc(100vw-1.5rem)] max-w-[410px] overflow-hidden rounded-[24px] border border-line bg-white shadow-lift"
          role="dialog"
          aria-modal="false"
          aria-label="Asistente OficiosPro"
        >
          <header className="flex items-start justify-between gap-3 border-b border-line bg-brand-soft p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-brand-dark">Asistente OficiosPro</p>
              <h2 className="text-base font-black text-ink">Te ayudo a avanzar</h2>
              <p className="mt-1 text-xs font-bold leading-5 text-muted">Busca especialistas, ofrece servicios o resuelve dudas.</p>
            </div>
            <button
              className="grid h-9 w-9 place-items-center rounded-full border border-brand/20 bg-white text-lg font-black text-brand-dark"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
            >
              x
            </button>
          </header>

          <div className="grid max-h-[44vh] gap-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`rounded-2xl p-3 text-sm font-bold leading-6 ${
                  message.role === "user" ? "ml-8 bg-ink text-white" : "mr-8 border border-line bg-slate-50 text-ink"
                }`}
              >
                <p>{message.content}</p>
                {message.response ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dedupeAssistantLinks([...message.response.actionButtons, ...message.response.relatedLinks]).map((link) => (
                      <Link
                        key={link.href}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-brand-dark shadow-sm hover:bg-brand-soft"
                        href={link.href}
                        onClick={() => registerConcreteAction(link)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="grid gap-3 border-t border-line p-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {visibleSuggestions.map((item) => (
                <button
                  key={item}
                  className="shrink-0 rounded-full border border-line bg-white px-3 py-2 text-xs font-black text-muted transition hover:border-brand hover:text-brand-dark"
                  type="button"
                  onClick={() => askSuggested(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={submit}>
              <input
                className="min-w-0 flex-1 rounded-2xl border border-line px-4 py-3 text-sm font-bold outline-none transition focus:border-brand focus:shadow-focus"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Escribe una duda"
                maxLength={240}
              />
              <button className="btn-primary px-4 py-3 text-sm" type="submit">
                Enviar
              </button>
            </form>
            <div className="grid grid-cols-3 gap-2">
              <Link className="btn-secondary justify-center px-2 py-2 text-xs" href="/especialistas?source=assistant" onClick={() => registerConcreteAction({ href: "/especialistas?source=assistant", label: "Buscar especialista", eventName: "assistant_find_service_clicked" })}>
                Buscar
              </Link>
              <Link className="btn-secondary justify-center px-2 py-2 text-xs" href="/especialistas-fundadores?source=assistant&intent=offer_services" onClick={() => registerConcreteAction({ href: "/especialistas-fundadores?source=assistant&intent=offer_services", label: "Ofrecer servicios", eventName: "assistant_offer_services_clicked" })}>
                Ofrecer
              </Link>
              <Link className="btn-secondary justify-center px-2 py-2 text-xs" href="/contacto?source=assistant" onClick={() => registerConcreteAction({ href: "/contacto?source=assistant", label: "Soporte", eventName: "assistant_action_clicked" })}>
                Soporte
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <button
        className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand px-4 py-3 text-sm font-black text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-brand-dark"
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/18 text-xs">OP</span>
        Te ayudo?
      </button>
    </aside>
  );
}

function shouldHideAssistant(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname === "/bolsa" ||
    pathname.startsWith("/bolsa/") ||
    pathname === "/login"
  );
}

function dedupeAssistantLinks(links: { href: string; label: string; eventName?: string; serviceSlug?: string }[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

function createSession(): SpecialistAssistantSession {
  return {
    sessionId: browserId(),
    questionCount: 0,
    infoSeekingCount: 0,
    lastQuestions: [],
    escalated: false,
  };
}

function readStoredSession() {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as SpecialistAssistantSession;
  } catch {
    return null;
  }
}

function persistSession(session: SpecialistAssistantSession) {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(session));
  } catch {
    // The assistant must keep working even if sessionStorage is unavailable.
  }
}

function browserId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `assistant_${crypto.randomUUID()}`;
  return `assistant_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
