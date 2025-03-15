import { Link } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../AuthProvider';
import UserNavigationPanel from '../common/UserNavigation';
import { Outlet } from 'react-router-dom';

const Navbar = () => {
  const { logout } = useAuth();
  const [theme, SetTheme] = useState('light');
  const [userNavPanel, setUserNavPanel] = useState(false);

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
          <h1>Logo</h1>
        </Link>
        <div className="" onClick={handleUserNavPanel} onBlur={handleBlur}>
          <button className="w-12 h-12 mt-1">
            <img
              // src={profile_img}
              className="w-full h-full object-cover rounded-full"
            />
          </button>

          {userNavPanel ? <UserNavigationPanel /> : ''}
        </div>
      </nav>
      <Outlet />
    </>
  );
};
export default Navbar;
