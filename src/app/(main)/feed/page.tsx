'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Rss } from 'lucide-react';
import { FeedCard, FeedItem } from '@/components/feed/FeedCard';
import { FeedFilter, FeedFilterBar } from '@/components/feed/FeedFilterBar';
import { useArxivFeed } from '@/hooks/useArxivFeed';
import { useRssFeeds } from '@/hooks/useRssFeeds';

const MOCK_ARTICLES: Extract<FeedItem, { type: 'article' }>[] = [
    {
        id: '1',
        type: 'article',
        title:
            'Attention Is All You Need: Revisiting Transformer Architecture for Biological Sequence Modeling',
        abstract:
            'We present a novel adaptation of the transformer architecture optimised for biological sequence data, achieving state-of-the-art performance on protein folding benchmarks while reducing computational complexity by 40%.',
        authors: ['Sarah J. Mitchell', 'Arun Patel', 'Li Wei'],
        tags: ['transformers', 'bioinformatics', 'deep-learning'],
        community: 'Computational Biology',
        ratings: 47,
        comments: 23,
        discussions: 8,
        timestamp: dayjs().subtract(2, 'hour').toISOString(),
    },
    {
        id: '2',
        type: 'article',
        title:
            'Open Peer Review Improves Scientific Reproducibility: A Meta-Analysis of 1,200 Studies',
        abstract:
            'Through systematic analysis of 1,200 studies published under open vs. closed peer review conditions, we demonstrate that open review increases reproducibility rates by 31% and reduces reporting bias.',
        authors: ['Maria Garcia', "James O'Brien"],
        tags: ['open-science', 'peer-review', 'meta-analysis'],
        community: 'Science Policy',
        ratings: 102,
        comments: 67,
        discussions: 14,
        timestamp: dayjs().subtract(5, 'hour').toISOString(),
    },
];

const MOCK_DISCUSSIONS: Extract<FeedItem, { type: 'discussion' }>[] = [
    {
        id: '101',
        type: 'discussion',
        topic: 'Should negative results be published more prominently in peer review?',
        content:
            'The publication bias toward positive results is well-documented. I argue that negative results often carry equal or greater scientific value, and our review system should reflect this...',
        username: 'prof_kwame_asante',
        commentsCount: 19,
        articleTitle: 'Open Peer Review Improves Scientific Reproducibility',
        timestamp: dayjs().subtract(1, 'hour').toISOString(),
    },
    {
        id: '102',
        type: 'discussion',
        topic:
            'Methodology concern: the protein folding benchmark used here has known dataset contamination',
        content:
            'After examining Table 3, I believe the CASP15 subset used overlaps with training data in several baseline models, which may inflate the reported improvements...',
        username: 'dr_chen_xu',
        commentsCount: 7,
        articleTitle: 'Revisiting Transformer Architecture for Biological Sequence Modeling',
        timestamp: dayjs().subtract(3, 'hour').toISOString(),
    },
];

const MOCK_POSTS: Extract<FeedItem, { type: 'post' }>[] = [
    {
        id: '201',
        type: 'post',
        title: 'Why I left traditional peer review — and what I found instead',
        content:
            'After 15 years navigating the traditional peer review system, I finally embraced open science practices. The transparency has been transformative for my research and my mental health as a scientist...',
        username: 'dr_priya_nair',
        likes: 284,
        comments: 41,
        timestamp: dayjs().subtract(4, 'hour').toISOString(),
    },
    {
        id: '202',
        type: 'post',
        title: 'The reproducibility crisis is not about bad scientists',
        content:
            "We have a systems problem, not a people problem. Incentive structures in academia reward novelty over rigor, quantity over quality. Until we fix the incentives, individual effort alone won't solve this...",
        username: 'thomas_reyes',
        likes: 156,
        comments: 28,
        imageUrl: 'https://picsum.photos/600/200?random=42',
        timestamp: dayjs().subtract(7, 'hour').toISOString(),
    },
];

const MOCK_NOTIFICATIONS: Extract<FeedItem, { type: 'notification' }>[] = [
    {
        id: '301',
        type: 'notification',
        message:
            'dr_chen_xu replied to your comment on "Transformer Architecture for Biological Sequence Modeling"',
        notificationType: 'Comment Replied',
        isRead: false,
        link: '/articles/1',
        timestamp: dayjs().subtract(30, 'minute').toISOString(),
    },
    {
        id: '302',
        type: 'notification',
        message:
            'Your article "Neural Correlates of Scientific Curiosity" was accepted into the Neuroscience community journal.',
        notificationType: 'Article Accepted',
        isRead: true,
        link: '/articles/my-article',
        timestamp: dayjs().subtract(1, 'day').toISOString(),
    },
];

const ARXIV_CATEGORIES = [
    { value: 'cs.AI', label: 'cs.AI — Artificial Intelligence' },
    { value: 'cs.LG', label: 'cs.LG — Machine Learning' },
    { value: 'q-bio', label: 'q-bio — Quantitative Biology' },
    { value: 'physics.bio-ph', label: 'physics — Biological Physics' },
    { value: 'stat.ML', label: 'stat.ML — Machine Learning (Stats)' },
];


