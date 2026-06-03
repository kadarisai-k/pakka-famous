import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { FaEye, FaToggleOn, FaToggleOff, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (!authLoading) { fetchUsers(); }
  }, [page, authLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, limit: 15 });
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleToggle = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success('User status updated!');
    } catch (e) { toast.error('Failed'); }
  };

  const handleViewUser = async (id) => {
    try {
      const res = await adminAPI.getUserWithOrders(id);
      setSelectedUser(res.data);
    } catch (e) { toast.error('Failed to load user details'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="👥 Users Management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text"><FaSearch /></span>
          <input type="text" className="form-control" placeholder="Search users..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-muted" style={{ fontSize: '13px' }}>{users.length} users</span>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: '#d4380d' }} /></div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No users found</td></tr>
                ) : filtered.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #d4380d, #fa8c16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#555' }}>{user.email}</td>
                    <td>{user.phone}</td>
                    <td style={{ color: '#888', fontSize: '12px' }}>
                      {user.address?.city ? `${user.address.city}, ${user.address.state}` : 'Not set'}
                    </td>
                    <td style={{ color: '#888' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: user.isActive ? '#f6ffed' : '#fff2f0', color: user.isActive ? '#52c41a' : '#ff4d4f' }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button onClick={() => handleViewUser(user._id)} className="btn btn-sm btn-outline-primary" title="View Details">
                          <FaEye />
                        </button>
                        <button onClick={() => handleToggle(user._id)} className="btn btn-sm" title={user.isActive ? 'Deactivate' : 'Activate'}
                          style={{ color: user.isActive ? '#ff4d4f' : '#52c41a', border: `1px solid ${user.isActive ? '#ff4d4f' : '#52c41a'}` }}>
                          {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontFamily: 'Playfair Display' }}>
                  User: {selectedUser.user.name}
                </h5>
                <button className="btn-close" onClick={() => setSelectedUser(null)} />
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>Email:</strong> {selectedUser.user.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.user.phone}</p>
                    <p><strong>Joined:</strong> {new Date(selectedUser.user.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Address:</strong><br />
                      {selectedUser.user.address?.street && `${selectedUser.user.address.street}, `}
                      {selectedUser.user.address?.city && `${selectedUser.user.address.city}, `}
                      {selectedUser.user.address?.state || 'Not provided'}
                    </p>
                  </div>
                </div>

                <h6 style={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
                  Order History ({selectedUser.orders.length} orders)
                </h6>
                {selectedUser.orders.length === 0 ? (
                  <p className="text-muted">No orders yet</p>
                ) : (
                  <table className="table table-sm" style={{ fontSize: '13px' }}>
                    <thead><tr><th>Order ID</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {selectedUser.orders.map(o => (
                        <tr key={o._id}>
                          <td>#{o._id.slice(-6).toUpperCase()}</td>
                          <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          <td style={{ fontWeight: 600, color: '#d4380d' }}>₹{o.totalAmount}</td>
                          <td><span style={{ color: '#fa8c16', fontWeight: 600 }}>{o.orderStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
