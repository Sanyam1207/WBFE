import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [role, setRole] = useState("");
  const [roomID, setRoomID] = useState("");
  const [userID, setUserID] = useState("");
  const roleRef = useRef();
  const userIDRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryRole = params.get("role");
    const queryRoomID = params.get("roomID");
    const userID = params.get("userID");

    if (queryRole && queryRoomID) {
      navigate("/whiteboard", {
        state: { role: queryRole, roomID: queryRoomID, userID: userID },
      });
    }
  }, [location, navigate]);

  const handleRedirect = async (e) => {
    e.preventDefault();
    setUserID(userIDRef.current.value);
    setRole(roleRef.current.value);
    const data = { roomID, role, userID };
    navigate("/whiteboard", { state: data });
    console.log("Redirected");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "20px"
    },
    formWrapper: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: "24px",
      padding: "40px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      width: "100%",
      maxWidth: "450px",
      animation: "slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
    },
    heading: {
      textAlign: "center",
      marginBottom: "35px",
      background: "linear-gradient(145deg, #667eea, #764ba2)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontSize: "32px",
      fontWeight: "700",
      letterSpacing: "-0.5px"
    },
    formGroup: {
      marginBottom: "25px",
    },
    label: {
      display: "block",
      marginBottom: "10px",
      fontWeight: "600",
      color: "#333",
      fontSize: "14px",
      letterSpacing: "0.5px"
    },
    input: {
      width: "100%",
      padding: "16px 20px",
      fontSize: "16px",
      borderRadius: "12px",
      border: "2px solid rgba(102, 126, 234, 0.2)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      outline: "none",
      transition: "all 0.3s ease",
      color: "#333"
    },
    select: {
      width: "100%",
      padding: "16px 20px",
      fontSize: "16px",
      borderRadius: "12px",
      border: "2px solid rgba(102, 126, 234, 0.2)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      outline: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
      color: "#333"
    },
    button: {
      width: "100%",
      padding: "18px",
      background: "linear-gradient(145deg, #667eea, #764ba2)",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
      letterSpacing: "0.5px",
      position: "relative",
      overflow: "hidden"
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .form-input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        .gradient-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s;
        }
        .gradient-button:hover::before {
          left: 100%;
        }
        .gradient-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
        }
        .gradient-button:active {
          transform: translateY(0);
        }
        `}
      </style>
      <div style={styles.formWrapper}>
        <h1 style={styles.heading}>Welcome to Whiteboard</h1>
        <form onSubmit={handleRedirect}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Role:</label>
            <select
              ref={roleRef}
              style={styles.select}
              className="form-input"
              onChange={(e) => setRole(e.target.value)}
              value={role}
            >
              <option value="">Select Role</option>
              <option value="teacher">🎓 Teacher</option>
              <option value="student">👨‍🎓 Student</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Room ID:</label>
            <input
              type="text"
              className="form-input"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
              placeholder="Enter Room ID"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>User ID:</label>
            <input
              ref={userIDRef}
              type="text"
              className="form-input"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              placeholder="Enter User ID"
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            style={styles.button}
            className="gradient-button"
          >
            🚀 Join Whiteboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
