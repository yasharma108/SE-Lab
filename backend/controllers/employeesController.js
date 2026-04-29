const db = require('../config/db');

exports.getEmployees = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, u.name, u.email, u.role, u.created_at,
                t.status, t.phone,
                COUNT(i.issue_id) as total_assigned,
                SUM(CASE WHEN i.status = 'closed' OR i.status = 'resolved' THEN 1 ELSE 0 END) as total_resolved,
                AVG(TIMESTAMPDIFF(HOUR, i.assigned_at, i.resolved_at)) as avg_resolution_hours
            FROM users u
            LEFT JOIN technicians t ON u.email = t.email
            LEFT JOIN issues i ON t.tech_id = i.assigned_technician
            WHERE u.role IN ('manager', 'technician')
            GROUP BY u.id
            ORDER BY u.role, u.name
        `;
        const [employees] = await db.query(query);
        res.json(employees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
