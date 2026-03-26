import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') ?? 'cs.AI';
    const maxResults = Math.min(Number(searchParams.get('maxResults') ?? '5'), 20);

    const arxivUrl = `https://export.arxiv.org/api/query?search_query=cat:${category}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

    try {
        const response = await fetch(arxivUrl, {
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'arXiv upstream failed' }, { status: 502 });
        }

        const xml = await response.text();

        const entries = parseArxivXml(xml);

        return NextResponse.json({ entries }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch from arXiv' }, { status: 500 });
    }
}

function parseArxivXml(xml: string) {
    const entries: {
        id: string;
        title: string;
        summary: string;
        authors: string[];
        published: string;
        categories: string[];
    }[] = [];

    const entryBlocks = xml.split('<entry>').slice(1);

    for (const block of entryBlocks) {
        const get = (tag: string) => {
            const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
            return match ? match[1].trim() : '';
        };

        const rawId = get('id');
        const arxivId = rawId.split('/abs/').pop() ?? rawId;

        const authorMatches = [...block.matchAll(/<name>([\s\S]*?)<\/name>/g)];
        const authors = authorMatches.map((m) => m[1].trim());

        const categoryMatches = [...block.matchAll(/<category[^>]*term="([^"]+)"/g)];
        const categories = categoryMatches.map((m) => m[1]);

        entries.push({
            id: arxivId,
            title: get('title').replace(/\s+/g, ' '),
            summary: get('summary').replace(/\s+/g, ' '),
            authors,
            published: get('published'),
            categories,
        });
    }

    return entries;
}