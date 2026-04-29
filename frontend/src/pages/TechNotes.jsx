import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Typography, Box, TextField, Button, Modal, IconButton, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';

const modalSx = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    width: { xs: '90%', sm: 540 },
    background: 'rgba(8,16,32,0.98)', backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
    p: 4, borderRadius: 4,
};

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        color: 'white', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--text-muted)' },
};

const NoteCard = ({ note, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(note.content);
    const [editTitle, setEditTitle] = useState(note.title);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/notes/${note.note_id}`, { title: editTitle, content: editContent });
            onEdit({ ...note, title: editTitle, content: editContent });
            setIsEditing(false);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    return (
        <Box sx={{
            background: 'var(--bg-card)', borderRadius: 3,
            border: '1px solid var(--border)', borderTop: '3px solid #818cf8',
            p: 2.5, transition: 'all 0.2s ease',
            '&:hover': { boxShadow: '0 8px 30px rgba(129,140,248,0.12)', transform: 'translateY(-2px)' }
        }}>
            {/* Header row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                {isEditing ? (
                    <TextField value={editTitle} onChange={e => setEditTitle(e.target.value)} size="small" fullWidth
                        sx={{ ...fieldSx, mr: 1 }} label="Title" />
                ) : (
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', flex: 1 }}>{note.title}</Typography>
                )}
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
                    {isEditing ? (
                        <>
                            <IconButton size="small" onClick={handleSave} disabled={saving}
                                sx={{ color: 'var(--success)', '&:hover': { background: 'rgba(16,185,129,0.1)' } }}>
                                <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setIsEditing(false)}
                                sx={{ color: 'var(--text-muted)', '&:hover': { background: 'rgba(255,255,255,0.06)' } }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            <IconButton size="small" onClick={() => setIsEditing(true)}
                                sx={{ color: 'var(--text-muted)', '&:hover': { color: '#818cf8', background: 'rgba(129,140,248,0.1)' } }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => onDelete(note.note_id)}
                                sx={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--danger)', background: 'rgba(239,68,68,0.1)' } }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </>
                    )}
                </Box>
            </Box>

            {/* Linked issue badge */}
            {note.issue_id && (
                <Box sx={{ mb: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip icon={<LinkIcon sx={{ fontSize: '13px !important' }} />}
                        label={`Issue #${note.issue_id}${note.product_name ? ` — ${note.product_name}` : ''}${note.location ? ` @ ${note.location}` : ''}`}
                        size="small"
                        sx={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)', fontSize: '0.65rem', fontWeight: 600 }}
                    />
                </Box>
            )}

            {/* Content */}
            {isEditing ? (
                <TextField value={editContent} onChange={e => setEditContent(e.target.value)}
                    multiline rows={5} fullWidth
                    sx={{ ...fieldSx, '& .MuiOutlinedInput-root textarea': { color: 'white' } }}
                    label="Note content"
                />
            ) : (
                <Typography variant="body2" sx={{ color: 'var(--text-dim)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {note.content}
                </Typography>
            )}

            {/* Timestamp */}
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#334155', fontSize: '0.68rem' }}>
                {new Date(note.updated_at || note.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
        </Box>
    );
};

const TechNotes = () => {
    const [notes, setNotes] = useState([]);
    const [history, setHistory] = useState([]);
    const [open, setOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [linkedIssue, setLinkedIssue] = useState('');
    const [search, setSearch] = useState('');

    const fetchNotes = async () => {
        try {
            const [nr, hr] = await Promise.all([api.get('/notes'), api.get('/notes/history')]);
            setNotes(nr.data);
            setHistory(hr.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchNotes(); }, []);

    const handleCreate = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        try {
            await api.post('/notes', { title: newTitle, content: newContent, issue_id: linkedIssue || null });
            setOpen(false); setNewTitle(''); setNewContent(''); setLinkedIssue('');
            fetchNotes();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        try { await api.delete(`/notes/${id}`); fetchNotes(); }
        catch (e) { console.error(e); }
    };

    const handleEdit = (updated) => {
        setNotes(prev => prev.map(n => n.note_id === updated.note_id ? updated : n));
    };

    const filtered = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <NoteAltIcon sx={{ color: '#818cf8', fontSize: 28 }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>My Notes</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Personal notes for issues you've resolved. Useful for your own reference.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}
                    sx={{ borderRadius: '10px', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 15px rgba(124,58,237,0.35)', '&:hover': { boxShadow: '0 6px 20px rgba(124,58,237,0.5)' } }}>
                    New Note
                </Button>
            </Box>

            {/* Search */}
            <TextField fullWidth placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)}
                sx={{ mb: 3, ...fieldSx }} size="small" />

            {/* Notes grid */}
            {filtered.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3 }}>
                    <NoteAltIcon sx={{ fontSize: 56, color: '#818cf8', opacity: 0.2, mb: 2 }} />
                    <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {search ? 'No notes match your search.' : 'No notes yet. Click "New Note" to create your first one!'}
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3 }}>
                    {filtered.map((note, idx) => (
                        <Box key={note.note_id} sx={{ animation: `fadeUp 0.2s ease ${idx * 0.05}s both`, '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                            <NoteCard note={note} onEdit={handleEdit} onDelete={handleDelete} />
                        </Box>
                    ))}
                </Box>
            )}

            {/* New Note Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <NoteAltIcon sx={{ color: '#818cf8', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Create New Note</Typography>
                    </Box>

                    <TextField fullWidth label="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        sx={{ ...fieldSx, mb: 2 }} placeholder="e.g. Power surge fix — Dmart Fridge B" />

                    <TextField fullWidth multiline rows={6} label="Note Content"
                        value={newContent} onChange={e => setNewContent(e.target.value)}
                        placeholder="Write your resolution notes, observations, or tips here..."
                        sx={{ ...fieldSx, mb: 2, '& .MuiOutlinedInput-root textarea': { color: 'white' } }}
                    />

                    {/* Link to a resolved issue (optional) */}
                    {history.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 3, ...fieldSx }}>
                            <InputLabel>Link to a resolved issue (optional)</InputLabel>
                            <Select value={linkedIssue} label="Link to a resolved issue (optional)"
                                onChange={e => setLinkedIssue(e.target.value)}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {history.map(i => (
                                    <MenuItem key={i.issue_id} value={i.issue_id}>
                                        <Box>
                                            <span style={{ fontWeight: 600 }}>#{i.issue_id} — {i.product_name || i.asset_id}</span>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 8 }}>@ {i.location}</span>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button fullWidth variant="outlined" onClick={() => setOpen(false)}
                            sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-muted)' }}>Cancel</Button>
                        <Button fullWidth variant="contained" disabled={!newTitle.trim() || !newContent.trim()} onClick={handleCreate}
                            sx={{ borderRadius: '10px', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }}>
                            Save Note
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default TechNotes;
