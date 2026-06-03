import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import { FaFire, FaStar, FaGift, FaQuoteLeft, FaImage, FaBoxOpen, FaChevronRight } from 'react-icons/fa';

const SECTIONS = [
  {
    key: 'today',
    icon: <FaFire />,
    label: "Today's Special",
    desc: "Set daily special products with discounted prices",
    color: '#FF4C29',
    bg: '#FFF0EC',
    route: '/today-special',
    actions: ['Set Products', 'Set Price', 'Set Coupon'],
  },
  {
    key: 'festival',
    icon: <FaStar />,
    label: 'Festival Offers',
    desc: 'Create festival/event offers with banners and countdown timers',
    color: '#7c3aed',
    bg: '#F5F3FF',
    route: '/special-offers',
    actions: ['Create Offer', 'Set Banner', 'Add Perks', 'Set Timer'],
  },
  {
    key: 'occasions',
    icon: <FaGift />,
    label: 'Special Occasions',
    desc: 'Manage occasion categories shown on homepage',
    color: '#4CAF50',
    bg: '#F0FFF4',
    route: '/seasonal',
    actions: ['Add Category', 'Upload Image', 'Edit Description'],
  },
  {
    key: 'packings',
    icon: <FaBoxOpen />,
    label: 'Packing Products',
    desc: 'Add packings for Corporate, NRI, Wedding and other occasions',
    color: '#FF8C00',
    bg: '#FFF8EC',
    route: '/packings',
    actions: ['Add Packing', 'Set Category', 'Upload Image', 'Set Price'],
  },
  {
    key: 'testimonials',
    icon: <FaQuoteLeft />,
    label: 'Testimonials',
    desc: 'Manage customer reviews displayed on the homepage carousel',
    color: '#FFD84D',
    bg: '#FFFBEB',
    route: '/testimonials',
    actions: ['Add Review', 'Edit Review', 'Show/Hide'],
  },
  {
    key: 'content',
    icon: <FaImage />,
    label: 'Homepage Content',
    desc: 'Edit hero image, section titles, logo, and announcements',
    color: '#0891b2',
    bg: '#ECFEFF',
    route: '/content',
    actions: ['Hero Image', 'Logo', 'Announcement', 'Titles'],
  },
];

const AdminOffersHub = () => {
  return (
    <AdminLayout>
      <div style={{ padding: '28px 24px', maxWidth: 960 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ margin: 0, fontWeight: 800, color: '#1A1A1A', fontFamily: 'Poppins,sans-serif', marginBottom: 6 }}>
            🏠 Homepage Sections Hub
          </h4>
          <p style={{ margin: 0, color: '#6B7280', fontSize: 14, fontFamily: 'Poppins,sans-serif' }}>
            All homepage content controls in one place — click any section to manage it
          </p>
        </div>

        {/* Section cards */}
        <div className="row g-3">
          {SECTIONS.map(sec => (
            <div key={sec.key} className="col-12 col-md-6">
              <Link to={sec.route} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: 'white', borderRadius: 16, padding: '22px 24px',
                  border: `2px solid ${sec.color}22`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                  transition: 'all .25s', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${sec.color}22`; e.currentTarget.style.borderColor=`${sec.color}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor=`${sec.color}22`; }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: sec.bg, color: sec.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {sec.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A', fontFamily: 'Poppins,sans-serif', marginBottom: 4 }}>{sec.label}</div>
                        <div style={{ fontSize: 13, color: '#6B7280', fontFamily: 'Poppins,sans-serif', lineHeight: 1.5 }}>{sec.desc}</div>
                      </div>
                    </div>
                    <FaChevronRight style={{ color: '#D1D5DB', flexShrink: 0, marginTop: 4 }} />
                  </div>
                  {/* Action tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                    {sec.actions.map(a => (
                      <span key={a} style={{ background: sec.bg, color: sec.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50, border: `1px solid ${sec.color}30`, fontFamily: 'Poppins,sans-serif' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOffersHub;
