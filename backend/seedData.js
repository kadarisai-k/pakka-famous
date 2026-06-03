const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');

const products = [
  {
    name: 'Kakinada Kaja',
    city: 'Kakinada',
    description: 'The most famous sweet of Kakinada — a crispy, flaky pastry soaked in sugar syrup. Made with maida, this golden delicacy melts in your mouth with every bite. A true Andhra classic loved by all.',
    price: 320,
    discount: 10,
    stock: 100,
    category: 'Kaja',
    isFeatured: true,
    image: { url: 'https://via.placeholder.com/400x300?text=Kakinada+Kaja', publicId: '' },
    rating: { average: 4.8, count: 245 }
  },
  {
    name: 'Athreyapuram Pootharekulu',
    city: 'Athreyapuram',
    description: 'Paper-thin rice starch sheets filled with jaggery, ghee and dry fruits. Also known as "paper sweet", this delicate confection is an art form. Made by the skilled artisans of Athreyapuram village.',
    price: 480,
    discount: 5,
    stock: 60,
    category: 'Pootharekulu',
    isFeatured: true,
    image: { url: 'https://via.placeholder.com/400x300?text=Pootharekulu', publicId: '' },
    rating: { average: 4.9, count: 320 }
  },
  {
    name: 'Bandar Laddu',
    city: 'Machilipatnam',
    description: 'The legendary Bandar Laddu from Machilipatnam (Bandar) — made with roasted gram flour, ghee, and sugar. Larger than ordinary laddus, this GI-tagged sweet has a unique taste that has earned national fame.',
    price: 400,
    discount: 0,
    stock: 80,
    category: 'Laddu',
    isFeatured: true,
    image: { url: 'https://via.placeholder.com/400x300?text=Bandar+Laddu', publicId: '' },
    rating: { average: 4.7, count: 412 }
  },
  {
    name: 'Tirupati Laddu',
    city: 'Tirupati',
    description: 'The sacred prasadam of Lord Venkateswara — the world-famous Tirupati Laddu made with besan, sugar, cashews, and raisins. Every bite carries divine blessings and the rich flavor of pure ghee.',
    price: 250,
    discount: 0,
    stock: 150,
    category: 'Laddu',
    isFeatured: true,
    image: { url: 'https://via.placeholder.com/400x300?text=Tirupati+Laddu', publicId: '' },
    rating: { average: 5.0, count: 890 }
  },
  {
    name: 'Bobbatlu (Puran Poli)',
    city: 'Vijayawada',
    description: 'Soft, sweet flatbread stuffed with a filling of chana dal and jaggery, cooked on a griddle with ghee. A festive favorite across Andhra Pradesh, especially during Ugadi and other celebrations.',
    price: 200,
    discount: 0,
    stock: 90,
    category: 'Other',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Bobbatlu', publicId: '' },
    rating: { average: 4.5, count: 178 }
  },
  {
    name: 'Ariselu',
    city: 'Guntur',
    description: 'Traditional Andhra rice sweet made with rice flour and jaggery, deep-fried and coated with sesame seeds. A popular festive sweet especially during Sankranti, crispy on the outside and soft inside.',
    price: 280,
    discount: 8,
    stock: 70,
    category: 'Other',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Ariselu', publicId: '' },
    rating: { average: 4.4, count: 134 }
  },
  {
    name: 'Madatha Kaja',
    city: 'Rajahmundry',
    description: 'A distinctive variation of the classic Kaja from Rajahmundry — cylindrical in shape with a rolled, layered texture. Made with refined flour and soaked in sugar syrup, it has a unique crunchy exterior and soft interior.',
    price: 300,
    discount: 5,
    stock: 85,
    category: 'Kaja',
    isFeatured: true,
    image: { url: 'https://via.placeholder.com/400x300?text=Madatha+Kaja', publicId: '' },
    rating: { average: 4.6, count: 203 }
  },
  {
    name: 'Palakova',
    city: 'Nellore',
    description: 'A rich, dense milk-based sweet from Nellore — made by slowly reducing full-cream milk with sugar until it forms a thick, caramelized block. This GI-tagged delicacy has a distinctive caramel flavor that is simply irresistible.',
    price: 350,
    discount: 0,
    stock: 55,
    category: 'Burfi',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Palakova', publicId: '' },
    rating: { average: 4.7, count: 267 }
  },
  {
    name: 'Sunnundalu',
    city: 'Vijayawada',
    description: 'Nutritious and delicious laddus made from roasted urad dal and jaggery, bound with ghee. A powerhouse sweet that is both healthy and tasty — traditionally made in homes and gifted during festivals.',
    price: 240,
    discount: 10,
    stock: 120,
    category: 'Laddu',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Sunnundalu', publicId: '' },
    rating: { average: 4.3, count: 89 }
  },
  {
    name: 'Kajjikayalu',
    city: 'Vijayawada',
    description: 'Crescent-shaped deep-fried pastries filled with coconut, dry fruits, and jaggery. A festive specialty especially popular during Ganesh Chaturthi — crispy shell with a sweet, aromatic filling.',
    price: 260,
    discount: 0,
    stock: 75,
    category: 'Other',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Kajjikayalu', publicId: '' },
    rating: { average: 4.5, count: 112 }
  },
  {
    name: 'Kova Kajjikayalu',
    city: 'Machilipatnam',
    description: 'A premium version of Kajjikayalu filled with kova (milk solids) and dry fruits. The richness of milk solids combined with the crispy shell makes this a sought-after sweet for special occasions.',
    price: 360,
    discount: 5,
    stock: 60,
    category: 'Other',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Kova+Kajjikayalu', publicId: '' },
    rating: { average: 4.4, count: 76 }
  },
  {
    name: 'Ravva Ladduu',
    city: 'Guntur',
    description: 'Semolina laddus roasted in ghee with sugar, cashews, and raisins. A quick-to-make yet richly flavorful sweet that melts in your mouth — a staple sweet for celebrations and festivals across Andhra Pradesh.',
    price: 220,
    discount: 0,
    stock: 100,
    category: 'Laddu',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Ravva+Laddu', publicId: '' },
    rating: { average: 4.3, count: 145 }
  },
  {
    name: 'Chegodilu',
    city: 'Kurnool',
    description: 'Crispy, ring-shaped savory-sweet snack made from rice flour seasoned with cumin, sesame seeds, and a touch of sugar. Deep-fried to golden perfection — a beloved tea-time snack from Kurnool.',
    price: 180,
    discount: 10,
    stock: 130,
    category: 'Other',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Chegodilu', publicId: '' },
    rating: { average: 4.2, count: 98 }
  },
  {
    name: 'Bandar Halwa',
    city: 'Machilipatnam',
    description: 'The iconic Bandar Halwa — a dense, rich sweet made with wheat flour, ghee, and sugar. Its unique texture (neither too hard nor too soft) and amber color make it instantly recognizable. A century-old recipe.',
    price: 420,
    discount: 5,
    stock: 65,
    category: 'Halwa',
    isFeatured: true,
    image: { url: 'https://via.placeholder.com/400x300?text=Bandar+Halwa', publicId: '' },
    rating: { average: 4.6, count: 189 }
  },
  {
    name: 'Kobbari Mithai',
    city: 'Ongole',
    description: 'Coconut burfi made with freshly grated coconut, sugar, and ghee. Infused with cardamom and saffron, this simple yet exquisite sweet captures the tropical essence of coastal Andhra.',
    price: 200,
    discount: 0,
    stock: 90,
    category: 'Burfi',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Kobbari+Mithai', publicId: '' },
    rating: { average: 4.4, count: 123 }
  },
  {
    name: 'Pesara Garelu',
    city: 'Vijayawada',
    description: 'Crispy moong dal vadas with a slightly sweet touch — a unique Andhra preparation. Made with soaked moong dal ground to a coarse paste and deep-fried, these are crunchy outside and soft inside.',
    price: 160,
    discount: 0,
    stock: 80,
    category: 'Other',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Pesara+Garelu', publicId: '' },
    rating: { average: 4.1, count: 67 }
  },
  {
    name: 'Rava Kesari',
    city: 'Vizag',
    description: 'Golden semolina halwa flavored with saffron, cardamom, and garnished with cashews and raisins. The Vizag version has a distinctive ratio of ghee to semolina that makes it extra rich and aromatic.',
    price: 190,
    discount: 5,
    stock: 95,
    category: 'Halwa',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Rava+Kesari', publicId: '' },
    rating: { average: 4.3, count: 104 }
  },
  {
    name: 'Kaju Katli',
    city: 'Tirupati',
    description: 'Premium cashew fudge made with pure cashews, sugar, and silver leaf — the Tirupati version uses finest quality cashews from the region. Diamond-shaped pieces that are smooth, creamy, and melt in your mouth.',
    price: 650,
    discount: 8,
    stock: 50,
    category: 'Burfi',
    isFeatured: true,
    image: { url: 'https://via.placeholder.com/400x300?text=Kaju+Katli', publicId: '' },
    rating: { average: 4.8, count: 334 }
  },
  {
    name: 'Bellam Pootharekulu',
    city: 'Athreyapuram',
    description: 'The jaggery version of the iconic Pootharekulu — paper-thin rice starch sheets filled with jaggery (bellam) and ghee instead of sugar. A more traditional and rustic flavor preferred by connoisseurs.',
    price: 460,
    discount: 0,
    stock: 45,
    category: 'Pootharekulu',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Bellam+Pootharekulu', publicId: '' },
    rating: { average: 4.8, count: 156 }
  },
  {
    name: 'Gulab Jamun Kaja',
    city: 'Kakinada',
    description: 'A fusion creation from Kakinada combining the softness of gulab jamun with the flakiness of kaja. Soaked in rose-flavored sugar syrup, this innovative sweet has quickly become a local favorite.',
    price: 340,
    discount: 10,
    stock: 70,
    category: 'Kaja',
    isFeatured: false,
    image: { url: 'https://via.placeholder.com/400x300?text=Gulab+Jamun+Kaja', publicId: '' },
    rating: { average: 4.5, count: 88 }
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products successfully!`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
