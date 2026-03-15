import { useState, useEffect } from 'react';
import api from '../api';
import './Dashboard.css';

const MentorDashboard = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [comments, setComments] = useState({});
    const [previewPhoto, setPreviewPhoto] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get(`/requests?role=mentor&user_id=${user.id}`);
            // Client-side filtering if API returns overly broad results, though API logic should handle it
            // Assuming API returns all PENDING mentor approval requests
            setRequests(res.data.requests.filter(r => r.mentor_status === 'Pending'));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, action) => {
        const comment = comments[id] || '';
        try {
            await api.put(`/requests/${id}/status`, {
                role: 'mentor',
                action,
                user_id: user.id,
                comment
            });
            alert(`Request ${action}ed!`);
            fetchRequests();
            // Clear comment after action
            setComments(prev => ({ ...prev, [id]: '' }));
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleCommentChange = (id, value) => {
        setComments(prev => ({ ...prev, [id]: value }));
    };

    const pendingCount = requests.filter(r => r.mentor_status === 'Pending').length;
    const actionedCount = requests.length - pendingCount;

    return (
        <div className="dashboard-container container">
            <header className="dashboard-header">
                <div>
                    <h2>Mentor Portal</h2>
                    <p className="welcome-text">Review event permissions for {user.department} students</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchRequests}>
                    🔄 Refresh
                </button>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-total">📋</div>
                    <div className="stat-details">
                        <h3>Total assigned</h3>
                        <p>{requests.length}</p>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-pending">⏳</div>
                    <div className="stat-details">
                        <h3>Needs Review</h3>
                        <p>{pendingCount}</p>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon icon-approved">✅</div>
                    <div className="stat-details">
                        <h3>Actioned</h3>
                        <p>{actionedCount}</p>
                    </div>
                </div>
            </div>

            <section className="requests-list">
                <h3 style={{ marginBottom: '1.5rem' }}>Student Requests</h3>
                
                {requests.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                        <h3>All caught up!</h3>
                        <p>There are no pending requests for your department right now.</p>
                    </div>
                ) : (
                    requests.map(req => {
                        let statusClass = 'pending';
                        if (req.mentor_status === 'Approved') statusClass = 'approved';
                        if (req.mentor_status === 'Rejected') statusClass = 'rejected';

                        return (
                            <div key={req.id} className={`request-card glass-panel ${statusClass}`}>
                                <div className="request-info">
                                    <div className="request-header">
                                        <h3 className="request-title">{req.event_name}</h3>
                                        <span className={`status-badge status-${statusClass}`}>
                                            Mentor: {req.mentor_status}
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
                                        <div className="student-avatar">{(req.student_name || 'U').charAt(0)}</div>
                                        <div style={{ flex: 1 }}>
                                            <strong>{req.student_name || 'Unknown Student'}</strong>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Department: {req.department}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="request-actions glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: 'none' }}>
                                    {req.mentor_status === 'Pending' ? (
                                        <>
                                            <textarea
                                                placeholder="Add comment (required for rejection)"
                                                value={comments[req.id] || ''}
                                                onChange={(e) => handleCommentChange(req.id, e.target.value)}
                                                rows="2"
                                                style={{ width: '100%', fontSize: '0.875rem', marginBottom: '0.75rem', padding: '0.5rem' }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                                <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleAction(req.id, 'Approve')}>
                                                    ✅ Approve
                                                </button>
                                                <button className="btn btn-danger" style={{ flex: 1, padding: '0.5rem' }} onClick={() => {
                                                    if (!comments[req.id]) {
                                                        alert("Please provide a reason for rejection");
                                                        return;
                                                    }
                                                    handleAction(req.id, 'Reject');
                                                }}>
                                                    ❌ Reject
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', opacity: 0.8 }}>
                                            <div>Action taken: <strong>{req.mentor_status}</strong></div>
                                            {req.mentor_comment && <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"{req.mentor_comment}"</div>}
                                            <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem', padding: '0.25rem' }} onClick={() => handleAction(req.id, req.mentor_status === 'Approved' ? 'Reject' : 'Approve')}>
                                                Change Decision
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </section>

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

export default MentorDashboard;
