import { useQuery } from '@tanstack/react-query';

export interface ArxivEntry {
    id: string;
    title: string;
    summary: string;
    authors: string[];
    published: string;
    arxivUrl: string;
    pdfUrl: string;
    categories: string[];
}

async function fetchArxivFeed(category: string, maxResults: number): Promise<ArxivEntry[]> {
    const res = await fetch(`/api/arxiv?category=${category}&maxResults=${maxResults}`);
    if (!res.ok) throw new Error('Failed to load arXiv feed');

    const data = await res.json();

    return (data.entries ?? []).map((e: ArxivEntry & { id: string }) => ({
        ...e,
        arxivUrl: `https://arxiv.org/abs/${e.id}`,
        pdfUrl: `https://arxiv.org/pdf/${e.id}`,
    }));
}

export function useArxivFeed(category = 'cs.AI', maxResults = 5) {
    return useQuery({
        queryKey: ['arxiv-feed', category, maxResults],
        queryFn: () => fetchArxivFeed(category, maxResults),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
}