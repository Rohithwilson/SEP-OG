import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const MentorDashboard = ({ user }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/requests?role=mentor&user_id=${user.id}`);
            // Client-side filtering if API returns overly broad results, though API logic should handle it
            // Assuming API returns all PENDING mentor approval requests
            setRequests(res.data.requests.filter(r => r.mentor_status === 'Pending'));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await axios.put(`http://localhost:5000/api/requests/${id}/status`, {
                role: 'mentor',
                action,
                user_id: user.id
            });
            alert(`Request ${action}ed!`);
            fetchRequests();
        } catch (err) {
            alert('Action failed');
        }
    };

    return (
        <div className="dashboard-container">
            <header>
                <h1>Welcome, {user.name} (Mentor)</h1>
                <button onClick={fetchRequests}>Refresh Requests</button>
            </header>

            <section className="request-list">
                <h3>Pending Requests</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Department</th>
                            <th>Event</th>
                            <th>Venue</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="6">No pending requests</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req.id}>
                                    <td>{req.student_name}</td>
                                    <td>{req.department}</td>
                                    <td>{req.event_name}</td>
                                    <td>{req.venue}</td>
                                    <td>{new Date(req.event_date).toLocaleString()}</td>
                                    <td>
                                        <button className="btn-approve" onClick={() => handleAction(req.id, 'Approve')}>Approve ✅</button>
                                        <button className="btn-reject" onClick={() => handleAction(req.id, 'Reject')}>Reject ❌</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default MentorDashboard;
