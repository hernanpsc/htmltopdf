import express from 'express';
import generatePdfInvoice from './invoice-printer/generate-invoice-pdf.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Add middleware to parse POST data
app.use(express.urlencoded({ extended: true }));

// Serve the form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'invoice-printer', 'invoice.html'));
});

// Handle PDF generation
app.post('/generate-pdf', async (req, res) => {
    try {
        const { url } = req.body;
        await generatePdfInvoice(url);
        res.attachment('webpage.pdf');
        res.sendFile(path.resolve('./data/invoice.pdf'));
    } catch (error) {
        res.status(500).send('Error generating PDF: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});