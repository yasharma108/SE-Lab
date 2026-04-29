const db = require('../config/db');

exports.getSummary = async (req, res) => {
    try {
        const [totalAssets] = await db.query('SELECT COUNT(*) as count FROM assets');
        const [totalIssues] = await db.query('SELECT COUNT(*) as count FROM issues');
        const [activeIssues] = await db.query('SELECT COUNT(*) as count FROM issues WHERE status != "closed" AND status != "resolved"');
        const [resolvedIssues] = await db.query('SELECT COUNT(*) as count FROM issues WHERE status IN ("closed","resolved")');

        // Technician stats
        const [totalTechs] = await db.query('SELECT COUNT(*) as count FROM technicians');
        const [availableTechs] = await db.query('SELECT COUNT(*) as count FROM technicians WHERE status = "available"');
        const [assignedTechs] = await db.query('SELECT COUNT(*) as count FROM technicians WHERE status = "busy"');

        // Fault distribution based on issue_type
        const [faultDistribution] = await db.query('SELECT issue_type, COUNT(*) as count FROM issues GROUP BY issue_type');
        
        // Recent alerts (all critical/high priority open issues)
        const [recentAlerts] = await db.query('SELECT i.*, a.product_name, a.location FROM issues i LEFT JOIN assets a ON i.asset_id = a.asset_id WHERE i.status NOT IN ("closed","resolved") ORDER BY i.created_at DESC LIMIT 8');

        // Performance by Technician
        const [techPerformance] = await db.query(`
            SELECT t.name as name, COUNT(i.issue_id) as value
            FROM issues i
            JOIN technicians t ON i.assigned_technician = t.tech_id
            WHERE i.status IN ('resolved', 'closed')
            GROUP BY t.tech_id
        `);

        // Live Refrigerator Monitor
        const [liveSensorData] = await db.query(`
            SELECT 
                a.asset_id, a.product_name, a.company_name, a.location, 
                a.min_temp_celsius, a.max_temp_celsius,
                sl.temperature, sl.power_status, sl.timestamp as last_update
            FROM assets a
            LEFT JOIN (
                SELECT asset_id, temperature, power_status, timestamp
                FROM sensor_logs sl1
                WHERE timestamp = (SELECT MAX(timestamp) FROM sensor_logs sl2 WHERE sl1.asset_id = sl2.asset_id)
            ) sl ON a.asset_id = sl.asset_id
            ORDER BY a.created_at DESC
        `);

        // Asset holders — distinct company + location with counts
        const [assetHolders] = await db.query(`
            SELECT 
                a.company_name, a.location,
                COUNT(DISTINCT a.asset_id) as asset_count,
                COUNT(DISTINCT CASE WHEN i.status NOT IN ('closed','resolved') THEN i.issue_id END) as open_issues
            FROM assets a
            LEFT JOIN issues i ON a.asset_id = i.asset_id
            GROUP BY a.company_name, a.location
            ORDER BY a.company_name, a.location
        `);

        res.json({
            totalAssets: totalAssets[0].count,
            totalIssues: totalIssues[0].count,
            activeIssues: activeIssues[0].count,
            resolvedIssues: resolvedIssues[0].count,
            totalTechs: totalTechs[0].count,
            availableTechs: availableTechs[0].count,
            assignedTechs: assignedTechs[0].count,
            faultDistribution,
            recentAlerts,
            techPerformance,
            liveSensorData,
            assetHolders,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getTechnicianSummary = async (req, res) => {
    try {
        // Find the technician record linked to this user
        const userId = req.user.id;
        const [techRows] = await db.query(
            'SELECT t.* FROM technicians t JOIN users u ON t.name = u.name WHERE u.id = ?', [userId]
        );
        if (techRows.length === 0) {
            return res.json({ techId: null, myIssues: [], resolved: 0, active: 0 });
        }
        const tech = techRows[0];

        const [myIssues] = await db.query(`
            SELECT i.*, a.product_name, a.company_name, a.location, a.min_temp_celsius, a.max_temp_celsius
            FROM issues i
            LEFT JOIN assets a ON i.asset_id = a.asset_id
            WHERE i.assigned_technician = ?
            ORDER BY 
                CASE i.status WHEN 'assigned' THEN 0 WHEN 'reached_spot' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'needs_help' THEN 3 ELSE 4 END,
                i.created_at DESC
        `, [tech.tech_id]);

        const active = myIssues.filter(i => !['closed', 'resolved'].includes(i.status)).length;
        const resolved = myIssues.filter(i => ['closed', 'resolved'].includes(i.status)).length;

        res.json({ techId: tech.tech_id, techName: tech.name, myIssues, active, resolved });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
