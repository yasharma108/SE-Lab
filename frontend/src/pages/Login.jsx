import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ThermostatIcon from '@mui/icons-material/Thermostat';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (!success) setError('Invalid username or password. Please try again.');
    };

    const demoAccounts = [
        { role: 'Admin', user: 'admin', badge: 'role-admin' },
        { role: 'Manager', user: 'manager1', badge: 'role-manager' },
        { role: 'Technician', user: 'technician1', badge: 'role-technician' },
    ];

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            color: 'white',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)', boxShadow: '0 0 0 3px var(--primary-glow)' },
        },
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.55)' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'var(--primary-color)' },
    };

    return (
        <>
        <div className="login-container">
            {/* Decorative orbs */}
            <div className="login-orb animate-float" style={{ width: 400, height: 400, background: 'rgba(59,130,246,0.08)', top: -80, left: -100 }} />
            <div className="login-orb" style={{ width: 300, height: 300, background: 'rgba(139,92,246,0.06)', bottom: -60, right: -80, animationDelay: '1.5s' }} />

            <div className="login-form-card">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 64, height: 64, margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)',
                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px var(--primary-glow)',
                    }}>
                        <ThermostatIcon sx={{ fontSize: 32, color: 'white' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #93c5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        FieldSense
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        IoT Based Assets Monitoring Platform
                    </p>
                </div>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'white', '& .MuiAlert-icon': { color: 'var(--danger)' } }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth required margin="normal"
                        id="username" label="Username" name="email" autoFocus
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        sx={fieldSx}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'var(--text-muted)', fontSize: 20 }} /></InputAdornment> }}
                    />
                    <TextField
                        fullWidth required margin="normal"
                        name="password" label="Password"
                        type={showPass ? 'text' : 'password'} id="password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        sx={fieldSx}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'var(--text-muted)', fontSize: 20 }} /></InputAdornment>,
                            endAdornment: <InputAdornment position="end">
                                <IconButton onClick={() => setShowPass(!showPass)} edge="end" sx={{ color: 'var(--text-muted)' }}>
                                    {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                </IconButton>
                            </InputAdornment>
                        }}
                    />

                    <Button
                        type="submit" fullWidth variant="contained" disabled={loading}
                        sx={{
                            mt: 3, mb: 2, py: 1.5, borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                            fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.03em',
                            boxShadow: '0 4px 20px var(--primary-glow)',
                            transition: 'all 0.2s ease',
                            '&:hover': { boxShadow: '0 6px 30px var(--primary-glow)', transform: 'translateY(-1px)' },
                            '&:disabled': { opacity: 0.7 }
                        }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                {/* Demo Accounts */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                        Demo Accounts (password: 123)
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {demoAccounts.map(a => (
                            <button
                                key={a.user}
                                onClick={() => { setEmail(a.user); setPassword('123'); }}
                                style={{
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer',
                                    color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                }}
                                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                <span className={`role-badge ${a.badge}`}>{a.role}</span>
                                {a.user}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Trademark — fixed at the very bottom of the page */}
        <p style={{
            position: 'fixed', bottom: '0.75rem', left: 0, right: 0,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '0.62rem',
            letterSpacing: '0.05em',
            userSelect: 'none',
            pointerEvents: 'none',
        }}>
            &copy; {new Date().getFullYear()} FieldSense&trade; &mdash; All rights reserved.
        </p>
        </>
    );
};

export default Login;
