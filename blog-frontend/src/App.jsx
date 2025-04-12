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
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationPage from './pages/NotificationPage';
import DashboardPage from './pages/DashboardPage';
import { NotificationProvider } from './NotificationProvider';
import DiscoveryPage from './pages/DiscoveryPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/signin" element={<LoginPage type="signin" />} />
          <Route path="/signup" element={<LoginPage type="signup" />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Navbar />}>
              <Route index element={<HomePage />} />
              <Route path="/blogs/:blogId" element={<BlogShowPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route
                path="/settings/edit-profile"
                element={<EditProfilePage />}
              />
              <Route path="/notification" element={<NotificationPage />} />
              <Route path="/dashboard/blogs" element={<DashboardPage />} />
              <Route path="/discovery" element={<DiscoveryPage />} />
            </Route>
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/editor/edit/:blogId" element={<EditorPage />} />
            <Route path="/finalize-blog" element={<FinalizeBlog />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
