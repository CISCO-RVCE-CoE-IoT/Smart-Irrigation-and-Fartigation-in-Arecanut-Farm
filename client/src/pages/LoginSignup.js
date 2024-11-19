import React, { useEffect, useState } from 'react';
import './User/CSS/User.css';
import 'boxicons/css/boxicons.min.css';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
  const [isActive, setIsActive] = useState(false);
  const [isAuthorized, setAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();

  const handleUserLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: username, password, type: 'user' })
      });
  
      if (!response.ok) {
          const errorText = await response.text(); // Read raw response text
          console.error('Server Error:', errorText);
          throw new Error(errorText);
      }
  
      const data = await response.json();
      console.log(data);
      setAuthorized(true);
      navigate(`/farmer/${data.userId}`);
  } catch (error) {
      console.error('Error during login:', error.message);
  }
  
  };
  
  const handleAdminLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/admin/login', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: adminUsername, password: adminPassword, type: 'admin' })
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setAuthorized(true);
        // Redirect or handle admin login as needed
      } else {
        const errorMsg = await response.json();
        alert(errorMsg.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('Error during admin login:', error);
    }
  };
  
  return (
    <div className='bodyLogin'>
      <div className={`containeradmin ${isActive ? 'active' : ''}`}>
        {/* User Login Form */}
        <div className="form-box login">
          <form onSubmit={handleUserLogin}>
            <h1>Login as User</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="forgot-link">
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="BTN">
              Login
            </button>
          </form>
        </div>

        {/* Admin Login Form */}
        <div className="form-box register">
          <form onSubmit={handleAdminLogin}>
            <h1>Login as Admin</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Email or ID"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
              />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <button type="submit" className="BTN">
              Login
            </button>
          </form>
        </div>

        {/* Toggle Panels */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Smart Agriculture</h1>
            <p></p>
            <button
              className="BTN register-BTN"
              onClick={() => setIsActive(true)}
            >
              Admin
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Smart Agriculture</h1>
            <p></p>
            <button
              className="BTN login-BTN"
              onClick={() => setIsActive(false)}
            >
              User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
