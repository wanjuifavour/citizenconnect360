export function truncateContent(content: string, maxTokens: number): string {
    // Rough approximation: 1 token ≈ 4 characters for English text
    const charLimit = maxTokens * 4;

    if (content.length <= charLimit) {
        return content;
    }

    return content.substring(0, charLimit) +
        "\n\n[Note: Content has been truncated due to length limitations.]";
}

export function chunkContent(content: string, chunkSize: number = 4000): string[] {
    const chunks = [];
    let currentChunk = "";

    // Split by paragraphs
    const paragraphs = content.split(/\n\s*\n/);

    for (const paragraph of paragraphs) {
        // If adding this paragraph exceeds chunk size, store current chunk and start a new one
        if ((currentChunk.length + paragraph.length) > chunkSize * 4) { // rough char estimate
            chunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        }
    }

    // Add the last chunk if it has content
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

export function estimateTokenCount(text: string): number {
    // Simple estimation: ~4 chars per token for English
    return Math.ceil(text.length / 4);
}

export function normalizeQuery(query: string): string {
    // Convert to lowercase, trim spaces, and remove punctuation
    return query.toLowerCase()
        .trim()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");
}