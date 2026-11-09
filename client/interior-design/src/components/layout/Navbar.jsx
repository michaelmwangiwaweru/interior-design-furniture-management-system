import React from "react";
import { NavLink, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import logo from "../image/logo.jpg";

const Navbar = () => {
  const links = [
    { to: "/", label: "Home" },
    
     
    
    { to: "/shopbetter", label: "shop" },
    
     
      
       
       
       

    // Hamburger menu starts here
    
     
    
     { to: "/about-us", label: " About us" },
    { to: "/loginpage", label: "Login" },
    
    
    
    
    
    
    
    
    
  ];

  const horizontalLinks = links.slice(0, 5);
  const hamburgerLinks = links.slice(5);

  return (
    <>
      {/* NAVBAR HEADER */}
      <nav
        className="navbar navbar-dark sticky-top shadow"
        style={{ backgroundColor: "#111827" }}
      >
        <div className="container d-flex justify-content-between align-items-center">

          {/* Logo */}
          <Link
            className="navbar-brand d-flex align-items-center fw-bold"
            to="/"
            style={{ fontSize: "1.6rem", color: "white" }}
          >
            <img
              src={logo}
              alt="logo"
              style={{
                height: "60px",
                width: "60px",
                marginRight: "14px",
                borderRadius: "50%",
              }}
            />
            Whitewise Interior Furnitures
          </Link>

          {/* Horizontal Links (FIRST FIVE ONLY) */}
          <ul className="navbar-nav d-none d-lg-flex flex-row gap-2">
            {horizontalLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className="btn btn-outline-light px-3 py-2"
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Hamburger Button (for the REST) */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#hamburgerMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

        </div>
      </nav>

      {/* SIDEBAR HAMBURGER MENU */}
      <div
        className="offcanvas offcanvas-end"
        id="hamburgerMenu"
        tabIndex="-1"
        style={{ backgroundColor: "#457b9d", color: "white" }}
      >
        <div className="offcanvas-header">
          <h5 className="fw-bold">Menu</h5>
          <button className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>

        <div className="offcanvas-body">
          <ul className="navbar-nav">
            {hamburgerLinks.map(({ to, label }) => (
              <li key={to} className="nav-item mb-3">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `btn w-100 text-start text-white px-3 py-2 ${
                      isActive ? "fw-bold border-start border-3 border-light" : ""
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
