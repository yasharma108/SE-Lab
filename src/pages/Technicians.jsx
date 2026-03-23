import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';

//dummy technician data
const Technicians = () => {
    const [technicians, setTechnicians] = useState([
        { tech_id: 101, name: 'Kishor Ray', phone: '+91 9988776232', status: 'available' },
        { tech_id: 102, name: 'Paritosh Verma', phone: '+91 8262423212', status: 'busy' },
        { tech_id: 103, name: 'Vikram Singh', phone: '+91 8312842211', status: 'available' },
        { tech_id: 104, name: 'Venkatesh Iyer', phone: '+91 7838761231', status: 'on-leave' },
    ]);
//Runs on load
    useEffect(() => {
        fetchTechnicians();
    }, []);
//fetch function
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

            <TableContainer component={Paper} className="glass-panel" sx={{ background: 'var(--bg-card)', color: 'white' }}>{/*table container*/}
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
                        {/*technician data - loop through all technicians*/}
                        {technicians.map((tech) => (
                            <TableRow key={tech.tech_id}>
                                <TableCell sx={{ color: 'white' }}>#{tech.tech_id}</TableCell> {/*e.g #101*/}
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>{tech.name}</TableCell>
                                <TableCell sx={{ color: 'var(--text-muted)' }}>{tech.phone}</TableCell>
                                <TableCell>
                                    {/*status indicator*/}
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