export default function FeedPage() {
    const [filter, setFilter] = useState<FeedFilter>('all');
    const [arxivCategory, setArxivCategory] = useState('cs.AI');
    const [rssUrls, setRssUrls] = useState<string[]>([]);
    const [rssInput, setRssInput] = useState('');

    const addRssUrl = (url: string) => {
        const trimmed = url.trim();
        if (!trimmed || rssUrls.includes(trimmed)) return;
        setRssUrls((prev) => [...prev, trimmed]);
        setRssInput('');
    };

    const rssFeedResults = useRssFeeds(rssUrls);

    const isRssLoading = rssFeedResults.some((r) => r.isLoading);
    const isRssError = rssFeedResults.some((r) => r.isError);
    const rssData = rssFeedResults.flatMap((r) => r.data ?? []);

    const {
        data: arxivData,
        isLoading: isArxivLoading,
        isError: isArxivError,
    } = useArxivFeed(arxivCategory, 5);

    const arxivItems: Extract<FeedItem, { type: 'arxiv' }>[] = useMemo(
        () =>
            (arxivData ?? []).map((entry) => ({
                id: entry.id,
                type: 'arxiv' as const,
                title: entry.title,
                summary: entry.summary,
                authors: entry.authors,
                published: entry.published,
                timestamp: entry.published,
                arxivUrl: entry.arxivUrl,
                pdfUrl: entry.pdfUrl,
                categories: entry.categories,
            })),
        [arxivData]
    );

    const rssItems: Extract<FeedItem, { type: 'rss' }>[] = useMemo(
        () =>
            (rssData ?? []).map((item) => ({
                id: item.id,
                type: 'rss' as const,
                title: item.title,
                summary: item.summary,
                link: item.link,
                source: item.source,
                timestamp: item.published,
            })),
        [rssData]
    );

    const allItems: FeedItem[] = useMemo(() => {
        const merged: FeedItem[] = [
            ...MOCK_ARTICLES,
            ...MOCK_DISCUSSIONS,
            ...MOCK_POSTS,
            ...MOCK_NOTIFICATIONS,
            ...arxivItems,
            ...rssItems,
        ];
        return merged.sort(
            (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
        );
    }, [arxivItems, rssItems]);

    const FILTER_TO_TYPE: Partial<Record<FeedFilter, FeedItem['type']>> = {
        articles: 'article',
        discussions: 'discussion',
        posts: 'post',
        notifications: 'notification',
        arxiv: 'arxiv',
        rss: 'rss',
    };

    const filteredItems = useMemo(() => {
        if (filter === 'all') return allItems;
        const type = FILTER_TO_TYPE[filter];
        if (!type) return allItems;
        return allItems.filter((item) => item.type === type);
    }, [allItems, filter]);

    const counts = useMemo<Partial<Record<FeedFilter, number>>>(
        () => ({
            all: allItems.length,
            articles: MOCK_ARTICLES.length,
            discussions: MOCK_DISCUSSIONS.length,
            posts: MOCK_POSTS.length,
            arxiv: arxivItems.length,
            notifications: MOCK_NOTIFICATIONS.length,
        }),
        [allItems.length, arxivItems.length]
    );

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                        <Rss className="h-5 w-5 text-functional-green" />
                        Your Feed
                    </h1>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                        Articles · Discussions · Blogs · Live preprints from arXiv
                    </p>
                </div>

                <select
                    value={arxivCategory}
                    onChange={(e) => setArxivCategory(e.target.value)}
                    className="rounded-lg border border-common-contrast/20 bg-common-cardBackground px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                    {ARXIV_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-5 flex gap-2">
                <input
                    type="url"
                    value={rssInput}
                    onChange={(e) => setRssInput(e.target.value)}
                    placeholder="Paste a journal RSS feed URL (e.g. Nature, PLOS ONE)…"
                    className="flex-1 rounded-lg border border-common-contrast/20 bg-common-cardBackground px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-orange-500"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') addRssUrl(rssInput);
                    }}
                />
                <button
                    onClick={() => addRssUrl(rssInput)}
                    disabled={!rssInput.trim() || isRssLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                    <Rss className="h-3 w-3" />
                    {isRssLoading ? 'Loading…' : 'Add Feed'}
                </button>
            </div>

            {rssUrls.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {rssUrls.map((url) => {
                        const label = (() => { try { return new URL(url).hostname; } catch { return url; } })();
                        return (
                            <span
                                key={url}
                                className="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-[11px] text-orange-600 dark:text-orange-400"
                            >
                                <Rss className="h-3 w-3" />
                                {label}
                                <button
                                    onClick={() => setRssUrls((prev) => prev.filter((u) => u !== url))}
                                    className="ml-0.5 hover:text-orange-800 dark:hover:text-orange-200"
                                    aria-label={`Remove ${label}`}
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            <div className="mb-5">
                <FeedFilterBar active={filter} onChange={setFilter} counts={counts} />
            </div>

            <div className="flex flex-col gap-3">

                {isArxivLoading && (filter === 'all' || filter === 'arxiv') && (
                    <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 px-4 py-3 text-center text-xs text-teal-600 dark:text-teal-400">
                        Fetching latest preprints from arXiv…
                    </div>
                )}

                {isArxivError && (filter === 'all' || filter === 'arxiv') && (
                    <div className="rounded-xl border border-functional-yellow/20 bg-functional-yellow/5 px-4 py-3 text-center text-xs text-text-tertiary">
                        Could not load arXiv feed. Check your connection.
                    </div>
                )}

                {filteredItems.length === 0 && !isArxivLoading && (
                    <div className="rounded-xl border border-common-contrast/10 bg-common-cardBackground px-4 py-10 text-center text-sm text-text-tertiary">
                        Nothing here yet.
                    </div>
                )}

                {filteredItems.map((item) => (
                    <FeedCard key={`${item.type}-${item.id}`} item={item} />
                ))}
            </div>
        </div>
    );
}