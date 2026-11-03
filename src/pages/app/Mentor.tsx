import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CircleDot,
  Info,
  LifeBuoy,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Button, Card, CardHeader, Textarea } from '@/components/ui';
import { PageHeader } from '@/components/app/shared';
import { relativeDate } from '@/domain/compliance';
import { useApp } from '@/domain/store';
import { cn } from '@/lib/cn';

const suggested = [
  'How do I arrange a small chiller for raw and cooked food?',
  'A supplier certificate expired — what should I do?',
  'What will the officer check during a visit?',
];

export const Mentor = () => {
  const { state, sendMentorMessage } = useApp();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [state.mentorMessages.length]);

  const send = (message: string) => {
    sendMentorMessage(message);
    setDraft('');
  };

  return (
    <>
      <PageHeader
        eyebrow="Support · Halal mentor"
        title="A second opinion, before service starts."
        description="Ask about equipment, suppliers, labels or inspection preparation. The mentor replies with practical steps for a small stall."
        actions={
          <Badge tone="success" dot>
            Mentor online
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="flex h-[calc(100vh-230px)] min-h-[520px] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-800 font-display text-[12px] text-gold-300">
                  HR
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ivory bg-forest-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink">Hafiz Roslan</p>
                <p className="text-[10px] text-ink-3">
                  Programme officer · Halal mentor
                </p>
              </div>
            </div>
            <Badge tone="neutral">
              <CircleDot className="h-3 w-3 text-forest-600" /> Replies in minutes
            </Badge>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto bg-sand/20 px-5 py-5"
          >
            <div className="mx-auto mb-2 w-fit rounded-full border border-line bg-ivory px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
              Demo conversation · scripted replies
            </div>
            {state.mentorMessages.map((message) => {
              const mine = message.role === 'vendor';
              return (
                <div
                  key={message.id}
                  className={cn('flex gap-2.5', mine && 'flex-row-reverse')}
                >
                  {!mine && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-[9px] text-gold-300">
                      HR
                    </div>
                  )}
                  <div className={cn('max-w-[78%]', mine && 'text-right')}>
                    <div
                      className={cn(
                        'rounded-2xl px-3.5 py-2.5 text-[11.5px] leading-relaxed',
                        mine
                          ? 'rounded-br-md bg-forest-800 text-ivory'
                          : 'rounded-bl-md border border-line bg-paper text-ink-2',
                      )}
                    >
                      {message.body}
                    </div>
                    <p className="mt-1 px-1 text-[9px] text-ink-3">
                      {relativeDate(message.sentAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-line-soft bg-paper px-4 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggested.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => send(question)}
                  className="cursor-pointer rounded-full border border-line bg-ivory px-2.5 py-1 text-[9.5px] text-ink-2 transition-colors hover:border-forest-200 hover:bg-forest-50"
                >
                  {question}
                </button>
              ))}
            </div>
            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                send(draft);
              }}
            >
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about sourcing, storage, equipment or an inspection…"
                className="min-h-[44px] flex-1 resize-none py-2.5"
                rows={1}
                aria-label="Message the halal mentor"
              />
              <Button type="submit" size="sm" disabled={!draft.trim()} className="mb-0.5">
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </form>
            <p className="mt-2 text-[9px] leading-relaxed text-ink-3">
              Prototype notice: replies are pre-written demo guidance and must not
              be treated as a fatwa or official ruling.
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-800 font-display text-sm text-gold-300">
                HR
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink">Hafiz Roslan</p>
                <p className="text-[10px] text-ink-3">
                  Programme officer · 8 years in food safety
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-line-soft pt-3">
              {[
                ['Focus areas', 'Sourcing, storage, inspections'],
                ['Languages', 'Bahasa Melayu, English'],
                ['Availability', 'Mon–Sat · 8am–6pm'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 text-[10.5px]">
                  <span className="text-ink-3">{label}</span>
                  <span className="text-right text-ink-2">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Good questions to ask" />
            <ul className="space-y-2.5 p-4">
              {[
                'Can I use this sauce with an unclear label?',
                'How should I separate equipment in a small kitchen?',
                'What evidence should I keep for chicken?',
                'How do I prepare for a programme inspection?',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-2">
                  <LifeBuoy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-forest-700" />
              <p className="text-[12px] font-semibold text-ink">Escalation path</p>
            </div>
            <ol className="mt-3 space-y-2.5">
              {[
                ['1', 'Ask the mentor for practical guidance.'],
                ['2', 'If it concerns a certificate, contact the supplier for evidence.'],
                ['3', 'For official status, check JAKIM or the state Islamic authority.'],
              ].map(([step, text]) => (
                <li key={step} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sand font-mono text-[8px] text-ink-2">
                    {step}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
            <a
              href="https://www.halal.gov.my/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-medium text-forest-700 hover:underline"
            >
              JAKIM Halal Malaysia <ArrowUpRight className="h-3 w-3" />
            </a>
          </Card>

          <Card className="border-line bg-sand/40 p-4">
            <p className="flex items-start gap-2 text-[10px] leading-relaxed text-ink-3">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              This is a design prototype. Mentor messages are not sent to a real
              officer and are stored only in this browser.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[9.5px] text-ink-3">
              <CalendarClock className="h-3 w-3" />
              Session started {relativeDate(state.mentorMessages[0]?.sentAt ?? new Date().toISOString())}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[9.5px] text-ink-3">
              <BadgeCheck className="h-3 w-3" />
              Programme guidance, not a religious ruling
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
