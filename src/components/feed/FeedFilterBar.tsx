'use client';

import { cn } from '@/lib/utils';

export type FeedFilter = 'all' | 'articles' | 'discussions' | 'posts' | 'arxiv' | 'notifications' | 'rss';

interface FilterConfig {
    key: FeedFilter;
    label: string;
    dot: string;
    activeBg: string;
}

const FILTERS: FilterConfig[] = [
    {
        key: 'all',
        label: 'All',
        dot: 'bg-text-tertiary',
        activeBg: 'bg-common-contrast/15',
    },
    {
        key: 'articles',
        label: 'Articles',
        dot: 'bg-functional-green',
        activeBg: 'bg-functional-green/15',
    },
    {
        key: 'discussions',
        label: 'Discussions',
        dot: 'bg-functional-blue',
        activeBg: 'bg-functional-blue/15',
    },
    {
        key: 'posts',
        label: 'Blogs',
        dot: 'bg-violet-500',
        activeBg: 'bg-violet-500/15',
    },
    {
        key: 'arxiv',
        label: 'arXiv Live',
        dot: 'bg-teal-500',
        activeBg: 'bg-teal-500/15',
    },
    {
        key: 'notifications',
        label: 'Notifications',
        dot: 'bg-functional-yellow',
        activeBg: 'bg-functional-yellow/15',
    },
    {
        key: 'rss' as FeedFilter,
        label: 'Journal Alerts',
        dot: 'bg-orange-500',
        activeBg: 'bg-orange-500/15',
    },
];

interface FeedFilterBarProps {
    active: FeedFilter;
    onChange: (filter: FeedFilter) => void;
    counts?: Partial<Record<FeedFilter, number>>;
}

export function FeedFilterBar({ active, onChange, counts }: FeedFilterBarProps) {
    return (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => {
                const isActive = active === f.key;
                const count = counts?.[f.key];
                return (
                    <button
                        key={f.key}
                        onClick={() => onChange(f.key)}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                            isActive
                                ? `${f.activeBg} border-transparent text-text-primary`
                                : 'border-common-contrast/20 bg-common-cardBackground text-text-secondary hover:border-common-contrast/40 hover:text-text-primary'
                        )}
                    >
                        <span className={cn('h-1.5 w-1.5 rounded-full', f.dot)} />
                        {f.label}
                        {count !== undefined && (
                            <span className="ml-0.5 rounded-full bg-common-background/60 px-1.5 py-0.5 text-[10px] font-semibold">
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}