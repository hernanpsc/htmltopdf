import puppeteer from "puppeteer";
import generateHtmlInvoice from "./invoice-generator.mjs";
import fs from 'fs/promises';
import path from 'path';

export default async function generatePdfInvoice() {
    // Ensure data directory exists
    await fs.mkdir('data', { recursive: true });
    
    const browser = await puppeteer.launch({ headless: 'new'})
    const page = await browser.newPage();
    const htmlInvoice = await generateHtmlInvoice();
    await page.setContent(htmlInvoice);
    await page.evaluateHandle('document.fonts.ready');
    await page.pdf({ path: 'data/invoice.pdf', printBackground: true, format: 'A4' });
    await browser.close();
}