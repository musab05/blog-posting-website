import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../AuthProvider';
import UserNavigationPanel from '../common/UserNavigation';
import { Outlet } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuth();
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
        <div className="flex flex-row gap-2 justify-center align-middle items-center">
          <Link to="/editor">
            <i className="fi fi-rr-edit text-4xl"></i>
          </Link>
          <div className="" onClick={handleUserNavPanel} onBlur={handleBlur}>
            <button className="w-12 h-12 mt-1">
              <img
                src={user.profileUrl}
                className="w-full h-full object-cover rounded-full"
              />
            </button>

            {userNavPanel ? <UserNavigationPanel /> : ''}
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
};
export default Navbar;
