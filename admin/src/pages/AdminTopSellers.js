import React from 'react';
import AdminSectionPicker from './AdminSectionPicker';
import { productAPI } from '../services/api';

const AdminTopSellers = () => (
  <AdminSectionPicker
    title="Top Sellers"
    emoji="🔥"
    flagField="isTopSeller"
    fetchFn={() => productAPI.getTopSellers()}
    color="#E8001D"
    description="Sweets shown in the Top Sellers scrolling row on the homepage."
  />
);

export default AdminTopSellers;
