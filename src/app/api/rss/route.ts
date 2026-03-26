import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const feedUrl = searchParams.get('url');

    if (!feedUrl) {
        return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(feedUrl);
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
    }

    try {
        const response = await fetch(feedUrl, {
            headers: {
                'User-Agent': 'SciCommons-Feed-Reader/1.0',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            },
            next: { revalidate: 600 },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Feed server returned ${response.status}` },
                { status: 502 }
            );
        }

        const xml = await response.text();
        const items = parseRss(xml);

        return NextResponse.json({ items }, {
            headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' },
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch RSS feed' }, { status: 500 });
    }
}

interface RssItem {
    id: string;
    title: string;
    summary: string;
    link: string;
    published: string;
    source: string;
}

function parseRss(xml: string): RssItem[] {
    const items: RssItem[] = [];

    const isAtom = xml.includes('<feed') && xml.includes('<entry');
    const feedTitleMatch = xml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const feedTitle = feedTitleMatch ? feedTitleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() : 'RSS Feed';

    if (isAtom) {
        const entryBlocks = xml.split('<entry>').slice(1);
        for (const block of entryBlocks) {
            const get = (tag: string) => {
                const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
                if (!m) return '';
                return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim();
            };
            const linkMatch = block.match(/<link[^>]+href="([^"]+)"/);
            const link = linkMatch?.[1] ?? '';
            const rawId = get('id') || link;

            items.push({
                id: rawId || Math.random().toString(36).slice(2),
                title: get('title').replace(/\s+/g, ' ') || 'Untitled',
                summary: get('summary').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 400),
                link,
                published: get('published') || get('updated') || new Date().toISOString(),
                source: feedTitle,
            });
        }
    } else {
        const itemBlocks = xml.split('<item>').slice(1);
        for (const block of itemBlocks) {
            const get = (tag: string) => {
                const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
                if (!m) return '';
                return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').replace(/<[^>]+>/g, '').trim();
            };
            const link = get('link') || get('guid');

            items.push({
                id: get('guid') || link || Math.random().toString(36).slice(2),
                title: get('title').replace(/\s+/g, ' ') || 'Untitled',
                summary: get('description').replace(/\s+/g, ' ').slice(0, 400),
                link,
                published: get('pubDate') || new Date().toISOString(),
                source: feedTitle,
            });
        }
    }

    return items.slice(0, 20);
}