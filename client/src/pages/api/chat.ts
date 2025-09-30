import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    const key = import.meta.env.OPENROUTER_API_KEY;
    if (!key) {
        return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is missing on the server' }), { status: 500 });
    }

    let raw = '';
    let payload: any;
    try {
        raw = await request.text();
        if (!raw) {
            return new Response(JSON.stringify({ error: 'Missing JSON body' }), { status: 400 });
        }
        payload = JSON.parse(raw);
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid JSON', details: String(err) }), { status: 400 });
    }

    if (!payload.model || !Array.isArray(payload.messages)) {
        return new Response(JSON.stringify({ error: 'Payload must include "model" and "messages"[]' }), { status: 400 });
    }

    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': payload.referer ?? request.headers.get('referer') ?? new URL(request.url).origin,
                'X-Title': payload.title ?? 'Bolt AI',
            },
            body: JSON.stringify(payload),
        });

        const text = await res.text();
        return new Response(text, {
            status: res.status,
            headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Upstream request failed', details: String(err) }), { status: 502 });
    }
};