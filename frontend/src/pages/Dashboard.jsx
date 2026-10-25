
import { useNavigate } from 'react-router-dom';

const getUserRole = () => {
  try {
    const token = localStorage.getItem('access_token');

    if (!token) return null;

    const payload = token.split('.')[1];
    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const user = JSON.parse(atob(normalizedPayload));

    return user.role || null;
  } catch {
    return null;
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const role = getUserRole();
  const isAdmin = role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span>🎓</span>
          <h2>StudentHub</h2>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span>📊</span> Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/students')}
          >
            <span>👨‍🎓</span> Students
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/courses')}
          >
            <span>📚</span> Courses
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/profile')}
          >
            <span>👤</span> Profile
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <span>↪</span> Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-eyebrow">
              {isAdmin ? 'ADMIN OVERVIEW' : 'STUDENT OVERVIEW'}
            </p>

            <h1>Dashboard</h1>

            <p className="header-description">
              {isAdmin
                ? 'Manage students and courses from one convenient place.'
                : 'View student records and explore available courses.'}
            </p>
          </div>

          <div className="user-avatar">
            {isAdmin ? 'A' : 'S'}
          </div>
        </header>

        <section className="welcome-banner">
          <div>
            <p className="banner-label">
              {isAdmin ? 'ADMINISTRATOR' : 'STUDENT ACCOUNT'}
            </p>

            <h2>
              {isAdmin ? 'Welcome, Admin! 👋' : 'Welcome, Student! 👋'}
            </h2>

            <p>
              {isAdmin
                ? 'Manage student records and courses using your administrator access.'
                : 'Explore student records and view the courses available to you.'}
            </p>
          </div>

          <div className="banner-icon">🎓</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon students-icon">👨‍🎓</div>

            <p>Students</p>

            <h3>{isAdmin ? 'Manage students' : 'View students'}</h3>

            <button onClick={() => navigate('/students')}>
              View students →
            </button>
          </article>

          <article className="stat-card">
            <div className="stat-icon courses-icon">📚</div>

            <p>Courses</p>

            <h3>{isAdmin ? 'Manage courses' : 'Explore courses'}</h3>

            <button onClick={() => navigate('/courses')}>
              View courses →
            </button>
          </article>

          <article className="stat-card">
            <div className="stat-icon profile-icon">👤</div>

            <p>Your Account</p>

            <h3>Account details</h3>

            <button onClick={() => navigate('/profile')}>
              View profile →
            </button>
          </article>
        </section>

        <section className="quick-actions">
          <h2>{isAdmin ? 'Admin Actions' : 'Quick Links'}</h2>

          <p>
            {isAdmin
              ? 'Choose a section to manage.'
              : 'Choose a section to explore.'}
          </p>

          <div className="actions-grid">
            <button
              className="action-card"
              onClick={() => navigate('/students')}
            >
              <span>👨‍🎓</span>

              <div>
                <strong>
                  {isAdmin ? 'Manage Students' : 'View Students'}
                </strong>

                <small>
                  {isAdmin
                    ? 'Add, view, update, and delete student records.'
                    : 'View available student records.'}
                </small>
              </div>

              <span className="action-arrow">→</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/courses')}
            >
              <span>📖</span>

              <div>
                <strong>
                  {isAdmin ? 'Manage Courses' : 'View Courses'}
                </strong>

                <small>
                  {isAdmin
                    ? 'Add, view, update, and delete courses.'
                    : 'Explore the available courses.'}
                </small>
              </div>

              <span className="action-arrow">→</span>
            </button>
          </div>
        </section>

        <footer className="dashboard-footer">
          StudentHub · Student Management System
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;

