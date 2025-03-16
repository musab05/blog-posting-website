import LoginPage from './pages/LoginPage';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './AuthProvider';
import Navbar from './components/navbar.component';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
        </Route>
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/signin" element={<LoginPage type="signin" />} />
        <Route path="/signup" element={<LoginPage type="signup" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
