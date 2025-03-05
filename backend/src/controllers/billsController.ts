import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const BILLS_DIRECTORY = path.join(__dirname, '../../uploads/bills');

const billFilenameMap: Record<string, string> = {
    "ICT Practitioners bill": "ICT_Bill_2024.pdf",
    "Finance Bill": "TheFinanceBill_2024.pdf",
    "Test File": "citizenConnect.pdf",
};

export const getBillContent = async (req: Request, res: Response) => {
    try {
        const { billName } = req.params;

        if (!billName || !billFilenameMap[billName]) {
            return res.status(400).json({ error: 'Invalid bill name' });
        }

        const filename = billFilenameMap[billName];
        const filePath = path.join(BILLS_DIRECTORY, filename);

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(404).json({ error: 'Bill file not found' });
        }

        // Use PDFLoader to extract text
        const loader = new PDFLoader(filePath, {
            splitPages: true,
        });

        const docs = await loader.load();

        // Join all pages but limit the total content
        const content = docs.map(doc => doc.pageContent).join('\n\n');

        return res.json({ content });
    } catch (error) {
        console.error('Error retrieving bill content:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Get list of available bills
export const getBillsList = async (_req: Request, res: Response) => {
    try {
        const bills = Object.keys(billFilenameMap).map((name, index) => ({
            id: index + 1,
            name,
            filename: billFilenameMap[name]
        }));

        return res.json({ bills });
    } catch (error) {
        console.error('Error retrieving bills list:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};