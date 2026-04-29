import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';

const Technicians = () => {
    const [technicians, setTechnicians] = useState([]);

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        try {
            const res = await api.get('/technicians');
            setTechnicians(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Technicians</Typography>
                <Typography variant="body2" color="var(--text-muted)">Manage field technicians and availability.</Typography>
            </Box>

            <TableContainer component={Paper} className="glass-panel" sx={{ background: 'var(--bg-card)', color: 'white' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>ID</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Name</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Phone</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {technicians.map((tech) => (
                            <TableRow key={tech.tech_id}>
                                <TableCell sx={{ color: 'white' }}>#{tech.tech_id}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>{tech.name}</TableCell>
                                <TableCell sx={{ color: 'var(--text-muted)' }}>{tech.phone}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={tech.status.toUpperCase()} 
                                        color={tech.status === 'available' ? 'success' : tech.status === 'busy' ? 'warning' : 'error'} 
                                        size="small" 
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Technicians;
