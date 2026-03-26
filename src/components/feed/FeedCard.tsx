'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    Bell, BookOpen, ChevronRight, ExternalLink, FileText, MessageCircle, Rss, Sparkles, Star, ThumbsUp, Users, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

dayjs.extend(relativeTime);

interface BaseFeedItem {
    id: string;
    timestamp: string;
}

export interface ArticleFeedItem extends BaseFeedItem {
    type: 'article';
    title: string;
    abstract: string;
    authors: string[];
    tags: string[];
    community: string;
    ratings: number;
    comments: number;
    discussions: number;
}

export interface DiscussionFeedItem extends BaseFeedItem {
    type: 'discussion';
    topic: string;
    content: string;
    username: string;
    avatarUrl?: string;
    commentsCount: number;
    articleTitle: string;
}

export interface PostFeedItem extends BaseFeedItem {
    type: 'post';
    title: string;
    content: string;
    username: string;
    avatarUrl?: string;
    likes: number;
    comments: number;
    imageUrl?: string;
}

export interface NotificationFeedItem extends BaseFeedItem {
    type: 'notification';
    message: string;
    notificationType: string;
    isRead: boolean;
    link: string;
}

export interface ArxivFeedItem extends BaseFeedItem {
    type: 'arxiv';
    title: string;
    summary: string;
    authors: string[];
    published: string;
    arxivUrl: string;
    pdfUrl: string;
    categories: string[];
}

export interface RssFeedItem extends BaseFeedItem {
    type: 'rss';
    title: string;
    summary: string;
    link: string;
    source: string;
}

export type FeedItem =
    | ArticleFeedItem
    | DiscussionFeedItem
    | PostFeedItem
    | NotificationFeedItem
    | ArxivFeedItem
    | RssFeedItem;

function CardShell({
    accentClass,
    children,
    className,
}: {
    accentClass: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border border-common-contrast/20 bg-common-cardBackground shadow-common transition-shadow duration-150 hover:shadow-md',
                className
            )}
        >
            <div className={cn('absolute bottom-0 left-0 top-0 w-1', accentClass)} />
            <div className="px-4 py-4 pl-5">{children}</div>
        </div>
    );
}

function TypeBadge({
    icon,
    label,
    className,
}: {
    icon: React.ReactNode;
    label: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                className
            )}
        >
            {icon}
            {label}
        </span>
    );
}

function TimeStamp({ iso }: { iso: string }) {
    return (
        <span className="shrink-0 text-[10px] text-text-tertiary">{dayjs(iso).fromNow()}</span>
    );
}

