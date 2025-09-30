const form = document.getElementById('chat-form') as HTMLFormElement;
const input = document.getElementById('chat-input') as HTMLInputElement;

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = input.value.trim();
    if (!content) return;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openrouter/sonoma-dusk-alpha',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant named Bolt AI.' },
                    { role: 'user', content },
                ],
                title: 'Bolt AI',
                referer: location.origin,
            }),
        });

        const data = await res.json();
        // TODO: render the response in UI instead of alert sigh ts sucks
        alert(data.choices?.[0]?.message?.content ?? JSON.stringify(data));
    } catch (err) {
        console.error(err);
        alert('Request failed. See console.');
    }
});