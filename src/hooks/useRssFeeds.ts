import { useQueries } from '@tanstack/react-query';

import { RssItem } from './useRssFeed';

async function fetchOne(url: string): Promise<RssItem[]> {
    const res = await fetch(`/api/rss?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const data = await res.json();
    return data.items ?? [];
}

export function useRssFeeds(urls: string[]) {
    return useQueries({
        queries: urls.map((url) => ({
            queryKey: ['rss-feed', url],
            queryFn: () => fetchOne(url),
            staleTime: 10 * 60 * 1000,
            retry: 1,
            enabled: !!url,
        })),
    });
}