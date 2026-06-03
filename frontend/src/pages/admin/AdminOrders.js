import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { FaEye, FaDownload, FaCalendar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const STATUS_COLORS = { Ordered:'#1890ff', Preparing:'#fa8c16', Shipped:'#722ed1', Delivered:'#52c41a', Cancelled:'#ff4d4f' };

const DATE_FILTERS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Date' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { fetchOrders(); }, [statusFilter, dateFilter, startDate, endDate, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.dateFilter = dateFilter;
      if (dateFilter === 'custom' && startDate) params.startDate = startDate;
      if (dateFilter === 'custom' && endDate) params.endDate = endDate;
      const res = await orderAPI.getAll(params);
      setOrders(res.data.orders);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const params = { format };
      if (dateFilter) params.dateFilter = dateFilter;
      if (dateFilter === 'custom' && startDate) params.startDate = startDate;
      if (dateFilter === 'custom' && endDate) params.endDate = endDate;
      const res = await orderAPI.export(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${format.toUpperCase()} file!`);
    } catch (e) { toast.error('Export failed'); }
    setExporting(false);
  };

  const resetFilters = () => { setStatusFilter(''); setDateFilter(''); setStartDate(''); setEndDate(''); setPage(1); };

  return (
    <AdminLayout title="🛍️ Orders Management">
      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>ORDER STATUS</label>
            <select className="form-select form-select-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {['Ordered','Preparing','Shipped','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>DATE FILTER</label>
            <select className="form-select form-select-sm" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}>
              {DATE_FILTERS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          {dateFilter === 'custom' && (
            <>
              <div className="col-md-2">
                <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>FROM</label>
                <input type="date" className="form-control form-control-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>TO</label>
                <input type="date" className="form-control form-control-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </>
          )}
          <div className="col-md-auto">
            <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>Reset</button>
          </div>
          <div className="col-md-auto ms-auto">
            <div className="d-flex gap-2">
              <button onClick={() => handleExport('xlsx')} disabled={exporting} className="btn btn-sm btn-success">
                <FaDownload className="me-1" />{exporting ? 'Exporting...' : 'Excel'}
              </button>
              <button onClick={() => handleExport('csv')} disabled={exporting} className="btn btn-sm btn-outline-success">
                <FaDownload className="me-1" />CSV
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <small className="text-muted">
            <FaCalendar className="me-1" />
            Showing <strong>{total}</strong> orders
            {dateFilter && ` — ${DATE_FILTERS.find(d => d.value === dateFilter)?.label}`}
          </small>
        </div>
      </div>

      {/* Quick Date Pills */}
      <div className="d-flex gap-2 flex-wrap mb-3">
        {DATE_FILTERS.filter(d => d.value && d.value !== 'custom').map(d => (
          <button key={d.value} onClick={() => { setDateFilter(d.value); setPage(1); }}
            className="btn btn-sm"
            style={{ borderRadius: '20px', background: dateFilter === d.value ? 'linear-gradient(135deg,#d4380d,#fa8c16)' : 'white', color: dateFilter === d.value ? 'white' : '#555', border: '1px solid #ddd' }}>
            {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: '#d4380d' }} /></div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Items</th>
                  <th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-5 text-muted">No orders found for the selected filter</td></tr>
                ) : orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div>{order.user?.name || 'N/A'}</div>
                      <div style={{ color:'#888', fontSize:'11px' }}>{order.user?.email}</div>
                    </td>
                    <td>{order.items.length} item(s)</td>
                    <td>
                      <div style={{ fontWeight:700, color:'#d4380d' }}>₹{order.totalAmount}</div>
                      {order.couponDiscount > 0 && <div style={{ fontSize:'11px', color:'#52c41a' }}>-₹{order.couponDiscount} coupon</div>}
                    </td>
                    <td>
                      <span style={{ fontSize:'11px', background: order.paymentMethod === 'Online' ? '#eef2ff' : '#f0f0f0', color: order.paymentMethod === 'Online' ? '#072654' : '#555', padding:'2px 8px', borderRadius:'4px', fontWeight: 600 }}>
                        {order.paymentMethod === 'Online' ? '📱 UPI' : '💵 COD'}
                      </span>
                      {order.paymentMethod === 'Online' && (
                        <div style={{ fontSize: 10, marginTop: 3, color: order.paymentStatus === 'Paid' ? '#52c41a' : '#fa8c16', fontWeight: 600 }}>
                          {order.paymentStatus === 'Paid' ? '✔ Paid' : '⏳ Pending'}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background:`${STATUS_COLORS[order.orderStatus]}20`, color:STATUS_COLORS[order.orderStatus] }}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={{ color:'#888' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><Link to={`/admin/orders/${order._id}`} className="btn btn-sm btn-outline-secondary"><FaEye /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-4 d-flex justify-content-center">
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p - 1)}>←</button>
            </li>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => (
              <li key={i} className={`page-item ${page === i+1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i+1)}>{i+1}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p + 1)}>→</button>
            </li>
          </ul>
        </nav>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
