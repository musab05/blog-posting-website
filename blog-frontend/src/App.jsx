import LoginPage from './pages/LoginPage';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './AuthProvider';
import Navbar from './components/navbar.component';
import EditorPage from './pages/EditorPage';
import FinalizeBlog from './pages/FinalizeBlog';
import BlogShowPage from './pages/BlogShowPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/signin" element={<LoginPage type="signin" />} />
        <Route path="/signup" element={<LoginPage type="signup" />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Navbar />}>
            <Route index element={<HomePage />} />
            <Route path="/blogs/:blogId" element={<BlogShowPage />} />
          </Route>
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/finalize-blog" element={<FinalizeBlog />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
