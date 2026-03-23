
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';

//Employees Component - dummy data used initially
const Employees = () => {
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Vikash Rao', role: 'manager', email: 'vikash135@gmail.com', total_assigned: 24, total_resolved: 22, avg_resolution_hours: 4.2 },
        { id: 2, name: 'Sunil Agarwal', role: 'technician', email: 's.agarwal121@yahoo.com', total_assigned: 45, total_resolved: 41, avg_resolution_hours: 3.8 },
        { id: 3, name: 'Rabi Gupta', role: 'technician', email: 'rabigupta@gmail.com', total_assigned: 38, total_resolved: 35, avg_resolution_hours: 4.3 },
        { id: 4, name: 'Arjun Mahato', role: 'admin', email: 'arjun123@gmail.com', total_assigned: 12, total_resolved: 12, avg_resolution_hours: 4.5 },
    ]);
//API call
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
//Set role color for each employee(admin - red, manager - purple, technician - blue)
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'manager': return 'secondary';
            case 'technician': return 'primary';
            default: return 'default';
        }
    };
//Design
    return (
        <div>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Employee Performance</Typography>
                <Typography variant="body2" color="var(--text-muted)">Track issues resolved and efficiency metrics for managers and technicians.</Typography>
            </Box>
            <TableContainer component={Paper} className="glass-panel" sx={{ background: 'var(--bg-card)', color: 'white' }}> {/*table container*/}
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
                            <TableRow key={emp.id}>{/*table row*/}
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>{emp.name}</TableCell>
                                <TableCell>
                                    <Chip label={emp.role.toUpperCase()} color={getRoleColor(emp.role)} size="small" />
                                </TableCell>
                                <TableCell sx={{ color: 'var(--text-muted)' }}>{emp.email}</TableCell>
                                <TableCell sx={{ textAlign: 'center', color: 'white' }}>{emp.total_assigned || 0}</TableCell>
                                <TableCell sx={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>{emp.total_resolved || 0}</TableCell>{/*If value null show 0*/}
                                <TableCell sx={{ textAlign: 'center', color: 'var(--warning)' }}>
                                    {emp.avg_resolution_hours ? parseFloat(emp.avg_resolution_hours).toFixed(1) + ' hrs' : '—'}{/*Convert to number, add hrs*/}
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
