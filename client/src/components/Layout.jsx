import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from './ui';

import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn, FaGithub, } from "react-icons/fa";

const socialLinks = [{ name: "Facebook", url: "https://www.facebook.com/profile.php?id=100044970004036", icon: <FaFacebookF />, }, { name: "Instagram", url: "https://www.instagram.com/kamaljeet5377?dlrf=NzZidGJ0MXhuZThq", icon: <FaInstagram />, }, { name: "YouTube", url: "https://github.com/kamaljeet-sharma", icon: <FaGithub />, }, { name: "LinkedIn", url: "https://www.linkedin.com/in/kamaljeet-sharma-r264/", icon: <FaLinkedinIn />, },];

const link = ({ isActive }) =>
  `px-2 py-1 text-[15px] font-semibold ${isActive ? 'text-teal' : 'text-ink hover:text-teal'}`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const home = user?.role === 'admin' ? '/admin' : '/student';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="flex items-center" aria-label="WellTalk Institute of English Language, home">
            <img src="/logo.png" alt="WellTalk Institute of English Language" className="h-11 w-auto" />
          </Link>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-3">
            <NavLink to="/courses" className={link}>Courses</NavLink>
            <NavLink to="/contact" className={link}>Free demo</NavLink>
            {user ? (
              <>
                <NavLink to={home} className={link}>{user.role === 'admin' ? 'Admin' : 'My learning'}</NavLink>
                <Button variant="ghost" onClick={() => { logout(); navigate('/'); }}>Log out</Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={link}>Log in</NavLink>
                <Button to="/register">Join now</Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t-2 border-teal bg-black text-white px-6 py-8">
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="text-center md:text-left">
              <Link to="/" className="inline-block" aria-label="WellTalk Institute of English Language, home">
                <img src="/logo.png" alt="WellTalk Institute of English Language" className="h-14 w-auto" />
              </Link>

              <p className="mt-2 text-sm text-ink-soft">
                Improve your English. Build your confidence.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="flex h-11 w-11 items-center justify-center rounded-full
              border border-line text-white
              transition duration-300 hover:bg-teal
              hover:border-teal"
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>

          </div>

          <div className="mt-6 border-t border-line pt-5 text-center">
            <p className="text-xs text-ink-soft">
              © {new Date().getFullYear()} WellTalk Institute. All rights reserved.
            </p>
          </div>

        </div>
      </footer>


    </div>
  );
}

