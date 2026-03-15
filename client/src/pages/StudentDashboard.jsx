import { useState, useEffect } from 'react';
import api from '../api';
import './Dashboard.css';

const StudentDashboard = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [eventName, setEventName] = useState('');
    const [venue, setVenue] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [category, setCategory] = useState('General');
    const [photo, setPhoto] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    
    // UI state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        let filtered = requests;
        
        if (searchTerm) {
            filtered = filtered.filter(req => 
                (req.event_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (req.venue || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterCategory !== 'All') {
            filtered = filtered.filter(req => req.category === filterCategory);
        }
        
        setFilteredRequests(filtered);
    }, [requests, searchTerm, filterCategory]);

    const fetchRequests = async () => {
        try {
            const res = await api.get(`/requests?role=student&user_id=${user.id}`);
            setRequests(res.data.requests);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('student_id', user.id);
        formData.append('event_name', eventName);
        formData.append('venue', venue);
        formData.append('event_date', eventDate);
        formData.append('category', category);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            await api.post('/requests/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Request submitted successfully!');
            fetchRequests();
            setEventName('');
            setVenue('');
            setEventDate('');
            setCategory('General');
            setPhoto(null);
            // Reset the file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            setIsFormOpen(false); // Close modal on success
        } catch (err) {
            console.error('submit error', err);
            const msg = err.response?.data?.error || err.message || 'Failed to submit request';
            alert(msg);
            console.error('Request submission error:', err);
        }
    };

    const stats = {
        total: requests.length,
        approved: requests.filter(r => r.status === 'Approved').length,
        pending: requests.filter(r => (r.status || '').includes('Pending')).length,
        rejected: requests.filter(r => r.status === 'Rejected').length
    };

    return (
        <div className="dashboard-container container">
            <header className="dashboard-header">
                <div>
                    <h2>Student Portal</h2>
                    <p className="welcome-text">Manage your event permissions, {user.name.split(' ')[0]}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                    + New Request
                </button>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-total">📊</div>
                    <div className="stat-details">
                        <h3>Total Requests</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-pending">⏳</div>
                    <div className="stat-details">
                        <h3>Pending</h3>
                        <p>{stats.pending}</p>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-approved">✅</div>
                    <div className="stat-details">
                        <h3>Approved</h3>
                        <p>{stats.approved}</p>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-rejected">❌</div>
                    <div className="stat-details">
                        <h3>Rejected</h3>
                        <p>{stats.rejected}</p>
                    </div>
                </div>
            </div>

            <section className="actions-section config-section glass-panel" style={{ padding: '1rem', marginBottom: '2rem' }}>
                <div className="filter-group">
                    {['All', 'General', 'Academic', 'Cultural', 'Sports', 'Technical'].map(cat => (
                        <button 
                            key={cat}
                            className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                            onClick={() => setFilterCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="input-wrapper">
                    <input 
                        type="text" 
                        placeholder="Search events or venues..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '250px', margin: 0 }}
                    />
                </div>
            </section>

            <section className="requests-list">
                {filteredRequests.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                        <h3>No requests found</h3>
                        <p>You haven't submitted any requests matching these filters.</p>
                    </div>
                ) : (
                    filteredRequests.map(req => {
                        let statusClass = 'pending';
                        if (req.status === 'Approved') statusClass = 'approved';
                        if (req.status === 'Rejected') statusClass = 'rejected';

                        return (
                            <div key={req.id} className={`request-card glass-panel ${statusClass}`}>
                                <div className="request-info">
                                    <div className="request-header">
                                        <h3 className="request-title">{req.event_name}</h3>
                                        <span className={`status-badge status-${statusClass}`}>
                                            {req.status}
                                        </span>
                                        <span className="status-badge" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)' }}>
                                            {req.category || 'General'}
                                        </span>
                                    </div>
                                    <div className="request-meta">
                                        <span className="meta-item">📍 {req.venue}</span>
                                        <span className="meta-item">📅 {new Date(req.event_date).toLocaleString()}</span>
                                    </div>
                                    {req.photo_path && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <img 
                                                src={`http://localhost:5001/uploads/${req.photo_path}`} 
                                                alt="Event Evidence" 
                                                style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'transform 0.2s' }}
                                                onClick={() => setPreviewPhoto(req.photo_path)}
                                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                title="Click to zoom"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="request-student">
                                        <div className="student-avatar">M</div>
                                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                                            <div>
                                                <strong>Mentor:</strong> {req.mentor_status} {req.mentor_status === 'Approved' ? '✅' : ''}
                                                {req.mentor_comment && <div style={{ opacity: 0.8, fontSize: '0.8rem', marginTop: '0.2rem' }}>"{req.mentor_comment}"</div>}
                                            </div>
                                            <div>
                                                <strong>HOD:</strong> {req.hod_status} {req.hod_status === 'Approved' ? '✅' : ''}
                                                {req.hod_comment && <div style={{ opacity: 0.8, fontSize: '0.8rem', marginTop: '0.2rem' }}>"{req.hod_comment}"</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="request-actions">
                                    {req.status === 'Approved' && (
                                        <button className="btn btn-secondary" onClick={() => {
                                            const letterWindow = window.open('', 'PRINT', 'height=600,width=800');
                                            letterWindow.document.write(`<html><head><title>Permission Letter</title><style>body{font-family:sans-serif;padding:2rem;} h1{text-align:center;color:#4f46e5;}</style></head><body>`);
                                            letterWindow.document.write(`<h1>Official Permission Letter</h1>`);
                                            letterWindow.document.write(`<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>`);
                                            letterWindow.document.write(`<p><strong>To,</strong><br/>The Head of Department,<br/>Department of ${user.department}</p>`);
                                            letterWindow.document.write(`<h3>Subject: Permission to attend ${req.event_name}</h3>`);
                                            letterWindow.document.write(`<p>Respected Sir/Madam,</p>`);
                                            letterWindow.document.write(`<p>This is to certify that <strong>${user.name}</strong> from the <strong>${user.department}</strong> department, has been officially granted permission to attend <strong>${req.event_name}</strong> at <strong>${req.venue}</strong> on <strong>${new Date(req.event_date).toLocaleString()}</strong>.</p>`);
                                            if (req.photo_path) {
                                                letterWindow.document.write(`<div style="text-align:center;margin:2rem 0;"><img src="http://localhost:5001/uploads/${req.photo_path}" style="max-height:200px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);" /></div>`);
                                            }
                                            letterWindow.document.write(`<p><em>* This request has been successfully approved by the Class Mentor and HOD in the College Event System. No further physical signature is strictly required.</em></p>`);
                                            letterWindow.document.write(`<br/><br/><p>Generated automatically via College Event Platform.</p>`);
                                            letterWindow.document.write(`</body></html>`);
                                            letterWindow.document.close();
                                            letterWindow.focus();
                                            setTimeout(() => letterWindow.print(), 500);
                                        }}>
                                            📄 Download Letter
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </section>

            {/* Create Request Modal */}
            {isFormOpen && (
                <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setIsFormOpen(false)}>×</button>
                        <h2 className="modal-title">Submit New Event Request</h2>
                        <form onSubmit={handleSubmit} className="create-request-form">
                            <div className="form-group">
                                <label>Event Name</label>
                                <input type="text" placeholder="Tech Symposium 2026" value={eventName} onChange={e => setEventName(e.target.value)} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)}>
                                        <option value="General">General</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Technical">Technical</option>
                                        <option value="Social">Social</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Venue / Location</label>
                                <input type="text" placeholder="Main Auditorium" value={venue} onChange={e => setVenue(e.target.value)} required />
                            </div>
                            
                            <div className="form-group">
                                <label>Supporting Document / Image</label>
                                <div 
                                    className="file-upload-wrapper"
                                    onClick={() => document.getElementById('photo-upload').click()}
                                >
                                    <div className="file-upload-icon">📁</div>
                                    <p>{photo ? photo.name : 'Click or drag file to upload'}</p>
                                    <input 
                                        id="photo-upload"
                                        type="file" 
                                        accept="image/*" 
                                        onChange={e => setPhoto(e.target.files[0])} 
                                    />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, border: '1px solid var(--glass-border)' }} onClick={() => setIsFormOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Photo Preview Modal */}
            {previewPhoto && (
                <div className="modal-overlay" onClick={() => setPreviewPhoto(null)}>
                    <div className="modal-content" style={{ padding: '0.5rem', maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                        <button className="modal-close" style={{ top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewPhoto(null)}>×</button>
                        <img 
                            src={`http://localhost:5001/uploads/${previewPhoto}`} 
                            alt="Event Proof" 
                            style={{ width: '100%', height: 'auto', borderRadius: 'calc(var(--radius-xl) - 0.5rem)' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
