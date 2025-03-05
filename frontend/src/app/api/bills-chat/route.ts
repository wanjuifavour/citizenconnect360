import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
    try {
        const { bill, query } = await request.json();

        // This would be replaced with actual bill content retrieval
        const billContent = await fetchBillContent(bill);

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an expert on government bills and legislation. Answer questions based on the following bill: ${bill}. 
                    Bill content: ${billContent}`
                },
                { role: "user", content: query }
            ],
            max_tokens: 500,
        });

        return NextResponse.json({
            response: completion.choices[0].message.content
        });
    } catch (error) {
        console.error('OpenAI API error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

// Function to fetch bill content - would connect to backend
async function fetchBillContent(billName: string) {
    // This would be replaced with actual API call to backend
    return `This is placeholder content for ${billName}. In production, this would contain the actual bill text retrieved from the backend.`;
}