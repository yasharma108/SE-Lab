import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Grid, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Modal, TextField, Button, Divider } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Icons
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BoltIcon from '@mui/icons-material/Bolt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BugReportIcon from '@mui/icons-material/BugReport';
import EngineeringIcon from '@mui/icons-material/Engineering';
import TaskIcon from '@mui/icons-material/Task';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NoteAltIcon from '@mui/icons-material/NoteAlt';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─────────────────────────────────────────────────────────────────────
// Shared: Stat Card
// ─────────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, colorVar, gradFrom }) => (
    <Box sx={{
        p: 3, borderRadius: 3,
        background: `linear-gradient(135deg, ${gradFrom} 0%, rgba(15,23,42,0.96) 100%)`,
        border: `1px solid ${gradFrom}`,
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.25s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 40px ${gradFrom}` },
    }}>
        <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.07, fontSize: 80, color: colorVar, display: 'flex' }}>{icon}</Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {title}
            </Typography>
            <Box sx={{ width: 34, height: 34, borderRadius: '9px', background: gradFrom, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colorVar }}>
                {icon}
            </Box>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: colorVar, letterSpacing: '-0.02em' }}>{value}</Typography>
    </Box>
);

// ─────────────────────────────────────────────────────────────────────
// Loading Spinner
// ─────────────────────────────────────────────────────────────────────
const LoadingScreen = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <ThermostatIcon sx={{ fontSize: 48, color: 'var(--primary-color)', animation: 'spin 2s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
        <Typography color="var(--text-muted)">Loading dashboard...</Typography>
    </Box>
);

// ─────────────────────────────────────────────────────────────────────
// ADMIN / MANAGER SHARED DASHBOARD
// ─────────────────────────────────────────────────────────────────────
const AdminManagerDashboard = ({ role }) => {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try { const r = await api.get('/dashboard/summary'); setSummary(r.data); }
            catch (e) { console.error(e); }
        };
        fetch();
        const t = setInterval(fetch, 10000);
        return () => clearInterval(t);
    }, []);

    if (!summary) return <LoadingScreen />;

    const pieData = summary.faultDistribution.map(i => ({ name: i.issue_type, value: i.count }));
    const techPie = (summary.techPerformance || []).map(t => ({ name: t.name, value: t.value }));

    const stats = [
        { title: 'Total Assets', value: summary.totalAssets, icon: <Inventory2Icon sx={{ fontSize: 22 }} />, colorVar: '#60a5fa', gradFrom: 'rgba(59,130,246,0.15)' },
        { title: 'Total Issues', value: summary.activeIssues + summary.resolvedIssues, icon: <BugReportIcon sx={{ fontSize: 22 }} />, colorVar: '#facc15', gradFrom: 'rgba(234,179,8,0.14)' },
        { title: 'Active Issues', value: summary.activeIssues, icon: <WarningAmberIcon sx={{ fontSize: 22 }} />, colorVar: '#f87171', gradFrom: 'rgba(239,68,68,0.14)' },
        { title: 'Resolved', value: summary.resolvedIssues, icon: <CheckCircleIcon sx={{ fontSize: 22 }} />, colorVar: '#34d399', gradFrom: 'rgba(16,185,129,0.14)' },
    ];

    return (
        <div className="animate-fade-in">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                    {role === 'admin' ? 'Admin Control Center' : 'Manager Overview'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5 }}>
                    {role === 'admin'
                        ? 'Full system visibility — assets, issues, technician performance, live telemetry.'
                        : 'Monitor cold storage assets and manage active field issues in real time.'}
                </Typography>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((s, i) => (
                    <Grid item xs={12} sm={6} md={3} key={s.title}
                        sx={{ animation: `fadeUp 0.3s ease ${i * 0.07}s both`, '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                        <StatCard {...s} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {role === 'admin' && (
                    <Grid item xs={12} md={4}>
                        <Box sx={{ p: 3, height: 300, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>Tech Performance</Typography>
                            {techPie.length > 0 ? (
                                <ResponsiveContainer width="100%" height="85%">
                                    <PieChart>
                                        <Pie data={techPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4}>
                                            {techPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'rgba(10,18,35,0.95)', border: '1px solid #1e3a5f', borderRadius: 8, color: 'white' }} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', opacity: 0.4, flexDirection: 'column', gap: 1 }}>
                                    <EngineeringIcon sx={{ fontSize: 40 }} />
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No resolved issues yet</Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                )}
                <Grid item xs={12} md={role === 'admin' ? 3 : 6}>
                    <Box sx={{ p: 3, height: 300, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>Fault Distribution</Typography>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="85%">
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={4}>
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'rgba(10,18,35,0.95)', border: '1px solid #1e3a5f', borderRadius: 8, color: 'white' }} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', opacity: 0.4 }}>
                                <Typography sx={{ fontStyle: 'italic' }}>No fault data</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} md={role === 'admin' ? 5 : 6}>
                    <Box sx={{ p: 0, height: 300, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Header */}
                        <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontSize: '1rem' }}>🏪</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>Asset Holders</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                                {(summary.assetHolders || []).length} location{(summary.assetHolders || []).length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                        {/* Scrollable list */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                            {(summary.assetHolders || []).length === 0 ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
                                    <Typography sx={{ fontStyle: 'italic', fontSize: '0.82rem' }}>No asset holders found</Typography>
                                </Box>
                            ) : (
                                (summary.assetHolders || []).map((h, idx) => {
                                    const storeIcon = {
                                        'dmart': '🛒', 'd mart': '🛒',
                                        'reliance': '🏬', 'reliance mart': '🏬',
                                        'smart bazaar': '🛍️', 'smartbazaar': '🛍️',
                                        'big bazaar': '🏢', 'bigbazaar': '🏢',
                                        'vishal': '🏪', 'vishal mega mart': '🏪',
                                    };
                                    const icon = Object.entries(storeIcon).find(([k]) =>
                                        (h.company_name || '').toLowerCase().includes(k)
                                    )?.[1] || '🏪';
                                    const hasIssues = h.open_issues > 0;
                                    return (
                                        <Box key={idx} sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            px: 1.5, py: 1, mb: 0.75, borderRadius: 2,
                                            background: hasIssues ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${hasIssues ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                                            transition: 'all 0.15s ease',
                                            '&:hover': { background: hasIssues ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)' },
                                        }}>
                                            <Box sx={{ fontSize: '1.3rem', flexShrink: 0 }}>{icon}</Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', fontSize: '0.8rem', lineHeight: 1.3,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {h.company_name || '—'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.67rem',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                    📍 {h.location || 'Location unknown'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.4, flexShrink: 0 }}>
                                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.63rem', whiteSpace: 'nowrap' }}>
                                                    {h.asset_count} asset{h.asset_count !== 1 ? 's' : ''}
                                                </Typography>
                                                {hasIssues ? (
                                                    <Box sx={{ px: 0.8, py: 0.1, borderRadius: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
                                                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--danger)' }}>
                                                            {h.open_issues} issue{h.open_issues !== 1 ? 's' : ''}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ px: 0.8, py: 0.1, borderRadius: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#34d399' }}>OK</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })
                            )}
                        </Box>
                    </Box>
                </Grid>

            </Grid>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────
// TECHNICIAN DASHBOARD
// ─────────────────────────────────────────────────────────────────────
const statusMeta = {
    assigned:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Assigned to You' },
    reached_spot: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)',  label: 'At Location' },
    in_progress:  { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)', label: 'In Progress' },
    needs_help:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',   label: 'Needs Help' },
    resolved:     { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Resolved' },
    closed:       { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', label: 'Closed' },
};

const TechnicianDashboard = () => {
    const [data, setData] = useState(null);
    const [resolveOpen, setResolveOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [resNotes, setResNotes] = useState('');

    const fetch = async () => {
        try { const r = await api.get('/dashboard/technician'); setData(r.data); }
        catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetch();
        const t = setInterval(fetch, 15000);
        return () => clearInterval(t);
    }, []);

    const handleStatus = async (issueId, status) => {
        try { await api.put(`/issues/${issueId}/status`, { status }); fetch(); }
        catch (e) { console.error(e); }
    };

    const handleResolve = async () => {
        try {
            await api.put(`/issues/${selectedIssue.issue_id}/close`, { resolution_notes: resNotes });
            setResolveOpen(false); setResNotes(''); fetch();
        } catch (e) { console.error(e); }
    };

    if (!data) return <LoadingScreen />;

    const active = data.myIssues.filter(i => !['closed', 'resolved'].includes(i.status));
    const done = data.myIssues.filter(i => ['closed', 'resolved'].includes(i.status));

    const modalSx = {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 }, background: 'rgba(8,16,32,0.98)', backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', p: 4, borderRadius: 4,
    };
    const fieldSx = {
        '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' } },
        '& .MuiInputLabel-root': { color: 'var(--text-muted)' },
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <EngineeringIcon sx={{ color: 'var(--primary-color)', fontSize: 28 }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                            My Work Queue
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Welcome, <strong style={{ color: 'white' }}>{data.techName || 'Technician'}</strong> — here are your assigned tasks for today.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ px: 2.5, py: 1.25, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--danger)' }}>{data.active}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>Active</Typography>
                    </Box>
                    <Box sx={{ px: 2.5, py: 1.25, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--success)' }}>{data.resolved}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>Resolved</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Active Issues */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <RunningWithErrorsIcon sx={{ color: 'var(--danger)', fontSize: 20 }} /> Active Assignments
            </Typography>

            {active.length === 0 ? (
                <Box sx={{ p: 5, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, mb: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 56, color: 'var(--success)', opacity: 0.4, mb: 1 }} />
                    <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No active issues — you're all clear! 🎉</Typography>
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {active.map((issue, idx) => {
                        const meta = statusMeta[issue.status] || statusMeta.assigned;
                        return (
                            <Grid item xs={12} md={6} lg={4} key={issue.issue_id}
                                sx={{ animation: `fadeUp 0.3s ease ${idx * 0.06}s both`, '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                                <Box sx={{
                                    background: 'var(--bg-card)', borderRadius: 3,
                                    border: `1px solid ${meta.border}`,
                                    borderTop: `3px solid ${meta.color}`,
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 40px rgba(0,0,0,0.4)` }
                                }}>
                                    {/* Card header */}
                                    <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{issue.issue_id}</Typography>
                                            <Box sx={{ px: 1.5, py: 0.4, borderRadius: '20px', background: meta.bg, border: `1px solid ${meta.border}` }}>
                                                <Typography variant="caption" sx={{ color: meta.color, fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                                                    {meta.label}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 0.5, lineHeight: 1.3 }}>
                                            {issue.product_name || issue.asset_id}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {issue.company_name || 'Unknown Company'}
                                        </Typography>
                                    </Box>

                                    {/* Alert box */}
                                    <Box sx={{ mx: 2.5, mb: 2, p: 1.5, background: 'rgba(239,68,68,0.06)', borderRadius: 2, border: '1px solid rgba(239,68,68,0.15)' }}>
                                        <Typography variant="caption" sx={{ color: 'var(--danger)', fontWeight: 700, display: 'block', mb: 0.5 }}>
                                            ⚠ {issue.issue_type}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                                            {issue.description?.substring(0, 120)}{issue.description?.length > 120 ? '…' : ''}
                                        </Typography>
                                    </Box>

                                    {/* Meta Info */}
                                    <Box sx={{ mx: 2.5, mb: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PlaceIcon sx={{ fontSize: 15, color: 'var(--text-muted)' }} />
                                            <Typography variant="body2" sx={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{issue.location || 'Location not set'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ThermostatIcon sx={{ fontSize: 15, color: '#38bdf8' }} />
                                            <Typography variant="body2" sx={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                                                Target: {issue.min_temp_celsius}°C – {issue.max_temp_celsius}°C
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon sx={{ fontSize: 15, color: 'var(--text-muted)' }} />
                                            <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                {new Date(issue.created_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ borderColor: 'var(--border)' }} />

                                    {/* Action Buttons */}
                                    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {issue.status === 'assigned' && (
                                            <Button fullWidth variant="contained" size="small" color="info"
                                                sx={{ borderRadius: 2, fontWeight: 600 }}
                                                onClick={() => handleStatus(issue.issue_id, 'reached_spot')}>
                                                ✅ Reached Location
                                            </Button>
                                        )}
                                        {(issue.status === 'reached_spot' || issue.status === 'in_progress') && (
                                            <Button fullWidth variant="outlined" size="small" color="error"
                                                sx={{ borderRadius: 2, fontWeight: 600 }}
                                                onClick={() => handleStatus(issue.issue_id, 'needs_help')}>
                                                🆘 Request More Help
                                            </Button>
                                        )}
                                        {issue.status !== 'resolved' && issue.status !== 'closed' && (
                                            <Button fullWidth variant="contained" size="small" color="success"
                                                sx={{ borderRadius: 2, fontWeight: 700, boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                                                onClick={() => { setSelectedIssue(issue); setResNotes(''); setResolveOpen(true); }}>
                                                🔧 Mark as Resolved
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Resolved History */}
            {done.length > 0 && (
                <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TaskIcon sx={{ color: 'var(--success)', fontSize: 20 }} /> Completed Work ({done.length})
                    </Typography>
                    <Box sx={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {['#', 'Product', 'Location', 'Issue', 'Resolved At', 'Resolution Notes'].map(h => (
                                            <TableCell key={h} sx={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5 }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {done.map(i => (
                                        <TableRow key={i.issue_id} sx={{ '&:hover td': { background: 'rgba(255,255,255,0.02)' } }}>
                                            <TableCell sx={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{i.issue_id}</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>{i.product_name || i.asset_id}</TableCell>
                                            <TableCell sx={{ color: 'var(--text-dim)' }}>{i.location || '—'}</TableCell>
                                            <TableCell sx={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i.issue_type}</TableCell>
                                            <TableCell sx={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {i.resolved_at ? new Date(i.resolved_at).toLocaleDateString() : '—'}
                                            </TableCell>
                                            <TableCell sx={{ color: 'var(--success)', fontStyle: i.resolution_notes ? 'normal' : 'italic', maxWidth: 240, fontSize: '0.8rem' }}>
                                                {i.resolution_notes || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes</span>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            )}

            {/* Resolve Modal */}
            <Modal open={resolveOpen} onClose={() => setResolveOpen(false)}>
                <Box sx={modalSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <NoteAltIcon sx={{ color: 'var(--success)', fontSize: 24 }} />
                        <Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>Mark as Resolved</Typography>
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Issue #{selectedIssue?.issue_id} — {selectedIssue?.product_name}</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ p: 1.5, mb: 2.5, background: 'rgba(245,158,11,0.07)', borderRadius: 2, border: '1px solid rgba(245,158,11,0.2)' }}>
                        <Typography variant="body2" sx={{ color: 'var(--warning)', fontWeight: 600 }}>⚠ {selectedIssue?.issue_type}: {selectedIssue?.description?.substring(0, 80)}</Typography>
                    </Box>
                    <TextField fullWidth multiline rows={5} label="Resolution Notes"
                        placeholder="Describe exactly what you did to fix this issue. This will be saved for future reference and reviewed by the manager..."
                        value={resNotes} onChange={e => setResNotes(e.target.value)} sx={{ ...fieldSx, '& .MuiOutlinedInput-root textarea': { color: 'white' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button fullWidth variant="outlined" onClick={() => setResolveOpen(false)}
                            sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-muted)' }}>Cancel</Button>
                        <Button fullWidth variant="contained" color="success" disabled={!resNotes.trim()} onClick={handleResolve}
                            sx={{ borderRadius: '10px', fontWeight: 700, boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                            Submit & Close Issue
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────
// MANAGER DASHBOARD  (completely distinct layout)
// ─────────────────────────────────────────────────────────────────────
const ManagerDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [techs, setTechs] = useState([]);

    const fetchAll = async () => {
        try {
            const [sr, tr] = await Promise.all([api.get('/dashboard/summary'), api.get('/technicians')]);
            setSummary(sr.data);
            setTechs(tr.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchAll(); const t = setInterval(fetchAll, 15000); return () => clearInterval(t); }, []);

    if (!summary) return <LoadingScreen />;

    const totalIssues  = summary.totalIssues  ?? (summary.activeIssues + summary.resolvedIssues);
    const liveAlerts   = summary.recentAlerts?.length ?? 0;

    // Metric strip definition
    const techStats = [
        { label: 'Total Technicians',    value: summary.totalTechs    ?? techs.length,                          color: '#818cf8', icon: '👷' },
        { label: 'Available',            value: summary.availableTechs ?? techs.filter(t=>t.status==='available').length, color: '#34d399', icon: '🟢' },
        { label: 'Assigned / Busy',      value: summary.assignedTechs  ?? techs.filter(t=>t.status==='busy').length,     color: '#f59e0b', icon: '🔧' },
    ];
    const issueStats = [
        { label: 'Live Alerts',   value: liveAlerts,             color: '#ef4444', icon: '🔴' },
        { label: 'Total Issues',  value: totalIssues,            color: '#facc15', icon: '📋' },
        { label: 'Active Issues', value: summary.activeIssues,   color: '#fb923c', icon: '⚠️' },
        { label: 'Resolved',      value: summary.resolvedIssues, color: '#34d399', icon: '✅' },
    ];

    const statusPills = {
        open:         { label: 'Open',        color: '#94a3b8' },
        assigned:     { label: 'Assigned',    color: '#f59e0b' },
        reached_spot: { label: 'At Site',     color: '#38bdf8' },
        in_progress:  { label: 'In Progress', color: '#818cf8' },
        needs_help:   { label: 'Needs Help',  color: '#ef4444' },
    };

    const openIssues = (summary.recentAlerts || []).slice(0, 6);

    return (
        <div className="animate-fade-in">

            {/* ── Header ── */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', flexShrink: 0,
                            animation: 'pulse 2s ease-in-out infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>Operations Centre</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Real-time field operations — technician status, active issues, live alerts.
                    </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Auto-refreshes · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            </Box>

            {/* ── Metric Strip ── */}
            {/* Technician row */}
            <Typography variant="overline" sx={{ color: '#818cf8', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
                👷 TECHNICIAN STATUS
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                {techStats.map((s, i) => (
                    <Box key={s.label} sx={{
                        p: 2.5, borderRadius: 3,
                        background: `${s.color}10`,
                        border: `1px solid ${s.color}30`,
                        display: 'flex', alignItems: 'center', gap: 2,
                        transition: 'all 0.2s ease',
                        animation: `fadeUp 0.25s ease ${i*0.06}s both`,
                        '@keyframes fadeUp': { from: { opacity:0, transform: 'translateY(8px)' }, to: { opacity:1, transform: 'translateY(0)' } },
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${s.color}25` },
                    }}>
                        <Box sx={{ fontSize: 28, lineHeight: 1 }}>{s.icon}</Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</Typography>
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Issues row */}
            <Typography variant="overline" sx={{ color: '#fb923c', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
                📋 ISSUE OVERVIEW
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4 }}>
                {issueStats.map((s, i) => (
                    <Box key={s.label} sx={{
                        p: 2.5, borderRadius: 3,
                        background: `${s.color}0d`,
                        border: `1px solid ${s.color}28`,
                        display: 'flex', alignItems: 'center', gap: 2,
                        transition: 'all 0.2s ease',
                        animation: `fadeUp 0.25s ease ${(i+3)*0.06}s both`,
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${s.color}22` },
                    }}>
                        <Box sx={{ fontSize: 26, lineHeight: 1 }}>{s.icon}</Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</Typography>
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* ── Live Alert Feed (full-width) ── */}
            <Box sx={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTopColor: 'var(--danger)', borderTopWidth: 2, borderRadius: 3 }}>
                <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0,
                        animation: 'blink 1.2s ease-in-out infinite', '@keyframes blink': { '0%,100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' }, '50%': { opacity: 0.6, boxShadow: '0 0 0 6px rgba(239,68,68,0)' } } }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>Live Alert Feed</Typography>
                    <Box sx={{ ml: 'auto' }}>
                        <Chip label={`${(summary.recentAlerts || []).length} open`} size="small"
                            sx={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700, fontSize: '0.63rem' }} />
                    </Box>
                </Box>
                <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
                    {(summary.recentAlerts || []).length === 0 ? (
                        <Box sx={{ py: 5, textAlign: 'center', gridColumn: '1/-1' }}>
                            <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>✓ No active alerts</Typography>
                        </Box>
                    ) : (
                        (summary.recentAlerts || []).map((a, idx) => (
                            <Box key={a.issue_id} sx={{
                                p: 1.5, borderRadius: 2,
                                background: 'rgba(239,68,68,0.04)',
                                border: '1px solid rgba(239,68,68,0.12)',
                                borderLeft: '3px solid var(--danger)',
                                transition: '0.2s ease',
                                '&:hover': { background: 'rgba(239,68,68,0.08)' },
                                animation: `fadeUp 0.2s ease ${idx*0.04}s both`,
                                '@keyframes fadeUp': { from: { opacity:0, transform:'translateY(6px)' }, to: { opacity:1, transform:'translateY(0)' } },
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.78rem' }}>
                                        {a.product_name || a.asset_id}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                                        #{a.issue_id}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.68rem' }}>
                                    <PlaceIcon sx={{ fontSize: 11 }} />{a.location || 'Unknown'} · {a.issue_type}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'var(--text-muted)', fontSize: '0.63rem' }}>
                                    <AccessTimeIcon sx={{ fontSize: 10, mr: 0.25 }} />
                                    {new Date(a.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                                </Typography>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────
// ROOT DASHBOARD — role switcher
// ─────────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (user?.role === 'technician') return <TechnicianDashboard />;
    if (user?.role === 'manager')    return <ManagerDashboard />;
    return <AdminManagerDashboard role={user?.role} />;
};

export default Dashboard;
