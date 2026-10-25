import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function getUserRole(token) {
try {
const payload = JSON.parse(atob(token.split('.')[1]));
return payload.role || 'student';
} catch {
return 'student';
}
}

function Profile() {
const navigate = useNavigate();
const token = localStorage.getItem('access_token');

const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
async function loadProfile() {
if (!token) {
navigate('/login', { replace: true });
return;
}


  try {
    const response = await api.get('/auth/me');
    setProfile(response.data);
  } catch (err) {
    setError(
      err.response?.data?.detail ||
      'Unable to load your profile. Please try logging in again.'
    );
  } finally {
    setLoading(false);
  }
}

loadProfile();


}, [token, navigate]);

const role = token ? getUserRole(token) : 'student';

return ( <div style={styles.page}> <div style={styles.card}>
<button
style={styles.backButton}
onClick={() => navigate('/dashboard')}
>
← Back to Dashboard </button>


    <h1 style={styles.heading}>My Profile</h1>
    <p style={styles.subtitle}>
      View your account information
    </p>

    {loading && <p>Loading your profile...</p>}

    {error && <p style={styles.error}>{error}</p>}

    {!loading && !error && profile && (
      <div style={styles.details}>
        <div style={styles.row}>
          <span style={styles.label}>Username</span>
          <span style={styles.value}>
            {profile.username || 'Not available'}
          </span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>
            {profile.email || 'Not available'}
          </span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Role</span>
          <span style={styles.role}>
            {profile.role || role}
          </span>
        </div>
      </div>
    )}

    {error && (
      <button
        style={styles.loginButton}
        onClick={() => {
          localStorage.removeItem('access_token');
          navigate('/login', { replace: true });
        }}
      >
        Go to Login
      </button>
    )}
  </div>
</div>


);
}

const styles = {
page: {
minHeight: '100vh',
background: '#f3f6fb',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
padding: '24px',
boxSizing: 'border-box',
fontFamily: 'Arial, sans-serif',
},
card: {
background: '#ffffff',
width: '100%',
maxWidth: '520px',
padding: '32px',
borderRadius: '16px',
boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
boxSizing: 'border-box',
},
backButton: {
padding: '10px 14px',
border: '1px solid #d1d5db',
borderRadius: '8px',
background: '#ffffff',
cursor: 'pointer',
marginBottom: '20px',
},
heading: {
margin: '0 0 8px',
color: '#172554',
fontSize: '28px',
},
subtitle: {
color: '#64748b',
marginBottom: '28px',
},
details: {
display: 'flex',
flexDirection: 'column',
gap: '16px',
},
row: {
display: 'flex',
flexDirection: 'column',
gap: '7px',
padding: '15px',
background: '#f8fafc',
borderRadius: '10px',
},
label: {
color: '#64748b',
fontSize: '13px',
fontWeight: 'bold',
textTransform: 'uppercase',
},
value: {
color: '#0f172a',
fontSize: '16px',
overflowWrap: 'anywhere',
},
role: {
display: 'inline-block',
color: '#166534',
background: '#dcfce7',
padding: '6px 12px',
borderRadius: '20px',
fontWeight: 'bold',
textTransform: 'capitalize',
width: 'fit-content',
},
error: {
color: '#b91c1c',
background: '#fee2e2',
padding: '12px',
borderRadius: '8px',
},
loginButton: {
padding: '10px 16px',
background: '#2563eb',
color: '#ffffff',
border: 'none',
borderRadius: '8px',
cursor: 'pointer',
},
};

export default Profile;
