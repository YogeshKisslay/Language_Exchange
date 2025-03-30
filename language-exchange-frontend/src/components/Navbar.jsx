import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../redux/services/authApi';
import { logout } from '../redux/slices/authSlice';
import { io } from 'socket.io-client';

const Navbar = () => {
  const { isAuthenticated, user, callStatus } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      const newSocket = io('http://localhost:5000', { withCredentials: true });
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket:', newSocket.id);
        newSocket.emit('register', user._id);
      });

      newSocket.on('call-request', (data) => {
        console.log('Navbar - Call request:', data);
        setNotifications((prev) => [...prev, { type: 'call-request', data }]);
      });

      newSocket.on('call-cancelled', (data) => {
        console.log('Navbar - Call cancelled:', data);
        setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
      });

      newSocket.on('call-rejected', (data) => {
        console.log('Navbar - Call rejected:', data);
        setNotifications((prev) => prev.filter((n) => n.data.callId !== data.callId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (callStatus?.status === 'pending' && callStatus.caller && callStatus.callerId !== (user?._id || '')) {
      if (!notifications.some(n => n.data.callId === callStatus.callId)) {
        console.log('Navbar - Restoring pending call notification:', callStatus);
        setNotifications((prev) => [...prev, { type: 'call-request', data: callStatus }]);
      }
    } else if (!callStatus) {
      setNotifications([]);
    }
  }, [callStatus, user, notifications]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
  const languagesMissing = !user?.knownLanguages?.length || !user?.learnLanguages?.length;

  return (
    <nav className="navbar navbar-expand-lg shadow-sm"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        padding: "12px 20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand text-dark fw-bold d-flex align-items-center" to="/">
          <img
            src="https://cdn6.f-cdn.com/contestentries/260579/10522671/55c88fabf38d4_thumb900.jpg"
            alt="Language Exchange Logo"
            className="d-inline-block align-text-top"
            style={{ width: "45px", height: "45px", borderRadius: "50%", border: "2px solid #0D2818" }}
          />
          <span className="ms-2" style={{ color: "#D32F2F" }}>FlyLingua</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            {isAuthenticated && user ? (
              <>
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
                    style={{ width: '40px', height: '40px', padding: 0 }}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {avatarLetter}
                    {languagesMissing && (
                      <span
                        className="position-absolute badge bg-danger"
                        style={{
                          top: '30px',
                          left: '20%',
                          transform: 'translateX(-50%)',
                          width: '15px',
                          height: '15px',
                          fontSize: '0.8rem',
                          lineHeight: '12px',
                          borderRadius: '50%',
                          padding: 0,
                          textAlign: 'center',
                          zIndex: 1,
                        }}
                      >
                        !
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-danger fw-bold ms-2 shadow-sm" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
