const db = require('../config/db');

// Helper: find tech_id for the currently logged-in user
const getTechId = async (userId) => {
    const [rows] = await db.query(
        'SELECT t.tech_id FROM technicians t JOIN users u ON t.name = u.name WHERE u.id = ?',
        [userId]
    );
    return rows.length > 0 ? rows[0].tech_id : null;
};

// GET /notes/history  — all closed/resolved issues for this technician
exports.getHistory = async (req, res) => {
    try {
        const techId = await getTechId(req.user.id);
        if (!techId) return res.json([]);

        const [issues] = await db.query(`
            SELECT i.issue_id, i.issue_type, i.description, i.priority,
                   i.status, i.created_at, i.assigned_at, i.resolved_at,
                   i.resolution_notes,
                   a.product_name, a.company_name, a.location, a.asset_id
            FROM issues i
            LEFT JOIN assets a ON i.asset_id = a.asset_id
            WHERE i.assigned_technician = ?
              AND i.status IN ('resolved', 'closed')
            ORDER BY i.resolved_at DESC
        `, [techId]);

        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// GET /notes — all personal notes for this technician
exports.getNotes = async (req, res) => {
    try {
        const techId = await getTechId(req.user.id);
        if (!techId) return res.json([]);

        const [notes] = await db.query(`
            SELECT n.*, i.issue_type, a.product_name, a.location
            FROM technician_notes n
            LEFT JOIN issues i ON n.issue_id = i.issue_id
            LEFT JOIN assets a ON i.asset_id = a.asset_id
            WHERE n.tech_id = ?
            ORDER BY n.updated_at DESC
        `, [techId]);

        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// POST /notes — create a new note
exports.createNote = async (req, res) => {
    try {
        const techId = await getTechId(req.user.id);
        if (!techId) return res.status(403).json({ message: 'Technician not found' });

        const { title, content, issue_id } = req.body;
        const [result] = await db.query(
            'INSERT INTO technician_notes (tech_id, title, content, issue_id) VALUES (?, ?, ?, ?)',
            [techId, title, content, issue_id || null]
        );
        res.status(201).json({ message: 'Note created', note_id: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// PUT /notes/:id — update a note
exports.updateNote = async (req, res) => {
    try {
        const techId = await getTechId(req.user.id);
        const { title, content } = req.body;
        const [result] = await db.query(
            'UPDATE technician_notes SET title = ?, content = ? WHERE note_id = ? AND tech_id = ?',
            [title, content, req.params.id, techId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// DELETE /notes/:id — delete a note
exports.deleteNote = async (req, res) => {
    try {
        const techId = await getTechId(req.user.id);
        await db.query('DELETE FROM technician_notes WHERE note_id = ? AND tech_id = ?', [req.params.id, techId]);
        res.json({ message: 'Note deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
