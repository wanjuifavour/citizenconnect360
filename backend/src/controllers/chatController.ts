import { Request, Response } from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
import { truncateContent, chunkContent } from '../utils/textProcessing';
import { executeStoredProcedure } from '../config/sqlServer';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Maximum tokens to send to OpenAI (leaving room for the response)
const MAX_TOKENS = 8000;

export const chatWithBill = async (req: Request, res: Response) => {
    try {
        const { bill, query } = req.body;

        if (!bill || !query) {
            return res.status(400).json({ error: 'Bill name and query are required' });
        }

        // Check cache first
        try {
            const cacheResult = await executeStoredProcedure('GetCachedResponse', {
                billName: bill,
                query: query
            });

            if (cacheResult.recordset.length > 0) {
                return res.json({
                    response: cacheResult.recordset[0].response,
                    fromCache: true
                });
            }
        } catch (error) {
            console.error('Error checking cache:', error);
            // Continue with normal processing if cache check fails
        }

        // Get bill content from our own API
        const billContentResponse = await axios.get(
            `http://localhost:${process.env.PORT}/api/bills/${encodeURIComponent(bill)}`
        );

        const billContent = billContentResponse.data.content;

        if (!billContent) {
            return res.status(404).json({ error: 'Bill content not found' });
        }

        // First, try with truncated content
        try {
            const truncatedContent = truncateContent(billContent, MAX_TOKENS);

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", // Using 3.5 as it has better token efficiency
                messages: [
                    {
                        role: "system",
                        content: `You are an expert on government bills and legislation. Answer questions about the following bill: ${bill}. 
                        Keep your answers concise, informative, and based on the bill content. The bill content may be truncated.`
                    },
                    {
                        role: "user",
                        content: `Bill content: ${truncatedContent}\n\nQuestion: ${query}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500,
            });

            const response = completion.choices[0].message.content || '';

            // Save to cache
            try {
                await executeStoredProcedure('SaveResponseToCache', {
                    billName: bill,
                    query: query,
                    response: response
                });
            } catch (cacheError) {
                console.error('Error saving to cache:', cacheError);
                // Continue without caching if it fails
            }

            return res.json({
                response: response,
                fromCache: false
            });
        } catch (error: any) {
            // If we get a token limit error, use the chunking approach
            if (error.code === 'rate_limit_exceeded' && error.type === 'tokens') {
                return await chatWithLargeBill(req, res);
            }
            throw error;
        }
    } catch (error: any) {
        console.error('OpenAI API error:', error);

        // Return a more helpful error message for token limit issues
        if (error.code === 'rate_limit_exceeded' && error.type === 'tokens') {
            return res.status(429).json({
                error: 'The bill is too large to process at once. Try asking about specific sections or a more focused question.'
            });
        }

        return res.status(500).json({ error: 'Failed to process chat request' });
    }
};

export const chatWithLargeBill = async (req: Request, res: Response) => {
    try {
        const { bill, query } = req.body;

        // Check cache first for this advanced query too
        try {
            const cacheResult = await executeStoredProcedure('GetCachedResponse', {
                billName: bill,
                query: `(chunked)${query}`
            });

            if (cacheResult.recordset.length > 0) {
                return res.json({
                    response: cacheResult.recordset[0].response,
                    fromCache: true
                });
            }
        } catch (error) {
            console.error('Error checking cache for chunked query:', error);
            // Continue with normal processing if cache check fails
        }

        // Get bill content
        const billContentResponse = await axios.get(
            `http://localhost:${process.env.PORT}/api/bills/${encodeURIComponent(bill)}`
        );

        const billContent = billContentResponse.data.content;

        // Split into manageable chunks
        const chunks = chunkContent(billContent);

        // First, analyze the question to identify key search terms
        const queryAnalysisCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Analyze this question about a bill and identify key search terms and concepts to look for."
                },
                { role: "user", content: query }
            ],
            temperature: 0.3,
            max_tokens: 100
        });

        const searchTerms = queryAnalysisCompletion.choices[0].message.content;

        // Process each chunk to find relevant information
        const relevantParts = [];

        for (const chunk of chunks) {
            // Check if this chunk might contain relevant info
            const relevanceCheck = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Determine if this text chunk likely contains information relevant to: ${searchTerms}. Reply only with "Yes" or "No".`
                    },
                    { role: "user", content: chunk }
                ],
                temperature: 0.1,
                max_tokens: 5
            });

            const isRelevant = relevanceCheck.choices[0].message.content?.toLowerCase().includes("yes");

            if (isRelevant) {
                relevantParts.push(chunk);
            }
        }

        // Now combine the relevant parts (up to our token limit) and generate a response
        const combinedContent = truncateContent(relevantParts.join("\n\n---\n\n"), MAX_TOKENS);

        const finalCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an expert on the bill: ${bill}. Answer the user's question based on the relevant sections provided.`
                },
                { role: "user", content: `Relevant sections from the bill:\n\n${combinedContent}\n\nQuestion: ${query}` }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const response = finalCompletion.choices[0].message.content || '';

        // Save to cache with a special marker to indicate it's a chunked response
        try {
            await executeStoredProcedure('SaveResponseToCache', {
                billName: bill,
                query: `(chunked)${query}`, // Mark chunked queries to differentiate
                response: response
            });
        } catch (cacheError) {
            console.error('Error saving chunked response to cache:', cacheError);
            // Continue without caching if it fails
        }

        return res.json({
            response: response,
            fromCache: false
        });

    } catch (error) {
        console.error('Error processing chat with large bill:', error);
        return res.status(500).json({ error: 'Failed to process chat request' });
    }
};