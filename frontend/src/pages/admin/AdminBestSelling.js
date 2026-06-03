import React from 'react';
import AdminSectionPicker from './AdminSectionPicker';
import { productAPI } from '../../services/api';

const AdminBestSelling = () => (
  <AdminSectionPicker
    title="Best Selling"
    emoji="🏆"
    flagField="isBestSelling"
    fetchFn={() => productAPI.getBestSelling()}
    color="#2EA94B"
    description="Sweets shown in the Best Selling section on the homepage."
  />
);

export default AdminBestSelling;
