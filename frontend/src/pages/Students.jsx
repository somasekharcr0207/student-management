
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Read the user's role from the JWT token.
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

function Students() {
  const navigate = useNavigate();
  const isAdmin = getUserRole() === 'admin';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    department: '',
    course: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (err) {
      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem('access_token');
        navigate('/login', { replace: true });
        return;
      }

      setError(
        err.response?.data?.detail || 'Unable to load students.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const openAddForm = () => {
    if (!isAdmin) return;

    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (student) => {
    if (!isAdmin) return;

    setEditingId(student.id);

    setForm({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      department: student.department || '',
      course: student.course || '',
    });

    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    setSaving(true);
    setError('');

    try {
      if (editingId !== null) {
        await api.put(`/students/${editingId}`, form);
      } else {
        await api.post('/students', form);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadStudents();
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Unable to save student details.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    setError('');

    try {
      await api.delete(`/students/${student.id}`);
      await loadStudents();
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Unable to delete student.'
      );
    }
  };

  return (
    <div className="management-page">
      <header className="management-header">
        <div>
          <button
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>

          <h1>Student Management</h1>

          <p>
            {isAdmin
              ? 'View and manage student records.'
              : 'View student records.'}
          </p>
        </div>

        {isAdmin && (
          <button
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Student
          </button>
        )}
      </header>

      {error && (
        <div className="management-error">{error}</div>
      )}

      {isAdmin && showForm && (
        <section className="student-form-card">
          <h2>
            {editingId !== null ? 'Edit Student' : 'Add New Student'}
          </h2>

          <form onSubmit={handleSubmit} className="student-form">
            <div className="student-form-grid">
              <label>
                Full Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Department
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Course
                <input
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Update Student'
                    : 'Save Student'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="student-table-card">
        <h2>All Students</h2>

        {loading ? (
          <p className="table-message">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="table-message">
            No students found.
            {isAdmin && ' Click "Add Student" to create the first record.'}
          </p>
        ) : (
          <div className="table-scroll">
            <table className="student-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Course</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{student.department}</td>
                    <td>{student.course}</td>

                    {isAdmin && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="edit-button"
                            onClick={() => openEditForm(student)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(student)}
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
    </div>
  );
}

export default Students;

