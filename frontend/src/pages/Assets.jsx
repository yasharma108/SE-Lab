import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Grid, Card, CardContent, Typography, Box, Chip, Button, Modal, TextField, Divider } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const modalSx = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 620 },
    background: 'rgba(10, 18, 35, 0.97)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
    p: 4, borderRadius: 4,
    backdropFilter: 'blur(30px)',
};

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        color: 'white',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.03)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--text-muted)' },
    '& input[type="date"]::-webkit-calendar-picker-indicator': { filter: 'invert(1)', opacity: 0.5 },
};

const Assets = () => {
    const { user } = useContext(AuthContext);
    const [assets, setAssets] = useState([]);
    const [open, setOpen] = useState(false);
    const [newAsset, setNewAsset] = useState({
        asset_id: '', product_name: '', company_name: '', location: '',
        min_temp_celsius: '', max_temp_celsius: '', expiry_date: '', status: 'active'
    });

    useEffect(() => { fetchAssets(); }, []);

    const fetchAssets = async () => {
        try { const res = await api.get('/assets'); setAssets(res.data); }
        catch (err) { console.error(err); }
    };

    const handleCreate = async () => {
        try { await api.post('/assets', newAsset); setOpen(false); fetchAssets(); }
        catch (err) { console.error(err); }
    };

    const getStatusChip = (status) => (
        <Chip
            label={status.toUpperCase()}
            size="small"
            sx={{
                fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em',
                background: status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: status === 'active' ? 'var(--success)' : 'var(--warning)',
                border: `1px solid ${status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}
        />
    );

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                        Cold Storage Assets
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Manage refrigerated products and their IoT monitoring thresholds.
                    </Typography>
                </Box>
                {user?.role === 'admin' && (
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                            borderRadius: '12px', fontWeight: 600, py: 1.2, px: 2.5,
                            boxShadow: '0 4px 20px var(--primary-glow)',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 30px var(--primary-glow)' },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Add Asset
                    </Button>
                )}
            </Box>

            {/* Asset Cards */}
            <Grid container spacing={3}>
                {assets.map((asset, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={asset.asset_id}>
                        <Card className="glass-panel" sx={{
                            height: '100%', display: 'flex', flexDirection: 'column',
                            borderRadius: 3, transition: 'all 0.25s ease',
                            borderLeft: '3px solid',
                            borderLeftColor: asset.status === 'active' ? 'var(--success)' : 'var(--warning)',
                            animation: `fadeInUp 0.3s ease ${idx * 0.05}s both`,
                            '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                            '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.15)' }
                        }}>
                            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                {/* Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                                            {asset.product_name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <BusinessIcon sx={{ fontSize: 13, color: 'var(--text-muted)' }} />
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{asset.company_name}</Typography>
                                        </Box>
                                    </Box>
                                    {getStatusChip(asset.status)}
                                </Box>

                                <Divider sx={{ borderColor: 'var(--border)', mb: 2 }} />

                                {/* Details rows */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <LocationOnIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>Location</Typography>
                                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>{asset.location}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <ThermostatIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>Target Range</Typography>
                                            <Typography variant="body2" sx={{ color: '#38bdf8', fontWeight: 600, fontFamily: 'monospace' }}>
                                                {asset.min_temp_celsius}°C → {asset.max_temp_celsius}°C
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 15, color: 'var(--warning)' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>Expiry Date</Typography>
                                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                                                {asset.expiry_date ? new Date(asset.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>

                            {/* Footer badge */}
                            <Box sx={{ px: 2.5, pb: 2 }}>
                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                    ID: {asset.asset_id}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}

                {assets.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}>
                            <ThermostatIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2 }} />
                            <Typography>No assets found. {user?.role === 'admin' ? 'Click "Add Asset" to get started.' : 'Contact an admin to add assets.'}</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Add Asset Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalSx}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'white' }}>
                        Register New Asset
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 3 }}>
                        Add a cold storage product for IoT monitoring.
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {[
                            { label: 'Asset ID (e.g. DMART-05)', key: 'asset_id' },
                            { label: 'Product Name', key: 'product_name' },
                            { label: 'Company Name', key: 'company_name' },
                            { label: 'Location (e.g. Dmart Fridge A)', key: 'location' },
                            { label: 'Min Temperature °C', key: 'min_temp_celsius', type: 'number' },
                            { label: 'Max Temperature °C', key: 'max_temp_celsius', type: 'number' },
                        ].map(f => (
                            <TextField key={f.key} fullWidth margin="dense" label={f.label} type={f.type || 'text'}
                                value={newAsset[f.key]}
                                onChange={(e) => setNewAsset({ ...newAsset, [f.key]: e.target.value })}
                                sx={fieldSx}
                            />
                        ))}
                        <TextField fullWidth margin="dense" type="date" label="Expiry Date"
                            InputLabelProps={{ shrink: true }}
                            value={newAsset.expiry_date}
                            onChange={(e) => setNewAsset({ ...newAsset, expiry_date: e.target.value })}
                            sx={{ ...fieldSx, gridColumn: '1 / -1' }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button fullWidth variant="outlined" onClick={() => setOpen(false)}
                            sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-muted)', '&:hover': { borderColor: 'white' } }}>
                            Cancel
                        </Button>
                        <Button fullWidth variant="contained" onClick={handleCreate}
                            sx={{ borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))', fontWeight: 700, boxShadow: '0 4px 20px var(--primary-glow)' }}>
                            Save Asset
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default Assets;
