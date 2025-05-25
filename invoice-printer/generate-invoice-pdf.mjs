import puppeteer from "puppeteer";
import fs from 'fs/promises';

export default async function generatePdfInvoice(url) {
    // Ensure data directory exists
    await fs.mkdir('data', { recursive: true });
    
    const browser = await puppeteer.launch({ headless: 'new'});
    const page = await browser.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.pdf({ 
            path: 'data/invoice.pdf', 
            printBackground: true, 
            format: 'A4' 
        });
    } finally {
        await browser.close();
    }
}