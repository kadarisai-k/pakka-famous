import React from 'react';
import AdminSectionPicker from './AdminSectionPicker';
import { productAPI } from '../services/api';

const AdminFeaturedPicks = () => (
  <AdminSectionPicker
    title="Featured Picks"
    emoji="⭐"
    flagField="isFeatured"
    fetchFn={() => productAPI.getFeatured()}
    color="#FFBE00"
    description="Sweets shown in the Featured Picks scrolling row on the homepage."
  />
);

export default AdminFeaturedPicks;
