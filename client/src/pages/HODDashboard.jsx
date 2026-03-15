import { useState, useEffect } from 'react';
import api from '../api';
import './Dashboard.css';

const HODDashboard = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [comments, setComments] = useState({});
    const [previewPhoto, setPreviewPhoto] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get(`/requests?role=hod&user_id=${user.id}`);
            // Filter for only those needing HOD approval (Mentor Approved, HOD Pending)
            setRequests(res.data.requests.filter(r => r.mentor_status === 'Approved' && r.hod_status === 'Pending'));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, action) => {
        const comment = comments[id] || '';
        try {
            await api.put(`/requests/${id}/status`, {
                role: 'hod',
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

    const pendingCount = requests.filter(r => r.hod_status === 'Pending').length;
    const actionedCount = requests.length - pendingCount;

    return (
        <div className="dashboard-container container">
            <header className="dashboard-header">
                <div>
                    <h2>HOD Portal</h2>
                    <p className="welcome-text">Final Approval Authority for {user.department}</p>
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
                        <h3>Needs Final Review</h3>
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
                <h3 style={{ marginBottom: '1.5rem' }}>Requests Awaiting Final Approval</h3>
                
                {requests.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                        <h3>All caught up!</h3>
                        <p>There are no pending requests for final approval right now.</p>
                    </div>
                ) : (
                    requests.map(req => {
                        let statusClass = 'pending';
                        if (req.hod_status === 'Approved') statusClass = 'approved';
                        if (req.hod_status === 'Rejected') statusClass = 'rejected';

                        return (
                            <div key={req.id} className={`request-card glass-panel ${statusClass}`}>
                                <div className="request-info">
                                    <div className="request-header">
                                        <h3 className="request-title">{req.event_name}</h3>
                                        <span className={`status-badge status-${statusClass}`}>
                                            HOD: {req.hod_status}
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
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{req.student_name || 'Unknown Student'}</strong>
                                            </div>
                                            <div className="status-badge status-approved" style={{ fontSize: '0.7rem' }}>
                                                Mentor Approved ✅
                                            </div>
                                        </div>
                                    </div>
                                    {req.mentor_comment && (
                                        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                            <strong>Mentor Note:</strong> <i>"{req.mentor_comment}"</i>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="request-actions glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: 'none' }}>
                                    {req.hod_status === 'Pending' ? (
                                        <>
                                            <textarea
                                                placeholder="Add final comment (optional)"
                                                value={comments[req.id] || ''}
                                                onChange={(e) => handleCommentChange(req.id, e.target.value)}
                                                rows="2"
                                                style={{ width: '100%', fontSize: '0.875rem', marginBottom: '0.75rem', padding: '0.5rem' }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                                <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleAction(req.id, 'Approve')}>
                                                    ✅ Final Approve
                                                </button>
                                                <button className="btn btn-danger" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleAction(req.id, 'Reject')}>
                                                    ❌ Reject
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', opacity: 0.8 }}>
                                            <div>Final Decision: <strong>{req.hod_status}</strong></div>
                                            {req.hod_comment && <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"{req.hod_comment}"</div>}
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

export default HODDashboard;
