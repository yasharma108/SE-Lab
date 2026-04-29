const db = require('../config/db');

exports.getAllAssets = async (req, res) => {
    try {
        const [assets] = await db.query('SELECT * FROM assets ORDER BY created_at DESC');
        res.json(assets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getAssetById = async (req, res) => {
    try {
        const [assets] = await db.query('SELECT * FROM assets WHERE asset_id = ?', [req.params.id]);
        if (assets.length === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json(assets[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.createAsset = async (req, res) => {
    try {
        const { asset_id, product_name, company_name, location, min_temp_celsius, max_temp_celsius, expiry_date, status } = req.body;
        
        const [existing] = await db.query('SELECT * FROM assets WHERE asset_id = ?', [asset_id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Asset ID already exists' });
        }

        await db.query(
            'INSERT INTO assets (asset_id, product_name, company_name, location, min_temp_celsius, max_temp_celsius, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [asset_id, product_name, company_name, location, min_temp_celsius, max_temp_celsius, expiry_date, status || 'active']
        );
        res.status(201).json({ message: 'Asset created successfully', asset_id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateAsset = async (req, res) => {
    try {
        const { product_name, company_name, location, min_temp_celsius, max_temp_celsius, expiry_date, status } = req.body;
        const [result] = await db.query(
            'UPDATE assets SET product_name = ?, company_name = ?, location = ?, min_temp_celsius = ?, max_temp_celsius = ?, expiry_date = ?, status = ? WHERE asset_id = ?',
            [product_name, company_name, location, min_temp_celsius, max_temp_celsius, expiry_date, status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json({ message: 'Asset updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM assets WHERE asset_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json({ message: 'Asset deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
