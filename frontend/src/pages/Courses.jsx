
import { useEffect, useState } from 'react';
import api from '../services/api';
import './Courses.css';

const emptyForm = {
  title: '',
  course_code: '',
  department: '',
  instructor: '',
  duration: '',
  fee: '',
  description: '',
};

// Read the role from the JWT stored after login.
const getUserRole = () => {
  try {
    const token = localStorage.getItem('access_token');

    if (!token) return null;

    const payload = token.split('.')[1];
    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const decodedPayload = atob(normalizedPayload);
    const user = JSON.parse(decodedPayload);

    return user.role || null;
  } catch {
    return null;
  }
};

function Courses() {
  const isAdmin = getUserRole() === 'admin';

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadCourses = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/courses');
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load courses. Check that the API Gateway and Course Service are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    setError('');
    setMessage('');
    setSaving(true);

    const courseData = {
      ...form,
      fee: Number(form.fee),
    };

    try {
      if (editingId !== null) {
        await api.put(`/courses/${editingId}`, courseData);
        setMessage('Course updated successfully.');
      } else {
        await api.post('/courses', courseData);
        setMessage('Course created successfully.');
      }

      resetForm();
      await loadCourses();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to save the course. Please check your input and backend services.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course) => {
    if (!isAdmin) return;

    setEditingId(course.id);

    setForm({
      title: course.title ?? '',
      course_code: course.course_code ?? '',
      department: course.department ?? '',
      instructor: course.instructor ?? '',
      duration: course.duration ?? '',
      fee: String(course.fee ?? ''),
      description: course.description ?? '',
    });

    setError('');
    setMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (course) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"?`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/courses/${course.id}`);
      setMessage('Course deleted successfully.');

      if (editingId === course.id) {
        resetForm();
      }

      await loadCourses();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to delete this course.'
      );
    }
  };

  return (
    <div className="courses-page">
      
<header className="courses-header">
  <div>
    <button
      type="button"
      className="back-button"
      onClick={() => (window.location.href = '/dashboard')}
      style={{
        marginBottom: '16px',
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        background: '#ffffff',
        cursor: 'pointer',
      }}
    >
      ← Back to Dashboard
    </button>

    <p className="courses-eyebrow">STUDENT MANAGEMENT SYSTEM</p>
    <h1>Course Management</h1>



          <p className="courses-subtitle">
            {isAdmin
              ? 'Create, view, update, and delete courses.'
              : 'View available courses.'}
          </p>
        </div>

        <button
          type="button"
          className="courses-refresh-button"
          onClick={loadCourses}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </header>

      <section className="courses-summary">
        <div>
          <span className="courses-summary-icon">📚</span>

          <div>
            <p>Total Courses</p>
            <h2>{courses.length}</h2>
          </div>
        </div>
      </section>

      {message && (
        <div className="courses-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="courses-error" role="alert">
          {String(error)}
        </div>
      )}

      {isAdmin && (
        <section className="courses-form-card">
          <h2>
            {editingId !== null ? '✏️ Edit Course' : '➕ Add New Course'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="courses-form-grid">
              <label>
                Course Title *
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Python Programming"
                  required
                />
              </label>

              <label>
                Course Code *
                <input
                  type="text"
                  name="course_code"
                  value={form.course_code}
                  onChange={handleChange}
                  placeholder="e.g. CS101"
                  required
                />
              </label>

              <label>
                Department *
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  required
                />
              </label>

              <label>
                Instructor *
                <input
                  type="text"
                  name="instructor"
                  value={form.instructor}
                  onChange={handleChange}
                  placeholder="Instructor name"
                  required
                />
              </label>

              <label>
                Duration *
                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 months"
                  required
                />
              </label>

              <label>
                Fee *
                <input
                  type="number"
                  name="fee"
                  value={form.fee}
                  onChange={handleChange}
                  placeholder="Enter course fee"
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label className="courses-description-field">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the course (optional)"
                  rows="3"
                />
              </label>
            </div>

            <div className="courses-form-actions">
              <button
                type="submit"
                className="courses-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Update Course'
                    : 'Add Course'}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="courses-secondary-button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="courses-table-card">
        <div className="courses-table-heading">
          <div>
            <h2>All Courses</h2>
            <p>
              {isAdmin
                ? 'Manage your available courses below.'
                : 'Browse the available courses below.'}
            </p>
          </div>

          <span className="courses-count">
            {courses.length} courses
          </span>
        </div>

        {loading ? (
          <p className="courses-empty">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="courses-empty">
            {isAdmin
              ? 'No courses found. Add your first course using the form above.'
              : 'No courses are currently available.'}
          </p>
        ) : (
          <div className="courses-table-wrapper">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Instructor</th>
                  <th>Duration</th>
                  <th>Fee</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.id}</td>

                    <td>
                      <strong>{course.title}</strong>

                      {course.description && (
                        <small className="courses-description">
                          {course.description}
                        </small>
                      )}
                    </td>

                    <td>{course.course_code}</td>
                    <td>{course.department}</td>
                    <td>{course.instructor}</td>
                    <td>{course.duration}</td>
                    <td>{Number(course.fee).toLocaleString()}</td>

                    {isAdmin && (
                      <td>
                        <div className="courses-row-actions">
                          <button
                            type="button"
                            className="courses-edit-button"
                            onClick={() => handleEdit(course)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="courses-delete-button"
                            onClick={() => handleDelete(course)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="courses-footer">
        StudentHub · Course Management
      </footer>
    </div>
  );
}

export default Courses;

