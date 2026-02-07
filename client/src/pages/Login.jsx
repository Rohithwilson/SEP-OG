import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // We will create this

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    // Registration fields
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');
    const [department, setDepartment] = useState('');
    const [mobile, setMobile] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
            setUser(res.data.user);
            if (res.data.user.role === 'student') navigate('/student-dashboard');
            else if (res.data.user.role === 'mentor') navigate('/mentor-dashboard');
            else if (res.data.user.role === 'hod') navigate('/hod-dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
                name, email, password, role, department, mobile
            });
            alert('Registration successful! Please login.');
            setIsRegistering(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isRegistering ? 'Register' : 'Login'} - College Event System</h2>

                {isRegistering ? (
                    <form onSubmit={handleRegister}>
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <select value={role} onChange={e => setRole(e.target.value)}>
                            <option value="student">Student</option>
                            <option value="mentor">Class Mentor</option>
                            <option value="hod">HOD</option>
                        </select>
                        <input type="text" placeholder="Department (e.g. CSE)" value={department} onChange={e => setDepartment(e.target.value)} required />
                        <input type="text" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} required />
                        <button type="submit">Register</button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin}>
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit">Login</button>
                    </form>
                )}

                <p onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                </p>
            </div>
        </div>
    );
};

export default Login;
