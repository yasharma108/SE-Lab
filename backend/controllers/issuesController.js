const db = require('../config/db');

exports.getAllIssues = async (req, res) => {
    try {
        let query = `
            SELECT i.*, a.product_name, a.company_name, a.location, t.name as technician_name 
            FROM issues i 
            LEFT JOIN assets a ON i.asset_id = a.asset_id 
            LEFT JOIN technicians t ON i.assigned_technician = t.tech_id 
            ORDER BY i.created_at DESC
        `;
        const [issues] = await db.query(query);
        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getIssueById = async (req, res) => {
    try {
        const [issues] = await db.query('SELECT * FROM issues WHERE issue_id = ?', [req.params.id]);
        if (issues.length === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json(issues[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.createIssue = async (req, res) => {
    try {
        const { asset_id, issue_type, description, priority } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO issues (asset_id, issue_type, description, priority, status, reported_by) VALUES (?, ?, ?, ?, ?, ?)',
            [asset_id, issue_type, description, priority || 'medium', 'open', req.user ? req.user.id : null]
        );
        res.status(201).json({ message: 'Issue created successfully', issue_id: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.assignTechnician = async (req, res) => {
    try {
        const { tech_id } = req.body;
        const [result] = await db.query(
            'UPDATE issues SET assigned_technician = ?, status = ?, assigned_at = CURRENT_TIMESTAMP WHERE issue_id = ?',
            [tech_id, 'assigned', req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json({ message: 'Technician assigned successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const [result] = await db.query(
            'UPDATE issues SET status = ? WHERE issue_id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.closeIssue = async (req, res) => {
    try {
        const { resolution_notes } = req.body;
        const [result] = await db.query(
            'UPDATE issues SET status = ?, resolved_at = CURRENT_TIMESTAMP, resolution_notes = ? WHERE issue_id = ?',
            ['closed', resolution_notes || '', req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json({ message: 'Issue closed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
