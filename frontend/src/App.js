import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import BookScreen from './screens/BookScreen';

function App() {
  return (
    <BrowserRouter>
      <div>
        <header>
          <Link to="/">Bookshop</Link>
        </header>
        <main>
          <Routes>
            <Route path="/book/:key" element={<BookScreen />} />
            <Route path="/" element={<HomeScreen />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
