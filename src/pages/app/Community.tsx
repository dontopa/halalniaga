import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  LifeBuoy,
  MapPin,
  MessageSquare,
  MessagesSquare,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Badge, Button, Card, CardHeader, Textarea } from '@/components/ui';
import { PageHeader, Toast, useToast } from '@/components/app/shared';
import { relativeDate } from '@/domain/compliance';
import { useApp } from '@/domain/store';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

const guidelines = [
  'Share what worked, not only what went wrong.',
  'Never post a supplier’s private documents or contact details.',
  'Disagree with the practice, not the person.',
  'If a certificate looks wrong, ask a programme officer before naming a business.',
];

export const Community = () => {
  const t = useT();
  const { state, addPost } = useApp();
  const { toast, show, clear } = useToast();
  const [draft, setDraft] = useState('');
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const posts = [...state.posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const submit = () => {
    if (!draft.trim()) return;
    addPost(draft);
    setDraft('');
    show(t('Posted to the pilot community.'));
  };

  return (
    <>
      <PageHeader
        eyebrow={t('Support · Halal community')}
        title={t('The practical knowledge lives with the vendors.')}
        description={t(
          'A space for small vendors to compare notes on suppliers, equipment, inspections and the small decisions that make compliance stick.',
        )}
        actions={
          <Badge tone="forest" dot>
            {t('{area} chapter', { area: state.vendor.area })}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-[12px] text-gold-300">
                NH
              </div>
              <div className="flex-1">
                <p className="text-[12.5px] font-semibold text-ink">
                  {state.vendor.owner}
                </p>
                <p className="text-[10px] text-ink-3">
                  {state.vendor.stall} · {state.vendor.area}
                </p>
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={t(
                    'Ask a question, share a supplier experience, or describe how you solved a handling problem…',
                  )}
                  className="mt-3 min-h-[96px]"
                  maxLength={600}
                  aria-label={t('Write a community post')}
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-[10px] text-ink-3">
                    {t('{count}/600 · visible to the pilot community', {
                      count: draft.length,
                    })}
                  </p>
                  <Button size="sm" onClick={submit} disabled={!draft.trim()}>
                    <Send className="h-3.5 w-3.5" /> {t('Post')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {posts.map((post) => (
            <Card key={post.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand font-display text-[11px] text-forest-800">
                  {post.author
                    .split(' ')
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[12.5px] font-semibold text-ink">
                        {post.author}
                      </p>
                      <p className="text-[10px] text-ink-3">{t(post.role)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[9.5px] text-ink-3">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {post.area}
                      </span>
                      <span>·</span>
                      <span>{relativeDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-2">
                    {t(post.body)}
                  </p>
                  <div className="mt-3 flex items-center gap-4 border-t border-line-soft pt-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setLiked((current) => ({
                          ...current,
                          [post.id]: !current[post.id],
                        }))
                      }
                      aria-pressed={Boolean(liked[post.id])}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1.5 text-[10.5px] transition-colors',
                        liked[post.id]
                          ? 'text-clay'
                          : 'text-ink-3 hover:text-clay',
                      )}
                    >
                      <Heart
                        className={cn('h-3.5 w-3.5', liked[post.id] && 'fill-current')}
                      />
                      {post.likes + (liked[post.id] ? 1 : 0)}
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-3">
                      <MessageSquare className="h-3.5 w-3.5" /> {t('Reply')}
                    </span>
                    <span className="ml-auto font-mono text-[9px] text-ink-3/60">
                      {post.area === 'Kota Kinabalu'
                        ? t('Local chapter')
                        : t('Pilot network')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-forest-700" />
              <p className="text-[12px] font-semibold text-ink">{t('Pilot community')}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['128', 'Members'],
                ['34', 'Posts / week'],
                ['05', 'Districts'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-line bg-ivory px-2 py-2.5 text-center">
                  <p className="font-display text-lg text-ink">{value}</p>
                  <p className="text-[8.5px] text-ink-3">{t(label)}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[9.5px] leading-relaxed text-ink-3">
              {t('Demo community data. Posts are stored locally in this browser.')}
            </p>
          </Card>

          <Card>
            <CardHeader title={t('Community guidelines')} />
            <ul className="space-y-2.5 p-4">
              {guidelines.map((guideline) => (
                <li key={guideline} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
                  {t(guideline)}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-gold-500/25 bg-gold-100/30 p-5">
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-gold-700" />
              <p className="text-[12px] font-semibold text-ink">
                {t('Need a private answer?')}
              </p>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-2">
              {t(
                'Some questions are better asked one-to-one — especially about a supplier relationship or an inspection finding.',
              )}
            </p>
            <Link
              to="/app/mentor"
              className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-medium text-forest-700 hover:underline"
            >
              {t('Message the halal mentor')} <MessagesSquare className="h-3 w-3" />
            </Link>
          </Card>
        </div>
      </div>

      <Toast toast={toast} onClose={clear} />
    </>
  );
};
