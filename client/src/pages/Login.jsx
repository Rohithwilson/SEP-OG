import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
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

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const res = await api.post('/auth/login', { email, password });
            setUser(res.data.user);
            if (res.data.user.role === 'student') navigate('/student-dashboard');
            else if (res.data.user.role === 'mentor') navigate('/mentor-dashboard');
            else if (res.data.user.role === 'hod') navigate('/hod-dashboard');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', {
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
            <div className="login-box glass-panel">
                <div className="login-header">
                    <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
                    <p>{isRegistering ? 'Join the College Event System' : 'Sign in to manage your event permissions'}</p>
                </div>

                {errorMsg && <div className="error-message animate-slide-in">{errorMsg}</div>}
                {successMsg && <div className="success-message animate-slide-in">{successMsg}</div>}

                {isRegistering ? (
                    <form onSubmit={handleRegister} className="login-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="john@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select value={role} onChange={e => setRole(e.target.value)}>
                                <option value="student">Student</option>
                                <option value="mentor">Class Mentor</option>
                                <option value="hod">Head of Department (HOD)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input type="text" placeholder="Computer Science" value={department} onChange={e => setDepartment(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input type="text" placeholder="+1 234 567 8900" value={mobile} onChange={e => setMobile(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Register Account</button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Sign In</button>
                    </form>
                )}

                <div className="toggle-form">
                    <p>
                        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                        <span onClick={() => {
                            setIsRegistering(!isRegistering);
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}>
                            {isRegistering ? 'Sign In' : 'Register now'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