function ArticleCard({ item }: { item: ArticleFeedItem }) {
    return (
        <CardShell accentClass="bg-functional-green">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <TypeBadge
                        icon={<BookOpen className="h-3 w-3" />}
                        label="Article"
                        className="bg-functional-green/15 text-functional-green"
                    />
                    <TimeStamp iso={item.timestamp} />
                </div>

                <div>
                    <Link href={`/articles/${item.id}`}>
                        <h3 className="line-clamp-2 text-sm font-semibold text-text-primary hover:text-functional-green hover:underline">
                            {item.title}
                        </h3>
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{item.abstract}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
                    <span>{item.authors.slice(0, 2).join(', ')}{item.authors.length > 2 ? ' et al.' : ''}</span>
                    {item.community && (
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {item.community}
                        </span>
                    )}
                </div>

                {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-common-minimal px-2 py-0.5 text-[10px] text-text-tertiary"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 border-t border-common-minimal pt-2 text-[11px] text-text-tertiary">
                    <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-functional-yellow" />
                        {item.ratings} ratings
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {item.comments} comments
                    </span>
                    <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-functional-blue" />
                        {item.discussions} discussions
                    </span>
                </div>
            </div>
        </CardShell>
    );
}

function DiscussionCard({ item }: { item: DiscussionFeedItem }) {
    return (
        <CardShell accentClass="bg-functional-blue">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <TypeBadge
                        icon={<MessageCircle className="h-3 w-3" />}
                        label="Discussion"
                        className="bg-functional-blue/15 text-functional-blue"
                    />
                    <TimeStamp iso={item.timestamp} />
                </div>

                <div className="flex items-center gap-2">
                    <Image
                        src={item.avatarUrl ?? '/images/assets/user-icon.webp'}
                        alt={item.username}
                        width={26}
                        height={26}
                        className="aspect-square rounded-full object-cover"
                        unoptimized={!item.avatarUrl}
                    />
                    <span className="text-xs font-medium text-text-secondary">{item.username}</span>
                    <span className="text-[10px] text-text-tertiary">in</span>
                    <span className="line-clamp-1 flex-1 text-[11px] text-text-tertiary">
                        {item.articleTitle}
                    </span>
                </div>

                <div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-text-primary hover:text-functional-blue hover:underline cursor-pointer">
                        {item.topic}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{item.content}</p>
                </div>

                <div className="flex items-center gap-4 border-t border-common-minimal pt-2 text-[11px]">
                    <span className="flex items-center gap-1 text-text-tertiary">
                        <MessageCircle className="h-3 w-3" />
                        {item.commentsCount} replies
                    </span>
                    <button className="ml-auto flex items-center gap-1 text-functional-blue hover:underline">
                        Join discussion <ChevronRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </CardShell>
    );
}

function PostCard({ item }: { item: PostFeedItem }) {
    return (
        <CardShell accentClass="bg-violet-500">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <TypeBadge
                        icon={<FileText className="h-3 w-3" />}
                        label="Blog Post"
                        className="bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    />
                    <TimeStamp iso={item.timestamp} />
                </div>

                <div className="flex items-center gap-2">
                    <Image
                        src={item.avatarUrl ?? '/images/assets/user-icon.webp'}
                        alt={item.username}
                        width={26}
                        height={26}
                        className="aspect-square rounded-full object-cover"
                        unoptimized={!item.avatarUrl}
                    />
                    <span className="text-xs font-medium text-text-secondary">{item.username}</span>
                </div>

                <div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</h3>
                    <p className="mt-1 line-clamp-3 text-xs text-text-secondary">{item.content}</p>
                </div>

                {item.imageUrl && (
                    <div className="overflow-hidden rounded-lg">
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={600}
                            height={160}
                            className="h-36 w-full object-cover"
                            unoptimized
                        />
                    </div>
                )}

                <div className="flex items-center gap-4 border-t border-common-minimal pt-2 text-[11px] text-text-tertiary">
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {item.likes}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {item.comments} comments
                    </span>
                </div>
            </div>
        </CardShell>
    );
}

function NotificationCard({ item }: { item: NotificationFeedItem }) {
    return (
        <CardShell
            accentClass="bg-functional-yellow"
            className={cn(!item.isRead && 'border-functional-yellow/25')}
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-functional-yellow/15">
                    <Bell className="h-3.5 w-3.5 text-functional-yellow" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-functional-yellow">
                                {item.notificationType}
                            </span>
                            <p className="mt-0.5 text-xs text-text-primary">{item.message}</p>
                        </div>
                        <TimeStamp iso={item.timestamp} />
                    </div>
                    {!item.isRead && (
                        <div className="mt-1.5 flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-functional-yellow" />
                            <span className="text-[10px] text-text-tertiary">Unread</span>
                        </div>
                    )}
                </div>
            </div>
        </CardShell>
    );
}

function ArxivCard({ item }: { item: ArxivFeedItem }) {
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSummarize = async () => {
        if (aiSummary || isLoading) return;
        setIsLoading(true);

        // PROTOTYPE: simulates the AI call with a 1.5s delay. In production: this will POST to /api/summarize -> Django backend -> HuggingFace Inference API or any open weight model (Mistral/LLaMA) running on the server.
        await new Promise((r) => setTimeout(r, 1500));

        // so for simulation taking just first 2 sentences of the abstract as the "summary"
        const sentences = item.summary.match(/[^.!?]+[.!?]+/g) ?? [];
        const brief = sentences.slice(0, 2).join(' ').trim();
        setAiSummary(brief || item.summary.slice(0, 220) + '…');
        setIsLoading(false);
    };

    const authorDisplay =
        item.authors.length > 3
            ? `${item.authors.slice(0, 3).join(', ')} +${item.authors.length - 3} more`
            : item.authors.join(', ');

    return (
        <CardShell accentClass="bg-teal-500">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TypeBadge
                            icon={<ExternalLink className="h-3 w-3" />}
                            label="arXiv Live"
                            className="bg-teal-500/15 text-teal-600 dark:text-teal-400"
                        />
                        {item.categories[0] && (
                            <span className="rounded-full bg-common-minimal px-2 py-0.5 font-mono text-[10px] text-text-tertiary">
                                {item.categories[0]}
                            </span>
                        )}
                    </div>
                    <TimeStamp iso={item.published} />
                </div>

                <a
                    href={item.arxivUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 text-sm font-semibold text-text-primary hover:text-teal-600 hover:underline dark:hover:text-teal-400"
                >
                    {item.title}
                </a>

                <p className="text-[11px] text-text-tertiary">{authorDisplay}</p>
                <p className="line-clamp-3 text-xs text-text-secondary">{item.summary}</p>

                {aiSummary ? (
                    <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                        <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                            <Sparkles className="h-3 w-3" />
                            AI Summary
                        </div>
                        <p className="text-xs leading-relaxed text-text-secondary">{aiSummary}</p>
                    </div>
                ) : (
                    <button
                        onClick={handleSummarize}
                        disabled={isLoading}
                        className="flex w-fit items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-500/20 disabled:opacity-60 dark:text-teal-400"
                    >
                        <Sparkles className="h-3 w-3" />
                        {isLoading ? 'Summarising…' : 'Get AI Summary'}
                    </button>
                )}

                <div className="flex items-center gap-4 border-t border-common-minimal pt-2 text-[11px]">
                    <a
                        href={item.arxivUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-teal-600 hover:underline dark:text-teal-400"
                    >
                        <ExternalLink className="h-3 w-3" />
                        arXiv page
                    </a>
                    <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-tertiary hover:text-text-primary hover:underline"
                    >
                        PDF ↗
                    </a>
                </div >
            </div >
        </CardShell >
    );
}

function RssCard({ item }: { item: RssFeedItem }) {
    return (
        <CardShell accentClass="bg-orange-500">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TypeBadge
                            icon={<Rss className="h-3 w-3" />}
                            label="Journal Alert"
                            className="bg-orange-500/15 text-orange-600 dark:text-orange-400"
                        />
                        <span className="line-clamp-1 max-w-[120px] text-[10px] text-text-tertiary">
                            {item.source}
                        </span>
                    </div>
                    <TimeStamp iso={item.timestamp} />
                </div>

                <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 text-sm font-semibold text-text-primary hover:text-orange-600 hover:underline dark:hover:text-orange-400"
                >
                    {item.title}
                </a>

                {item.summary && (
                    <p className="line-clamp-2 text-xs text-text-secondary">{item.summary}</p>
                )}

                <div className="flex items-center border-t border-common-minimal pt-2">
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-orange-600 hover:underline dark:text-orange-400"
                    >
                        <ExternalLink className="h-3 w-3" />
                        Read article
                    </a>
                </div>
            </div>
        </CardShell>
    );
}

export function FeedCard({ item }: { item: FeedItem }) {
    switch (item.type) {
        case 'article': return <ArticleCard item={item} />;
        case 'discussion': return <DiscussionCard item={item} />;
        case 'post': return <PostCard item={item} />;
        case 'notification': return <NotificationCard item={item} />;
        case 'arxiv': return <ArxivCard item={item} />;
        case 'rss': return <RssCard item={item} />;
    }
}