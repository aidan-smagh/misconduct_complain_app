"use client";

import { useState } from "react";
import { auth } from "@/lib/client/firebaseConfig";
import { signOut } from "firebase/auth";

const Nav = () => {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);

  // Set user when auth is initialized
  if (!authReady) {
    auth.authStateReady().then(() => {
      setUser(auth.currentUser);
      setAuthReady(true);
    });
  }

  const logout = async () => {
    try {
      signOut(auth);
      location.reload();
    } catch {

    }
  }

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <span className="self-center text-md md:text-2xl font-semibold whitespace-nowrap dark:text-white">
              Community-Police Trust Platform
            </span>
          </a>

          {/* Hamburger Button (Small Screens) */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden 
                     hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 
                     dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>

          {/* Desktop Navigation (Hidden on Small Screens) */}
          <div className="hidden w-full md:block md:w-auto">
            <ul
              className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 
                         md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white 
                         dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"
            >
              <li>
                <a href="/" className="nav-button">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="nav-button">
                  About
                </a>
              </li>
              <li>
                <a href="/editor" className="nav-button">
                  Contribute Filing Information
                </a>
              </li>
              <li>
                <div className="w-10">
                  {authReady ?
                    (user ? (
                      <div onClick={logout} className="login-logout">
                        Logout
                      </div>
                    ) : (
                      <a href="/login" className="login-logout">
                        Login
                      </a>
                    )) : null}
                </div>
              </li>
            </ul>
          </div>

          {/* Dropdown Navigation (Visible when menuOpen is true) */}
          {menuOpen && (
            <div className="fixed top-16 left-0 w-full bg-white border border-gray-200 shadow-md rounded-md md:hidden z-10">
              <ul className="font-medium flex flex-col p-4 space-y-2">
                <li>
                  <a href="/" className="block py-2 px-4 hover:bg-gray-100">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="block py-2 px-4 hover:bg-gray-100"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/editor"
                    className="block py-2 px-4 hover:bg-gray-100"
                  >
                    Contribute Filing Information
                  </a>
                </li>
                <li>
                  {authReady ?
                    (user ? (
                      <div onClick={logout} className="block py-2 px-4 hover:bg-gray-100 login-logout">
                        Logout
                      </div>
                    ) : (
                      <a href="/login" className="block py-2 px-4 hover:bg-gray-100 login-logout">
                        Login
                      </a>
                    )) : null}
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Nav;
