import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Box, Tooltip, IconButton } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';

const Navbar = () => {
    const { user } = useContext(AuthContext);

    const roleClass = { admin: 'role-admin', manager: 'role-manager', technician: 'role-technician' }[user?.role] || '';//roles

    return (
        <AppBar position="sticky" className="navbar" sx={{ zIndex: 100 }}>
            <Toolbar sx={{ minHeight: '60px !important', px: { xs: 2, sm: 3 } }}>
                {/* App title spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Icon actions */}
                        <Tooltip title="Notifications">
                            <IconButton size="small" sx={{ color: 'var(--text-muted)', '&:hover': { color: 'white', background: 'rgba(255,255,255,0.08)' }, borderRadius: 2 }}>
                                <NotificationsNoneIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Settings">
                            <IconButton size="small" sx={{ color: 'var(--text-muted)', '&:hover': { color: 'white', background: 'rgba(255,255,255,0.08)' }, borderRadius: 2 }}>
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {/* Vertical divider */}
                        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 0.5rem' }} />

                        {/* User info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.75, borderRadius: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                            <Box sx={{ textAlign: 'right', lineHeight: 1.3 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', fontSize: '0.85rem' }}>
                                    {user.name}
                                </Typography>
                                <span className={`role-badge ${roleClass}`}>{user.role}</span>
                            </Box>
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-color), #7c3aed)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0,
                                boxShadow: '0 0 12px var(--primary-glow)'
                            }}>
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </Box>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
