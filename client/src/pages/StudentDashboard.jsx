import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const StudentDashboard = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [eventName, setEventName] = useState('');
    const [venue, setVenue] = useState('');
    const [eventDate, setEventDate] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/requests?role=student&user_id=${user.id}`);
            setRequests(res.data.requests);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/requests/create`, {
                student_id: user.id,
                event_name: eventName,
                venue,
                event_date: eventDate
            });
            alert('Request submitted successfully!');
            fetchRequests();
            setEventName('');
            setVenue('');
            setEventDate('');
        } catch (err) {
            alert('Failed to submit request');
        }
    };

    return (
        <div className="dashboard-container">
            <header>
                <h1>Welcome, {user.name} (Student)</h1>
                <button onClick={() => window.location.reload()}>Refresh</button>
            </header>

            <section className="request-form">
                <h3>Submit New Event Request</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Event Name" value={eventName} onChange={e => setEventName(e.target.value)} required />
                    <input type="text" placeholder="Venue" value={venue} onChange={e => setVenue(e.target.value)} required />
                    <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                    <button type="submit">Submit Request</button>
                </form>
            </section>

            <section className="request-list">
                <h3>My Requests</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Venue</th>
                            <th>Date</th>
                            <th>Mentor Approval</th>
                            <th>HOD Approval</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td>{req.event_name}</td>
                                <td>{req.venue}</td>
                                <td>{new Date(req.event_date).toLocaleString()}</td>
                                <td className={req.mentor_status === 'Approved' ? 'status-approved' : 'status-pending'}>
                                    {req.mentor_status} {req.mentor_status === 'Approved' && '✅'}
                                </td>
                                <td className={req.hod_status === 'Approved' ? 'status-approved' : 'status-pending'}>
                                    {req.hod_status} {req.hod_status === 'Approved' && '✅'}
                                </td>
                                <td>{req.status}</td>
                                <td>
                                    {req.status === 'Approved' && (
                                        <button onClick={() => {
                                            const letterWindow = window.open('', 'PRINT', 'height=600,width=800');
                                            letterWindow.document.write(`<html><head><title>Permission Letter</title></head><body>`);
                                            letterWindow.document.write(`<h1>Permission Letter</h1>`);
                                            letterWindow.document.write(`<p>Date: ${new Date().toLocaleDateString()}</p>`);
                                            letterWindow.document.write(`<p>To,</p><p>The HOD,</p><p>Department of ${user.department}</p>`);
                                            letterWindow.document.write(`<p>Subject: Permission to attend ${req.event_name}</p>`);
                                            letterWindow.document.write(`<p>Respected Sir/Madam,</p>`);
                                            letterWindow.document.write(`<p>I, ${user.name}, from ${user.department} department, request permission to attend <b>${req.event_name}</b> at <b>${req.venue}</b> on <b>${new Date(req.event_date).toLocaleString()}</b>.</p>`);
                                            letterWindow.document.write(`<p>This request has been approved by Class Mentor and HOD.</p>`);
                                            letterWindow.document.write(`<br/><p>Sincerely,</p><p>${user.name}</p>`);
                                            letterWindow.document.write(`</body></html>`);
                                            letterWindow.document.close();
                                            letterWindow.focus();
                                            letterWindow.print();
                                        }}>Download Letter</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default StudentDashboard;
