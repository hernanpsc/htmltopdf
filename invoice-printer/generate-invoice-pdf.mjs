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
            '--disable-geolocation',
            '--disable-infobars',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials'
        ],
        ignoreHTTPSErrors: true
    });
    
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
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
            'cookie-consent',
            'usercentrics.eu',
            'privacy-mgmt.com',
            'cookielaw.org',
            'gdpr-legal-cookie.myshopify.com',
            'cc.cdn.civiccomputing.com',
            'cookie-cdn.cookiepro.com',
            'cookiehub.net',
            'cookienotice.js'
        ];
        
        if (blockedDomains.some(domain => request.url().includes(domain))) {
            request.abort();
        } else {
            request.continue();
        }
    });

    try {
        // Set common cookie consent choices
        const client = await page.target().createCDPSession();
        await client.send('Network.setCookies', {
            cookies: [{
                name: 'CookieConsent',
                value: 'true',
                domain: '.example.com',
                path: '/'
            }]
        });

        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });

        // Wait for any remaining dynamic content
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Remove cookie banners and other popups
        await page.evaluate(() => {
            const selectors = [
                '#cookie-banner',
                '.cookie-banner',
                '#cookie-consent',
                '.cookie-consent',
                '[class*="cookie-banner"]',
                '[id*="cookie-banner"]',
                '[class*="cookie-consent"]',
                '[id*="cookie-consent"]',
                '[class*="gdpr"]',
                '[id*="gdpr"]',
                '.modal',
                '#modal',
                '.popup',
                '#popup',
                '[class*="popup"]',
                '[id*="popup"]'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });

            // Remove fixed position elements that might be overlays
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' || style.position === 'sticky') {
                    el.remove();
                }
            });
        });

        await page.pdf({ 
            path: 'data/invoice.pdf', 
            printBackground: true, 
            format: 'A4',
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
    } finally {
        await browser.close();
    }
}