import React, { useState, useEffect } from 'react';
import { storyAPI } from '../../services/api';

const DEFAULT_STORIES = [
  { _id:'d1', title:'Kakinada Kaja — The Crown Jewel', city:'Kakinada', history:'Born over 200 years ago in the coastal city of Kakinada, the Kaja is made with refined wheat flour, sugar syrup, and pure ghee. The flaky, layered sweet is deep fried and then soaked in sugar syrup giving it a uniquely crispy yet melt-in-mouth texture.', description:'The Kakinada Kaja holds a GI tag and is arguably the most famous sweet from Andhra Pradesh. Its intricate layered structure requires years of practice to master.' },
  { _id:'d2', title:'Pootharekulu — Paper Sweet', city:'Athreyapuram', history:'Originating from the village of Athreyapuram near Rajam, Pootharekulu — literally "coated rolls" — is made from rice starch paper, stuffed with sugar, dry fruits, and ghee. Each roll is paper-thin and handcrafted with extraordinary skill.', description:'This GI-tagged delicacy is so delicate that it literally dissolves on your tongue. The art of making Pootharekulu has been passed down through generations of sweet makers.' },
  { _id:'d3', title:'Tirupati Laddu — Sacred Prasadam', city:'Tirupati', history:'The Tirupati Laddu, offered as prasadam at the Sri Venkateswara Temple, is one of the most famous laddus in the world. Made with besan, sugar, ghee, cashews, and raisins — over 3 lakh laddus are prepared daily.', description:'With a GI tag and global recognition, the Tirupati Laddu is not just a sweet — it is a divine blessing experienced by millions of devotees every year.' },
];

const StoryPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storyAPI.getAll().then(r => setStories(r.data.stories || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner-border" /></div>;

  const displayStories = stories.length > 0 ? stories : DEFAULT_STORIES;

  return (
    <div style={{ background: '#F9FAFB' }}>
      {/* Hero */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '72px 0', textAlign: 'center' }}>
        <div className="container">
          <span className="section-badge">Heritage & Culture</span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: '#111827', margin: '10px 0' }}>
            The Story Behind Our Famous Sweets
          </h1>
          <p style={{ color: '#6B7280', maxWidth: 560, margin: '0 auto', fontSize: 16, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
            Each sweet carries with it centuries of tradition, love, and the soul of Andhra Pradesh
          </p>
        </div>
      </div>

      {/* Stories */}
      {displayStories.map((story, index) => {
        const isEven = index % 2 === 0;
        return (
          <section key={story._id} style={{ padding: '72px 0', background: isEven ? 'white' : '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <div className="container">
              <div className={`row align-items-center g-5${isEven ? '' : ' flex-md-row-reverse'}`}>
                <div className="col-md-5">
                  {story.image?.url
                    ? <img loading="lazy" src={story.image.url} alt={story.title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }} />
                    : <div style={{ width: '100%', aspectRatio: '4/3', background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🍬</div>
                  }
                </div>
                <div className="col-md-7">
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff0f0', color: '#E8001D', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
                    📍 {story.city}
                  </div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, color: '#111827', margin: '0 0 10px' }}>
                    {story.title}
                  </h2>
                  <div className="section-divider" />
                  <p style={{ fontSize: 15, lineHeight: 1.85, color: '#4B5563', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>{story.history}</p>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, fontFamily: 'Inter, sans-serif' }}>{story.description}</p>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <div style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '72px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', marginBottom: 10 }}>Taste the Stories</h2>
          <p style={{ color: '#6B7280', marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Order authentic Andhra sweets and experience centuries of tradition</p>
          <a href="/products"><button className="btn-pakka" style={{ padding: '13px 36px', fontSize: 15 }}>Shop Now 🍬</button></a>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
