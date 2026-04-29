import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';

const Employees = () => {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/employees');
                setEmployees(res.data);
            } catch (err) {
                console.error("Failed to fetch employees", err);
            }
        };
        fetchEmployees();
    }, []);

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'manager': return 'secondary';
            case 'technician': return 'primary';
            default: return 'default';
        }
    };

    return (
        <div>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Employee Performance</Typography>
                <Typography variant="body2" color="var(--text-muted)">Track issues resolved and efficiency metrics for managers and technicians.</Typography>
            </Box>

            <TableContainer component={Paper} className="glass-panel" sx={{ background: 'var(--bg-card)', color: 'white' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Name</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Role</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Email</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'center' }}>Total Assigned</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'center' }}>Total Resolved</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'center' }}>Efficiency (Avg Hrs/Issue)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((emp) => (
                            <TableRow key={emp.id}>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>{emp.name}</TableCell>
                                <TableCell>
                                    <Chip label={emp.role.toUpperCase()} color={getRoleColor(emp.role)} size="small" />
                                </TableCell>
                                <TableCell sx={{ color: 'var(--text-muted)' }}>{emp.email}</TableCell>
                                <TableCell sx={{ textAlign: 'center', color: 'white' }}>{emp.total_assigned || 0}</TableCell>
                                <TableCell sx={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>{emp.total_resolved || 0}</TableCell>
                                <TableCell sx={{ textAlign: 'center', color: 'var(--warning)' }}>
                                    {emp.avg_resolution_hours ? parseFloat(emp.avg_resolution_hours).toFixed(1) + ' hrs' : '—'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Employees;
