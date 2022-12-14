import bcrypt from 'bcryptjs';

const data = {
  books: [
    {
      // _id: '1',
      title: 'Metro 2033',
      key: 'metro-2033',
      category: 'Metro series',
      image: '/img/metro2033.png',
      author: 'Dmitry Glukhovsky',
      rating: 5,
      reviews: 10,
      release: 2011,
      page: 439,
      price: 10,
      description: 'Poszt apokaliptikus világ',
      stock: 3,
    },
    {
      // _id: '2',
      title: 'Metro 2034',
      key: 'metro-2034',
      category: 'Metro series',
      image: '/img/metro2034.png',
      author: 'Dmitry Glukhovsky',
      rating: 5,
      reviews: 10,
      release: 2011,
      page: 271,
      price: 10,
      description: 'Poszt apokaliptikus világ',
      stock: 0,
    },
    {
      // _id: '3',
      title: 'Metro 2035',
      key: 'metro-2035',
      category: 'Metro series',
      image: '/img/metro2035.png',
      author: 'Dmitry Glukhovsky',
      rating: 3.5,
      reviews: 10,
      release: 2017,
      page: 482,
      price: 10,
      description: 'Poszt apokaliptikus világ',
      stock: 3,
    },
  ],
  users: [
    {
      name: 'Benjamin',
      email: 'benjamin@admin.com',
      password: bcrypt.hashSync('password'),
      admin: true,
    },
    {
      name: 'NotBenjamin',
      email: 'notbenjamin@admin.com',
      password: bcrypt.hashSync('password'),
      admin: false,
    },
  ],
};

export default data;
