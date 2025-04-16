import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import UserNavigationPanel from '../common/UserNavigation';
import { Outlet } from 'react-router-dom';
import { Bell, Edit, User, Compass } from 'lucide-react'; // Added Compass icon
import { toast } from 'sonner';
import axios from 'axios';
import { useNotification } from '../NotificationProvider';
import LOGO from '../assets/logo.png';

const Navbar = () => {
  const { user } = useAuth();
  const [theme, SetTheme] = useState('light');
  const [userNavPanel, setUserNavPanel] = useState(false);
  const { hasNotification, fetchUserNotifications } = useNotification();

  const handleUserNavPanel = () => {
    setUserNavPanel(currentVal => !currentVal);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 275);
  };

  return (
    <>
      <nav className="z-10 sticky top-0 flex flex-row justify-between items-center gap-12 w-full px-[5vw] py-5 h-[80px] border-b border-grey bg-white">
        <Link to="/">
          <img
            className="w-auto h-35 object-contain"
            src={LOGO}
            alt="BlogVista Logo"
          />
        </Link>
        <div className="flex flex-row gap-4 items-center">
          <Link
            to="/discovery"
            className="hidden md:flex items-center gap-1 text-gray-700 hover:text-gray-900"
          >
            <Compass size={28} />
          </Link>

          <Link to="/editor">
            <Edit size={28} className="text-gray-700 hover:text-gray-900" />
          </Link>
          <Link to="/notification" className="relative">
            <Bell size={28} className="text-gray-700 hover:text-gray-900" />
            {hasNotification && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            )}
          </Link>
          <div
            className="relative"
            onClick={handleUserNavPanel}
            onBlur={handleBlur}
          >
            <button className="w-12 h-12 rounded-full overflow-hidden">
              {user.profileUrl ? (
                <img
                  src={user.profileUrl}
                  className="w-full h-full object-cover"
                  alt="User"
                />
              ) : (
                <User size={32} className="text-gray-700 hover:text-gray-900" />
              )}
            </button>
            {userNavPanel && <UserNavigationPanel />}
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
