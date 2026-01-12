// api/get-targets.js
// Serverless function để lấy chỉ tiêu trong năm
// URL được giấu trong environment variables

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Lấy URL từ environment variable
        const sheetUrl = process.env.TARGETS_SHEET_URL;

        if (!sheetUrl) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'TARGETS_SHEET_URL not configured'
            });
        }

        // Fetch data từ Google Sheets
        const response = await fetch(sheetUrl);

        if (!response.ok) {
            throw new Error(`Google Sheets returned ${response.status}`);
        }

        const htmlData = await response.text();

        // Trả về HTML data
        res.status(200).send(htmlData);
    } catch (error) {
        console.error('Error fetching targets:', error);
        res.status(500).json({
            error: 'Failed to fetch targets',
            message: error.message
        });
    }
};
