import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Profile() {
const navigate = useNavigate();

const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
async function fetchProfile() {
try {
const response = await api.get('/auth/me');
setProfile(response.data);
} catch (err) {
if (err.response?.status === 401) {
localStorage.removeItem('access_token');
navigate('/login', { replace: true });
return;
}


    setError(
      err.response?.data?.detail ||
      'Unable to load profile information.'
    );
  } finally {
    setLoading(false);
  }
}

if (!localStorage.getItem('access_token')) {
  navigate('/login', { replace: true });
  return;
}

fetchProfile();


}, [navigate]);

return ( <div style={styles.page}> <div style={styles.card}>
<button
onClick={() => navigate('/dashboard')}
style={styles.backButton}
>
← Back to Dashboard </button>


    <h1 style={styles.heading}>My Profile</h1>
    <p style={styles.subtitle}>
      View your account information
    </p>

    {loading && <p>Loading profile...</p>}

    {error && <p style={styles.error}>{error}</p>}

    {!loading && !error && profile && (
      <div>
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
            {profile.role || 'Not available'}
          </span>
        </div>
      </div>
    )}
  </div>
</div>


);
}

const styles = {
page: {
minHeight: '100vh',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
padding: '24px',
background: '#f1f5f9',
fontFamily: 'Arial, sans-serif',
boxSizing: 'border-box',
},
card: {
width: '100%',
maxWidth: '520px',
padding: '32px',
background: '#ffffff',
borderRadius: '16px',
boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
boxSizing: 'border-box',
},
heading: {
color: '#1e293b',
marginBottom: '8px',
},
subtitle: {
color: '#64748b',
marginBottom: '24px',
},
backButton: {
padding: '10px 14px',
marginBottom: '20px',
border: '1px solid #cbd5e1',
borderRadius: '8px',
background: '#ffffff',
cursor: 'pointer',
},
row: {
display: 'flex',
flexDirection: 'column',
gap: '8px',
padding: '16px',
marginBottom: '12px',
background: '#f8fafc',
borderRadius: '10px',
overflowWrap: 'anywhere',
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
},
role: {
display: 'inline-block',
width: 'fit-content',
padding: '6px 12px',
color: '#166534',
background: '#dcfce7',
borderRadius: '20px',
textTransform: 'capitalize',
fontWeight: 'bold',
},
error: {
padding: '12px',
color: '#991b1b',
background: '#fee2e2',
borderRadius: '8px',
overflowWrap: 'anywhere',
},
};

export default Profile;
