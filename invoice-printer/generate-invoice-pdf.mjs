import puppeteer from "puppeteer";
import fs from 'fs/promises';

export default async function generatePdfInvoice(url) {
    // Ensure data directory exists
    await fs.mkdir('data', { recursive: true });
    
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-notifications',
            '--disable-geolocation'
        ]
    });
    
    const page = await browser.newPage();
    
    // Block cookie consent popups and trackers
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const blockedDomains = [
            'cookiebot.com',
            'cookie-script.com',
            'cookie-law-enforcement-qq.xyz',
            'cookielaw.org',
            'onetrust.com',
            'consensu.org',
            'cookie-consent'
        ];
        
        if (blockedDomains.some(domain => request.url().includes(domain))) {
            request.abort();
        } else {
            request.continue();
        }
    });

    try {
        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });

        // Additional attempt to remove cookie banners via DOM
        await page.evaluate(() => {
            const selectors = [
                '#cookie-banner',
                '.cookie-banner',
                '#cookie-consent',
                '.cookie-consent',
                '[class*="cookie-banner"]',
                '[id*="cookie-banner"]',
                '[class*="cookie-consent"]',
                '[id*="cookie-consent"]'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });
        });

        await page.pdf({ 
            path: 'data/invoice.pdf', 
            printBackground: true, 
            format: 'A4' 
        });
    } finally {
        await browser.close();
    }
}