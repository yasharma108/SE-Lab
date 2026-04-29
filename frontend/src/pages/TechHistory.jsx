import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaceIcon from '@mui/icons-material/Place';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import InventoryIcon from '@mui/icons-material/Inventory';

const priorityMeta = {
    low:      { color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
    medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
    high:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
    critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.18)'   },
};

const TechHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        api.get('/notes/history')
            .then(r => setHistory(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Group by month for the timeline
    const grouped = history.reduce((acc, issue) => {
        const key = issue.resolved_at
            ? new Date(issue.resolved_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Unknown Date';
        if (!acc[key]) acc[key] = [];
        acc[key].push(issue);
        return acc;
    }, {});

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'var(--success)', opacity: 0.4 }} />
                <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Loading history...</Typography>
            </Box>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <CheckCircleIcon sx={{ color: 'var(--success)', fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>My Work History</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    All issues you have resolved — including location, problem type, and your resolution notes.
                </Typography>
            </Box>

            {/* Summary Chips */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ px: 2.5, py: 1.25, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--success)' }}>{history.length}</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.63rem', fontWeight: 600 }}>Total Resolved</Typography>
                </Box>
                <Box sx={{ px: 2.5, py: 1.25, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#60a5fa' }}>
                        {[...new Set(history.map(i => i.location))].filter(Boolean).length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.63rem', fontWeight: 600 }}>Locations</Typography>
                </Box>
                <Box sx={{ px: 2.5, py: 1.25, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                        {Object.keys(grouped).length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.63rem', fontWeight: 600 }}>Months Active</Typography>
                </Box>
            </Box>

            {history.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3 }}>
                    <InventoryIcon sx={{ fontSize: 56, color: 'var(--text-muted)', opacity: 0.25, mb: 2 }} />
                    <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No resolved issues yet. Your history will appear here once you complete your first repair.</Typography>
                </Box>
            ) : (
                Object.entries(grouped).map(([month, issues]) => (
                    <Box key={month} sx={{ mb: 4 }}>
                        {/* Month header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>{month}</Typography>
                            <Divider sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.07)' }} />
                            <Chip label={`${issues.length} resolved`} size="small"
                                sx={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600, fontSize: '0.65rem' }} />
                        </Box>

                        {/* Issue cards */}
                        {issues.map((issue, idx) => {
                            const pri = priorityMeta[issue.priority] || priorityMeta.medium;
                            const isOpen = expanded === issue.issue_id;
                            return (
                                <Box key={issue.issue_id}
                                    onClick={() => setExpanded(isOpen ? null : issue.issue_id)}
                                    sx={{
                                        mb: 1.5, p: 2.5,
                                        background: 'var(--bg-card)', borderRadius: 3,
                                        border: '1px solid var(--border)',
                                        borderLeft: '4px solid var(--success)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { background: 'rgba(255,255,255,0.04)', transform: 'translateX(4px)' },
                                        animation: `fadeUp 0.25s ease ${idx * 0.05}s both`,
                                        '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
                                    }}>

                                    {/* Top row */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'white' }}>
                                                {issue.product_name || issue.asset_id}
                                            </Typography>
                                            <Chip label={issue.company_name} size="small"
                                                sx={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.65rem' }} />
                                            <Chip label={issue.priority?.toUpperCase()} size="small"
                                                sx={{ background: pri.bg, color: pri.color, fontWeight: 700, border: `1px solid ${pri.color}44`, fontSize: '0.65rem' }} />
                                        </Box>
                                        <Typography variant="caption" sx={{ color: 'var(--success)', fontWeight: 600 }}>
                                            ✓ Resolved
                                        </Typography>
                                    </Box>

                                    {/* Meta row */}
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PlaceIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                                            <Typography variant="body2" sx={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{issue.location || 'Unknown Location'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ThermostatIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                                            <Typography variant="body2" sx={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{issue.issue_type}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <AccessTimeIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                                            <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                {issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Expandable: resolution notes */}
                                    {isOpen && (
                                        <Box sx={{ mt: 2, p: 2, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                                                <NoteAltIcon sx={{ fontSize: 16, color: 'var(--success)' }} />
                                                <Typography variant="caption" sx={{ color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem' }}>Resolution Notes</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'var(--text-dim)', lineHeight: 1.7 }}>
                                                {issue.resolution_notes || <em style={{ color: 'var(--text-muted)' }}>No resolution notes were recorded for this issue.</em>}
                                            </Typography>
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 1.5 }} />
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.72rem' }}>
                                                Issue #{issue.issue_id} · Assigned {issue.assigned_at ? new Date(issue.assigned_at).toLocaleDateString() : '—'}
                                            </Typography>
                                        </Box>
                                    )}

                                    {!isOpen && (
                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>
                                            Click to view resolution notes ↓
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                ))
            )}
        </div>
    );
};

export default TechHistory;
