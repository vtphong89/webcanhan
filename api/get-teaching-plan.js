// api/get-teaching-plan.js
// Serverless function để lấy lịch báo giảng
// URLs được giấu trong environment variables

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
        // Lấy class từ query parameter (lop11 hoặc lop12)
        const classId = req.query.class;

        if (!classId) {
            return res.status(400).json({
                error: 'Missing parameter',
                message: 'class parameter is required (lop11 or lop12)'
            });
        }

        // Map class ID to environment variable
        let sheetUrl;
        if (classId === 'lop11') {
            sheetUrl = process.env.TEACHING_PLAN_11_URL;
        } else if (classId === 'lop12') {
            sheetUrl = process.env.TEACHING_PLAN_12_URL;
        } else {
            return res.status(400).json({
                error: 'Invalid class',
                message: 'class must be lop11 or lop12'
            });
        }

        if (!sheetUrl) {
            return res.status(500).json({
                error: 'Configuration error',
                message: `URL for ${classId} not configured`
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
        console.error('Error fetching teaching plan:', error);
        res.status(500).json({
            error: 'Failed to fetch teaching plan',
            message: error.message
        });
    }
};
