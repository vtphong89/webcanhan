// api/get-timetable.js
// Serverless function để lấy thời khóa biểu từ Google Sheets
// URLs được giấu trong environment variables

// Ensure fetch is available (Node.js 18+ has it built-in)
const fetch = globalThis.fetch || require('node-fetch');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Lấy URL từ environment variable (bảo mật)
        const sheetUrl = process.env.TIMETABLE_SHEET_URL;

        if (!sheetUrl) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'TIMETABLE_SHEET_URL not configured'
            });
        }

        // Fetch data từ Google Sheets
        const response = await fetch(sheetUrl);

        if (!response.ok) {
            throw new Error(`Google Sheets returned ${response.status}`);
        }

        const csvData = await response.text();

        // Trả về CSV data
        res.status(200).send(csvData);
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({
            error: 'Failed to fetch timetable',
            message: error.message
        });
    }
};
