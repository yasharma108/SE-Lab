const db = require('../config/db');

exports.getAllTechnicians = async (req, res) => {
    try {
        const [technicians] = await db.query('SELECT * FROM technicians');
        res.json(technicians);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.createTechnician = async (req, res) => {
    try {
        const { name, phone, email, status } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO technicians (name, phone, email, status) VALUES (?, ?, ?, ?)',
            [name, phone, email, status || 'available']
        );
        res.status(201).json({ message: 'Technician created successfully', tech_id: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
