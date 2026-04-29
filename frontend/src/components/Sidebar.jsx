import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SensorsIcon from '@mui/icons-material/Sensors';
import HistoryIcon from '@mui/icons-material/History';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

    const getNavItems = () => {
        if (user?.role === 'admin') {
            return [
                { text: 'Dashboard',   icon: DashboardRoundedIcon,   path: '/', end: true },
                { text: 'Assets',      icon: Inventory2RoundedIcon,  path: '/assets' },
                { text: 'Live',        icon: SensorsIcon,            path: '/live',        accent: '#34d399' },
                { text: 'Employees',   icon: PeopleRoundedIcon,      path: '/employees' },
                { text: 'Technicians', icon: EngineeringRoundedIcon, path: '/technicians' },
            ];
        }
        if (user?.role === 'manager') {
            return [
                { text: 'Dashboard',    icon: DashboardRoundedIcon,   path: '/', end: true },
                { text: 'Assets',       icon: Inventory2RoundedIcon,  path: '/assets' },
                { text: 'Live',         icon: SensorsIcon,            path: '/live',        accent: '#34d399' },
                { text: 'Assign Tech',  icon: AssignmentIndIcon,      path: '/assign-tech', accent: '#60a5fa' },
                { text: 'Technicians',  icon: EngineeringRoundedIcon, path: '/technicians' },
            ];
        }
        if (user?.role === 'technician') {
            return [
                { text: 'Dashboard', icon: DashboardRoundedIcon,   path: '/', end: true },
                { text: 'Assets',    icon: Inventory2RoundedIcon,  path: '/assets' },
                { text: 'Live',      icon: SensorsIcon,            path: '/live',    accent: '#34d399' },
                { text: 'Notes',     icon: NoteAltIcon,            path: '/tech-notes', accent: '#a78bfa' },
                { text: 'History',   icon: HistoryIcon,            path: '/history',    accent: '#f59e0b' },
            ];
        }
        return [
            { text: 'Dashboard', icon: DashboardRoundedIcon, path: '/', end: true },
        ];
    };

    const roleColors = { admin: '#a78bfa', manager: '#60a5fa', technician: '#34d399' };
    const roleBg     = { admin: 'rgba(139,92,246,0.15)', manager: 'rgba(59,130,246,0.15)', technician: 'rgba(16,185,129,0.15)' };
    const roleColor  = roleColors[user?.role] || '#94a3b8';
    const roleBgColor = roleBg[user?.role] || 'rgba(255,255,255,0.08)';

    return (
        <div style={{
            width: 256, minWidth: 256, height: '100vh',
            display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(180deg, #07101f 0%, #050d1a 100%)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            position: 'sticky', top: 0, overflowY: 'auto', flexShrink: 0,
        }}>
            {/* Brand */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '1.25rem 1.25rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                flexShrink: 0,
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                }}>
                    <ThermostatIcon sx={{ fontSize: 22, color: 'white' }} />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.01em' }}>FieldSense</div>
                    <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 500, marginTop: 1 }}>IoT Cold Chain Monitor</div>
                </div>
            </div>

            {/* Nav section label */}
            <div style={{ padding: '1rem 1.25rem 0.5rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Main Menu
                </span>
            </div>

            {/* Nav Items */}
            <nav style={{ padding: '0 0.75rem', flexShrink: 0 }}>
                {getNavItems().map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.text}
                            to={item.path}
                            end={item.end || false}
                            style={({ isActive }) => {
                                const ac = item.accent;
                                return {
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.65rem 0.9rem', marginBottom: '0.2rem',
                                    borderRadius: 10, textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? '#ffffff' : (ac || '#64748b'),
                                    background: isActive
                                        ? (ac ? `linear-gradient(135deg, ${ac}cc, ${ac}88)` : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)')
                                        : 'transparent',
                                    boxShadow: isActive
                                        ? (ac ? `0 4px 16px ${ac}40` : '0 4px 16px rgba(37,99,235,0.35)')
                                        : 'none',
                                    transition: 'all 0.18s ease',
                                };
                            }}
                        >
                            <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(255,255,255,0.06)',
                            }}>
                                <Icon style={{ fontSize: 18 }} />
                            </div>
                            <span>{item.text}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* User Profile Footer */}
            {user && (
                <div style={{
                    margin: '0.75rem',
                    padding: '0.9rem 1rem',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.03)',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '1rem', color: 'white',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        }}>
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.name}
                            </div>
                            <div style={{
                                display: 'inline-block', marginTop: 2,
                                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em',
                                textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20,
                                background: roleBgColor, color: roleColor,
                            }}>
                                {user.role}
                            </div>
                        </div>
                    </div>
                    <button onClick={logout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.45rem 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        fontSize: '0.8rem', fontWeight: 600, color: '#f87171',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
                        transition: 'all 0.15s ease',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.18)'; }}
                    >
                        <LogoutRoundedIcon style={{ fontSize: 16 }} />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
