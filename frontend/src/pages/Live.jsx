import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import {
    Typography, Box, Chip,
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BoltIcon from '@mui/icons-material/Bolt';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SensorsIcon from '@mui/icons-material/Sensors';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

const WS_URL = `ws://${window.location.hostname}:5000`;

const Live = () => {
    const [sensors, setSensors] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [wsConnected, setWsConnected] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [loading, setLoading] = useState(true);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const pollTimer = useRef(null);

    // ── REST fallback: fetch all latest readings ──
    const fetchLive = useCallback(async () => {
        try {
            const r = await api.get('/sensors/live');
            setSensors(r.data || []);
            setLastRefresh(new Date());
        } catch (e) {
            console.error('[Live] REST fetch failed:', e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── WebSocket connection ──
    const connectWs = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState <= 1) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setWsConnected(true);
            // Stop polling when WS is live
            if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'SENSOR_UPDATE' && msg.payload) {
                    const p = msg.payload;
                    setSensors(prev => {
                        const idx = prev.findIndex(s => s.asset_id === p.asset_id);
                        if (idx >= 0) {
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], ...p };
                            return updated;
                        }
                        return [...prev, p];
                    });
                    setLastRefresh(new Date());

                    if (p.alertGenerated && p.alertMessage) {
                        setAlerts(prev => [
                            { id: Date.now(), asset_id: p.asset_id, location: p.location, message: p.alertMessage, temperature: p.temperature, time: new Date() },
                            ...prev.slice(0, 9),
                        ]);
                    }
                }
            } catch (e) { /* ignore non-JSON */ }
        };

        ws.onclose = () => {
            setWsConnected(false);
            // Fallback: poll REST every 10s
            if (!pollTimer.current) {
                pollTimer.current = setInterval(fetchLive, 10000);
            }
            // Reconnect WS after 3s
            reconnectTimer.current = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => ws.close();
    }, [fetchLive]);

    useEffect(() => {
        fetchLive();
        connectWs();

        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (pollTimer.current) clearInterval(pollTimer.current);
        };
    }, [fetchLive, connectWs]);

    // ── Derived stats ──
    const alertCount = sensors.filter(s => {
        const hasTemp = s.temperature !== null && s.temperature !== undefined;
        const warn = hasTemp && (parseFloat(s.temperature) > parseFloat(s.max_temp_celsius) || parseFloat(s.temperature) < parseFloat(s.min_temp_celsius));
        const pwrWarn = ['power_loss', 'offline'].includes(s.power_status);
        return warn || pwrWarn;
    }).length;

    const getTemperatureColor = (temp, min, max) => {
        const t = parseFloat(temp);
        const mn = parseFloat(min);
        const mx = parseFloat(max);
        if (isNaN(t)) return { color: '#94a3b8', bg: 'rgba(100,116,139,0.12)', label: 'No Signal' };
        if (t > mx) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'HIGH ALERT' };
        if (t < mn) return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'LOW ALERT' };
        // Warn if within 3° of threshold
        if (t >= mx - 3) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'WARNING' };
        return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'NORMAL' };
    };

    const dismissAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="animate-fade-in">
            {/* ── Header ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <span className="live-dot" />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                            Live Telemetry
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Real-time ESP32 sensor readings via WebSocket. Threshold: auto-alert on breach.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* WS status badge */}
                    <Box sx={{
                        px: 1.5, py: 0.5, borderRadius: 2,
                        background: wsConnected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${wsConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        display: 'flex', alignItems: 'center', gap: 0.75,
                    }}>
                        <Box sx={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: wsConnected ? '#10b981' : '#ef4444',
                            boxShadow: wsConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444',
                            animation: wsConnected ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
                        }} />
                        <Typography variant="caption" sx={{ color: wsConnected ? '#34d399' : '#f87171', fontWeight: 700, fontSize: '0.68rem' }}>
                            {wsConnected ? 'WEBSOCKET LIVE' : 'POLLING (10s)'}
                        </Typography>
                    </Box>

                    {alertCount > 0 && (
                        <Box sx={{ px: 1.5, py: 0.5, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>
                                ⚠ {alertCount} ALERT{alertCount > 1 ? 'S' : ''}
                            </Typography>
                        </Box>
                    )}

                    {lastRefresh && (
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                            Updated {lastRefresh.toLocaleTimeString()}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* ── Alert Banners ── */}
            {alerts.length > 0 && (
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {alerts.map(a => (
                        <Box key={a.id} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.25, borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04))',
                            border: '1px solid rgba(239,68,68,0.25)',
                            animation: 'slideDown 0.3s ease',
                            '@keyframes slideDown': { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                        }}>
                            <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 20, flexShrink: 0 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ color: '#fca5a5', fontWeight: 600, fontSize: '0.82rem' }}>
                                    {a.message}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                                    {a.location || a.asset_id} · {a.time.toLocaleTimeString()}
                                </Typography>
                            </Box>
                            <button onClick={() => dismissAlert(a.id)} style={{
                                background: 'none', border: 'none', color: '#94a3b8',
                                cursor: 'pointer', fontSize: '1.1rem', padding: '2px 6px',
                            }}>×</button>
                        </Box>
                    ))}
                </Box>
            )}

            {/* ── Summary Stats ── */}
            <Box sx={{ display: 'flex', gap: 2.5, mb: 3.5, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Units', value: sensors.length, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
                    { label: 'Online', value: sensors.filter(s => s.temperature !== null && s.temperature !== undefined).length, color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'No Signal', value: sensors.filter(s => s.temperature === null || s.temperature === undefined).length, color: '#94a3b8', bg: 'rgba(100,116,139,0.1)' },
                    { label: 'Alerts', value: alertCount, color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
                ].map(s => (
                    <Box key={s.label} sx={{
                        px: 2.5, py: 1.5, borderRadius: 2,
                        background: s.bg, border: `1px solid ${s.color}22`, minWidth: 90,
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.62rem' }}>{s.label}</Typography>
                    </Box>
                ))}
            </Box>

            {/* ── Sensor Cards Grid ── */}
            {loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <SensorsIcon sx={{ fontSize: 48, color: 'var(--primary-color)', opacity: 0.3, mb: 2 }} />
                    <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Connecting to sensors...</Typography>
                </Box>
            ) : sensors.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <WifiOffIcon sx={{ fontSize: 48, color: 'var(--text-muted)', opacity: 0.3, mb: 2 }} />
                    <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No sensor data available. Connect ESP32 devices to begin monitoring.</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 2.5 }}>
                    {sensors.map((s, idx) => {
                        const hasTemp = s.temperature !== null && s.temperature !== undefined;
                        const tempInfo = getTemperatureColor(s.temperature, s.min_temp_celsius, s.max_temp_celsius);
                        const pwrWarn = ['power_loss', 'offline'].includes(s.power_status);
                        const isAlert = tempInfo.label.includes('ALERT') || pwrWarn;

                        return (
                            <Box key={s.asset_id} sx={{
                                background: 'var(--bg-card)',
                                border: `1px solid ${isAlert ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                                borderRadius: 3, overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                animation: `fadeInUp 0.3s ease ${idx * 0.06}s both`,
                                '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                                '&:hover': { borderColor: isAlert ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.3)', transform: 'translateY(-2px)', boxShadow: isAlert ? '0 8px 32px rgba(239,68,68,0.15)' : '0 8px 32px rgba(59,130,246,0.1)' },
                            }}>
                                {/* Card Header */}
                                <Box sx={{
                                    px: 2.5, py: 1.5,
                                    borderBottom: '1px solid var(--border)',
                                    background: isAlert ? 'rgba(239,68,68,0.05)' : 'rgba(0,0,0,0.15)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {isAlert && <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'pulse 1.5s infinite' }} />}
                                            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>
                                                {s.location || s.asset_id}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.62rem' }}>
                                            {s.asset_id}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={tempInfo.label}
                                        size="small"
                                        sx={{
                                            fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.04em',
                                            background: tempInfo.bg,
                                            color: tempInfo.color,
                                            border: `1px solid ${tempInfo.color}33`,
                                            height: 22,
                                        }}
                                    />
                                </Box>

                                {/* Card Body */}
                                <Box sx={{ px: 2.5, py: 2 }}>
                                    {/* Big temperature value */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                                        <ThermostatIcon sx={{ fontSize: 28, color: tempInfo.color, opacity: 0.8 }} />
                                        {hasTemp ? (
                                            <Typography sx={{
                                                fontSize: '2.8rem', fontWeight: 900, fontFamily: 'monospace',
                                                color: tempInfo.color, lineHeight: 1,
                                                transition: 'color 0.3s ease',
                                                textShadow: isAlert ? `0 0 20px ${tempInfo.color}40` : 'none',
                                            }}>
                                                {parseFloat(s.temperature).toFixed(1)}°
                                            </Typography>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <WifiOffIcon sx={{ fontSize: 24, color: '#64748b' }} />
                                                <Typography sx={{ color: '#64748b', fontStyle: 'italic' }}>No Signal</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Threshold range bar */}
                                    {hasTemp && s.min_temp_celsius != null && s.max_temp_celsius != null && (
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" sx={{ color: '#38bdf8', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                                                    {s.min_temp_celsius}°C
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                                                    Safe Range
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#f87171', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                                                    {s.max_temp_celsius}°C
                                                </Typography>
                                            </Box>
                                            <Box sx={{ position: 'relative', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                {/* Range fill */}
                                                <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444)`, width: '100%', opacity: 0.2 }} />
                                                {/* Current position indicator */}
                                                <Box sx={{
                                                    position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)',
                                                    left: `${Math.min(100, Math.max(0, ((parseFloat(s.temperature) - parseFloat(s.min_temp_celsius)) / (parseFloat(s.max_temp_celsius) - parseFloat(s.min_temp_celsius))) * 100))}%`,
                                                    width: 10, height: 10, borderRadius: '50%',
                                                    background: tempInfo.color,
                                                    boxShadow: `0 0 8px ${tempInfo.color}`,
                                                    border: '2px solid rgba(255,255,255,0.8)',
                                                    transition: 'left 0.5s ease',
                                                }} />
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Info row */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid var(--border)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <BoltIcon sx={{ fontSize: 14, color: pwrWarn ? '#ef4444' : '#34d399' }} />
                                            <Typography variant="caption" sx={{ color: pwrWarn ? '#f87171' : '#34d399', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                                {s.power_status ? s.power_status.replace('_', ' ') : '—'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {hasTemp ? (
                                                <CheckCircleOutlineIcon sx={{ fontSize: 12, color: 'var(--text-muted)' }} />
                                            ) : (
                                                <WifiOffIcon sx={{ fontSize: 12, color: 'var(--text-muted)' }} />
                                            )}
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                                                {s.last_update ? new Date(s.last_update).toLocaleTimeString() : 'Never'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Product info */}
                                    {s.product_name && (
                                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" sx={{ color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.68rem' }}>
                                                {s.product_name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                                                {s.company_name}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </div>
    );
};

export default Live;
