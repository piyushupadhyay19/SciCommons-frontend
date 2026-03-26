import { useQuery } from '@tanstack/react-query';

export interface RssItem {
    id: string;
    title: string;
    summary: string;
    link: string;
    published: string;
    source: string;
}

async function fetchRssFeed(url: string): Promise<RssItem[]> {
    const res = await fetch(`/api/rss?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to load RSS feed');
    }
    const data = await res.json();
    return data.items ?? [];
}

export function useRssFeed(url: string | null) {
    return useQuery({
        queryKey: ['rss-feed', url],
        queryFn: () => fetchRssFeed(url!),
        enabled: !!url,
        staleTime: 10 * 60 * 1000,
        retry: 1,
    });
}