import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Typography, Box, Button, Select, MenuItem, FormControl,
    InputLabel, Chip, Divider, CircularProgress, Alert
} from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PlaceIcon from '@mui/icons-material/Place';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const LOCATIONS = [
    'Dmart - 1',
    'Dmart - 2',
    'Reliance Mart 1',
    'Reliance Mart 2',
    'Vishal Mega Mart',
    'Smart Bazaar',
    'Big Bazaar',
    'More Supermarket',
];

const priorityMeta = {
    low:      { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)' },
    medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'  },
    high:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)'   },
    critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.18)',   border: 'rgba(220,38,38,0.3)'    },
};

const selectSx = {
    '& .MuiOutlinedInput-root': {
        color: 'white', borderRadius: '12px', background: 'rgba(255,255,255,0.04)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--text-muted)' },
    '& .MuiSelect-icon': { color: 'var(--text-muted)' },
};

const IssueCard = ({ issue, technicians, onAssigned }) => {
    const [selectedTech, setSelectedTech] = useState(issue.assigned_technician || '');
    const [assigning, setAssigning] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleAssign = async () => {
        if (!selectedTech) return;
        setAssigning(true);
        try {
            await api.put(`/issues/${issue.issue_id}/assign`, { tech_id: selectedTech });
            setSuccess(true);
            const tech = technicians.find(t => t.tech_id === selectedTech);
            onAssigned(issue.issue_id, tech?.name);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) { console.error(e); }
        setAssigning(false);
    };

    const pri = priorityMeta[issue.priority] || priorityMeta.medium;
    const isTemperature = issue.issue_type?.toLowerCase().includes('temp');
    const isPower = issue.issue_type?.toLowerCase().includes('power');

    return (
        <Box sx={{
            p: 2.5, borderRadius: 3,
            background: 'var(--bg-card)',
            border: `1px solid ${success ? 'rgba(16,185,129,0.35)' : 'var(--border)'}`,
            borderLeft: `4px solid ${pri.color}`,
            transition: 'all 0.25s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' },
        }}>
            {/* Top row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isTemperature && <ThermostatIcon sx={{ fontSize: 16, color: '#ef4444' }} />}
                        {isPower && <BoltIcon sx={{ fontSize: 16, color: '#f59e0b' }} />}
                        {!isTemperature && !isPower && <ReportProblemIcon sx={{ fontSize: 16, color: pri.color }} />}
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'white' }}>
                            {issue.product_name || issue.asset_id || 'Unknown Asset'}
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.68rem', ml: 0.5 }}>
                        #{issue.issue_id} · {issue.issue_type}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={issue.priority?.toUpperCase()} size="small"
                        sx={{ background: pri.bg, color: pri.color, border: `1px solid ${pri.border}`, fontWeight: 700, fontSize: '0.63rem' }} />
                    <Chip label={issue.status?.replace('_', ' ').toUpperCase()} size="small"
                        sx={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.63rem', fontWeight: 600 }} />
                </Box>
            </Box>

            {/* Description */}
            {issue.description && (
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.8rem', mb: 1.5, lineHeight: 1.6 }}>
                    {issue.description.substring(0, 120)}{issue.description.length > 120 ? '...' : ''}
                </Typography>
            )}

            {/* Meta */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    Reported {new Date(issue.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

            {/* Assign row */}
            {success ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <CheckCircleIcon sx={{ color: 'var(--success)', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'var(--success)', fontWeight: 600 }}>
                        Technician assigned successfully!
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 200, flex: 1, ...selectSx }}>
                        <InputLabel>Select Technician</InputLabel>
                        <Select value={selectedTech} label="Select Technician"
                            onChange={e => setSelectedTech(e.target.value)}>
                            {technicians.map(t => (
                                <MenuItem key={t.tech_id} value={t.tech_id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{
                                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                            background: t.status === 'available' ? 'var(--success)' : t.status === 'busy' ? '#f59e0b' : '#64748b',
                                        }} />
                                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                                        <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 4 }}>· {t.status}</span>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" disabled={!selectedTech || assigning}
                        onClick={handleAssign}
                        startIcon={assigning ? <CircularProgress size={14} color="inherit" /> : <AssignmentIndIcon />}
                        sx={{
                            borderRadius: '10px', fontWeight: 700, flexShrink: 0,
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                            '&:hover': { boxShadow: '0 6px 20px rgba(37,99,235,0.5)' },
                            '&.Mui-disabled': { opacity: 0.5 },
                        }}>
                        {assigning ? 'Assigning...' : 'Assign'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

const AssignTech = () => {
    const [technicians, setTechnicians] = useState([]);
    const [allIssues, setAllIssues] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [tr, ir] = await Promise.all([
                api.get('/technicians'),
                api.get('/issues'),
            ]);
            setTechnicians(tr.data);
            setAllIssues(ir.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAssigned = (issueId, techName) => {
        setAllIssues(prev => prev.map(i =>
            i.issue_id === issueId
                ? { ...i, status: 'assigned', technician_name: techName }
                : i
        ));
    };

    // Filter open/unassigned issues by selected location from the linked asset's location
    const openIssues = allIssues.filter(i =>
        ['open', 'assigned'].includes(i.status) &&
        (selectedLocation ? i.location === selectedLocation : true)
    );

    // Unique locations found in open issues (from asset data) + predefined list
    const issueLocations = [...new Set(allIssues.map(i => i.location).filter(Boolean))];

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <AssignmentIndIcon sx={{ color: 'var(--primary-color)', fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>Assign Technician</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    Select a location to view open issues, then assign a technician to each one.
                </Typography>
            </Box>

            {/* ── Selection Panel ── */}
            <Box sx={{
                p: 3, mb: 4, borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.03))',
                border: '1px solid rgba(37,99,235,0.2)',
                display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-end',
            }}>
                {/* Location selector */}
                <FormControl sx={{ minWidth: 240, flex: 1, ...selectSx }}>
                    <InputLabel>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PlaceIcon sx={{ fontSize: 16 }} /> Filter by Location
                        </Box>
                    </InputLabel>
                    <Select value={selectedLocation} label="Filter by Location"
                        onChange={e => setSelectedLocation(e.target.value)}>
                        <MenuItem value=""><em>All Locations</em></MenuItem>
                        {/* known locations from DB issues first */}
                        {issueLocations.map(loc => (
                            <MenuItem key={loc} value={loc}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PlaceIcon sx={{ fontSize: 15, color: '#60a5fa' }} />
                                    <span style={{ fontWeight: 600 }}>{loc}</span>
                                </Box>
                            </MenuItem>
                        ))}
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
                        {/* predefined locations not already in issues */}
                        {LOCATIONS.filter(l => !issueLocations.includes(l)).map(loc => (
                            <MenuItem key={loc} value={loc}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PlaceIcon sx={{ fontSize: 15, color: 'var(--text-muted)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>{loc}</span>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Technician availability summary */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Available', color: '#34d399', count: technicians.filter(t => t.status === 'available').length },
                        { label: 'Busy', color: '#f59e0b', count: technicians.filter(t => t.status === 'busy').length },
                        { label: 'Offline', color: '#64748b', count: technicians.filter(t => t.status === 'offline').length },
                    ].map(s => (
                        <Box key={s.label} sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75,
                            px: 1.5, py: 0.75,
                            background: `${s.color}14`,
                            border: `1px solid ${s.color}30`,
                            borderRadius: 2,
                        }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: s.color }}>{s.count} {s.label}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── Issues list ── */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: 'var(--primary-color)' }} />
                </Box>
            ) : openIssues.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3 }}>
                    <CheckCircleIcon sx={{ fontSize: 56, color: 'var(--success)', opacity: 0.25, mb: 2 }} />
                    <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {selectedLocation
                            ? `No open issues at ${selectedLocation}. 🎉`
                            : 'No open issues across any location.'}
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
                            {selectedLocation ? `Open issues at ${selectedLocation}` : 'All open issues'}
                        </Typography>
                        <Chip label={`${openIssues.length} issue${openIssues.length !== 1 ? 's' : ''}`} size="small"
                            sx={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700 }} />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {openIssues.map((issue, idx) => (
                            <Box key={issue.issue_id} sx={{
                                animation: `fadeUp 0.2s ease ${idx * 0.05}s both`,
                                '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
                            }}>
                                <IssueCard issue={issue} technicians={technicians} onAssigned={handleAssigned} />
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </div>
    );
};

export default AssignTech;
