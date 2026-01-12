// api/get-wheel-students.js
// Serverless function để lấy danh sách học sinh cho vòng quay
// URLs được giấu trong environment variables

// Ensure fetch is available
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
        // Lấy class từ query parameter
        const classId = req.query.class;

        if (!classId) {
            return res.status(400).json({
                error: 'Missing parameter',
                message: 'class parameter is required'
            });
        }

        // Map class ID to environment variable
        let sheetUrl;
        if (classId === '11B1') {
            sheetUrl = process.env.WHEEL_11B1_URL;
        } else if (classId === '12C1') {
            sheetUrl = process.env.WHEEL_12C1_URL;
        } else {
            return res.status(400).json({
                error: 'Invalid class',
                message: `Class ${classId} not supported`
            });
        }

        if (!sheetUrl) {
            return res.status(500).json({
                error: 'Configuration error',
                message: `URL for class ${classId} not configured`
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
        console.error('Error fetching wheel students:', error);
        res.status(500).json({
            error: 'Failed to fetch student list',
            message: error.message
        });
    }
};
