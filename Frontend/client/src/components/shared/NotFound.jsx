import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a', 
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    glassCard: {
      padding: '4rem 6rem',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    heading: {
      fontSize: '6rem',
      margin: '0',
      background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0px 0px 24px rgba(0, 242, 254, 0.3)', 
    },
    text: {
      fontSize: '1.2rem',
      margin: '0',
      color: '#a1a1aa',
    },
    button: {
      padding: '12px 28px',
      fontSize: '1rem',
      color: '#00f2fe',
      background: 'rgba(0, 242, 254, 0.05)',
      border: '1px solid rgba(0, 242, 254, 0.3)',
      borderRadius: '8px',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'all 0.2s ease-in-out',
      boxShadow: '0 0 15px rgba(0, 242, 254, 0.1)',
      alignSelf: 'center',
      marginTop: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h1 style={styles.heading}>404</h1>
        <p style={styles.text}>The page you're looking for doesn't exist.</p>
        <Link to="/home" style={styles.button}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;