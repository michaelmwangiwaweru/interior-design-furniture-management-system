
import React, { useState } from "react";
import CatalogPage from "../service/CatalogPage";
import FinishedProduct from "../service/FinishedProduct";
import CustomerServices from "../service/CustomerServices";

import "bootstrap-icons/font/bootstrap-icons.css";

function UserDashboard() {
  const [activeTask, setActiveTask] = useState("overview");
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tasks = [
    {
      id: "products",
      title: "Product Management",
      description: "Manage your product catalog and product information.",
      icon: "bi-box-seam",
      color: "#3867b2",
      bg: "#edf3ff",
    },
    {
      id: "finished",
      title: "Finished Products",
      description: "Access your finished product records and information.",
      icon: "bi-boxes",
      color: "#17846c",
      bg: "#e8f7f0",
    },
    {
      id: "services",
      title: "Customer Services",
      description: "Access customer service tools and activities.",
      icon: "bi-headset",
      color: "#ae751e",
      bg: "#fff4df",
    },
  ];

  const selectedTask = tasks.find((task) => task.id === activeTask);

  const navigate = (taskId) => {
    setActiveTask(taskId);
    setSidebarOpen(false);
  };

  const styles = `
    .ud {
      --navy: #172c4b;
      --navy-light: #24436d;
      --blue: #3867b2;
      --text: #253650;
      --muted: #7c899c;
      --border: #e5eaf1;
      min-height: 100vh;
      background: #f4f6fa;
      color: var(--text);
      font-family: "Segoe UI", Arial, sans-serif;
    }

    .ud * { box-sizing: border-box; }

    .ud-sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 100;
      width: 255px;
      display: flex;
      flex-direction: column;
      padding: 24px 15px 18px;
      background: var(--navy);
      color: #dce6f5;
      overflow-y: auto;
    }

    .ud-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 10px 25px;
      border-bottom: 1px solid #ffffff19;
    }

    .ud-brand-icon {
      display: grid;
      place-items: center;
      width: 43px;
      height: 43px;
      flex-shrink: 0;
      border-radius: 12px;
      color: white;
      background: linear-gradient(135deg, #5988d3, #31558f);
      font-size: 21px;
    }

    .ud-brand-name {
      color: white;
      font-size: 14px;
      font-weight: 750;
    }

    .ud-brand-subtitle {
      margin-top: 4px;
      color: #a8bad3;
      font-size: 11px;
    }

    .ud-nav-label {
      padding: 25px 12px 10px;
      color: #91a5c1;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .ud-nav {
      display: grid;
      gap: 6px;
    }

    .ud-nav button {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 13px 12px;
      border: 1px solid transparent;
      border-radius: 9px;
      color: #c5d3e6;
      background: transparent;
      text-align: left;
      font-size: 12px;
      font-weight: 650;
      cursor: pointer;
      transition: background .2s, color .2s;
    }

    .ud-nav button i {
      width: 19px;
      font-size: 16px;
      text-align: center;
    }

    .ud-nav button:hover {
      background: #ffffff0e;
      color: white;
    }

    .ud-nav button.active {
      color: white;
      background: #315486;
      border-color: #ffffff12;
      box-shadow: inset 3px 0 #91baff;
    }

    .ud-sidebar-bottom {
      margin-top: auto;
      padding-top: 25px;
    }

    .ud-sidebar-help {
      padding: 16px;
      border: 1px solid #ffffff20;
      border-radius: 12px;
      background: #ffffff08;
    }

    .ud-sidebar-help i {
      color: #b9d2f5;
      font-size: 22px;
    }

    .ud-sidebar-help h4 {
      margin: 10px 0 6px;
      color: white;
      font-size: 13px;
    }

    .ud-sidebar-help p {
      color: #b0c0d7;
      font-size: 11px;
      line-height: 1.7;
      margin: 0 0 13px;
    }

    .ud-sidebar-help button {
      width: 100%;
      padding: 10px;
      border: 0;
      border-radius: 8px;
      color: var(--navy);
      background: #f5f8fd;
      font-size: 11px;
      font-weight: 750;
      cursor: pointer;
    }

    .ud-sidebar-footer {
      padding: 18px 8px 0;
      color: #8499b7;
      font-size: 10px;
    }

    .ud-main {
      min-height: 100vh;
      margin-left: 255px;
    }

    .ud-navbar {
      position: sticky;
      top: 0;
      z-index: 50;
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 30px;
      border-bottom: 1px solid var(--border);
      background: #ffffffed;
      backdrop-filter: blur(10px);
    }

    .ud-navbar-left,
    .ud-navbar-right {
      display: flex;
      align-items: center;
      gap: 13px;
    }

    .ud-menu-button {
      display: none;
      width: 38px;
      height: 38px;
      border: 1px solid var(--border);
      border-radius: 9px;
      color: var(--text);
      background: white;
      cursor: pointer;
    }

    .ud-navbar-label {
      margin-bottom: 4px;
      color: #8a97aa;
      font-size: 10px;
    }

    .ud-navbar-title {
      margin: 0;
      color: var(--navy);
      font-size: 16px;
      font-weight: 800;
    }

    .ud-status {
      display: flex;
      align-items: center;
      gap: 7px;
      color: #66778e;
      font-size: 11px;
    }

    .ud-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #20a579;
    }

    .ud-help-top {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 10px 13px;
      border: 1px solid #dce4ef;
      border-radius: 8px;
      color: #294c7c;
      background: white;
      font-size: 11px;
      font-weight: 750;
      cursor: pointer;
    }

    .ud-content {
      max-width: 1550px;
      margin: auto;
      padding: 30px;
    }

    .ud-heading-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }

    .ud-eyebrow {
      margin-bottom: 8px;
      color: #6380a6;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }

    .ud-page-heading {
      margin: 0;
      color: #1c304e;
      font-size: clamp(25px, 3vw, 32px);
      font-weight: 800;
      letter-spacing: -.6px;
    }

    .ud-page-description {
      max-width: 650px;
      margin: 9px 0 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.8;
    }

    .ud-access-label {
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: white;
      color: #63758d;
      font-size: 11px;
      white-space: nowrap;
    }

    .ud-welcome {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 27px;
      padding: 26px;
      border-radius: 15px;
      color: white;
      background:
        radial-gradient(circle at 85% 10%, #7299d540, transparent 30%),
        linear-gradient(115deg, #172d4e, #2b4d7b);
      box-shadow: 0 10px 25px #172d4e12;
    }

    .ud-welcome-label {
      color: #bbd1ef;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .ud-welcome h2 {
      margin: 9px 0;
      color: white;
      font-size: clamp(21px, 2.5vw, 28px);
      font-weight: 750;
    }

    .ud-welcome p {
      max-width: 620px;
      margin: 0;
      color: #d2deef;
      font-size: 12px;
      line-height: 1.8;
    }

    .ud-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      padding: 12px 15px;
      border: 1px solid #ffffff24;
      border-radius: 12px;
      background: #ffffff12;
    }

    .ud-profile img {
      width: 47px;
      height: 47px;
      border: 2px solid #ffffff99;
      border-radius: 50%;
      object-fit: cover;
      background: white;
    }

    .ud-profile-label {
      margin-bottom: 4px;
      color: #bdcfe7;
      font-size: 10px;
    }

    .ud-profile-name {
      margin: 0;
      color: white;
      font-size: 13px;
      font-weight: 750;
    }

    .ud-section-header {
      margin-bottom: 15px;
    }

    .ud-section-header h3 {
      margin: 0;
      color: #263953;
      font-size: 16px;
      font-weight: 800;
    }

    .ud-section-header p {
      margin: 5px 0 0;
      color: #8491a4;
      font-size: 11px;
    }

    .ud-analytics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 15px;
      margin-bottom: 28px;
    }

    .ud-metric {
      display: flex;
      align-items: center;
      gap: 13px;
      min-width: 0;
      padding: 18px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: white;
      box-shadow: 0 3px 12px #1d355708;
    }

    .ud-metric-icon {
      display: grid;
      place-items: center;
      width: 43px;
      height: 43px;
      flex-shrink: 0;
      border-radius: 11px;
      font-size: 19px;
    }

    .ud-metric-label {
      margin-bottom: 5px;
      color: #7c899c;
      font-size: 10px;
    }

    .ud-metric-value {
      color: #203651;
      font-size: 23px;
      font-weight: 800;
      line-height: 1.1;
    }

    .ud-metric-note {
      margin-top: 5px;
      color: #8b97a8;
      font-size: 10px;
      line-height: 1.5;
    }

    .ud-tasks {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 15px;
      margin-bottom: 26px;
    }

    .ud-task-card {
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: white;
      box-shadow: 0 3px 12px #1d355708;
      transition: transform .2s, box-shadow .2s;
    }

    .ud-task-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 22px #1d355710;
    }

    .ud-task-card.selected {
      border-color: #a9c2e6;
      box-shadow: 0 0 0 2px #3867b210;
    }

    .ud-task-icon {
      display: grid;
      place-items: center;
      width: 43px;
      height: 43px;
      margin-bottom: 15px;
      border-radius: 11px;
      font-size: 19px;
    }

    .ud-task-card h4 {
      margin: 0 0 8px;
      color: #273a54;
      font-size: 13px;
      font-weight: 800;
    }

    .ud-task-card p {
      flex: 1;
      margin: 0 0 18px;
      color: #7c899c;
      font-size: 11px;
      line-height: 1.8;
    }

    .ud-task-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      padding: 11px 12px;
      border: 1px solid #dce4ef;
      border-radius: 8px;
      color: #2a4b79;
      background: white;
      font-size: 11px;
      font-weight: 750;
      cursor: pointer;
    }

    .ud-task-button:hover,
    .ud-task-button.selected {
      border-color: #244775;
      color: white;
      background: #244775;
    }

    .ud-panel {
      margin-bottom: 24px;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: white;
      box-shadow: 0 3px 12px #1d355708;
    }

    .ud-panel-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 21px;
      border-bottom: 1px solid #edf0f5;
      background: #fbfcfe;
    }

    .ud-panel-bar {
      width: 4px;
      height: 31px;
      border-radius: 5px;
      background: var(--blue);
    }

    .ud-panel-header h3 {
      margin: 0;
      color: #273a54;
      font-size: 14px;
      font-weight: 800;
    }

    .ud-panel-header p {
      margin: 4px 0 0;
      color: #8794a6;
      font-size: 10px;
    }

    .ud-panel-body {
      padding: 22px;
      overflow-x: auto;
    }

    .ud-empty {
      display: flex;
      gap: 13px;
      align-items: flex-start;
      padding: 20px;
      border: 1px dashed #ccd8e7;
      border-radius: 11px;
      background: #fbfcfe;
    }

    .ud-empty-icon {
      display: grid;
      place-items: center;
      width: 39px;
      height: 39px;
      flex-shrink: 0;
      border-radius: 10px;
      background: #eaf1fb;
      color: #3867b2;
      font-size: 18px;
    }

    .ud-empty h4 {
      margin: 2px 0 6px;
      color: #2b3e58;
      font-size: 13px;
    }

    .ud-empty p {
      margin: 0;
      color: #7c899c;
      font-size: 11px;
      line-height: 1.8;
    }

    .ud-footer {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      padding-top: 18px;
      border-top: 1px solid var(--border);
      color: #8b97a8;
      font-size: 10px;
    }

    .ud-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 500;
      display: grid;
      place-items: center;
      padding: 18px;
      background: #0d1b30a8;
      backdrop-filter: blur(4px);
    }

    .ud-modal {
      width: min(570px, 100%);
      max-height: 88vh;
      overflow-y: auto;
      border-radius: 15px;
      background: white;
      box-shadow: 0 25px 80px #0004;
    }

    .ud-modal-header {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      padding: 22px;
      color: white;
      background: linear-gradient(115deg, #172d4e, #2b4d7b);
    }

    .ud-modal-kicker {
      color: #c0d3ed;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.4px;
      text-transform: uppercase;
    }

    .ud-modal-header h3 {
      margin: 7px 0 0;
      color: white;
      font-size: 20px;
    }

    .ud-modal-close {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border: 1px solid #ffffff44;
      border-radius: 8px;
      color: white;
      background: #ffffff12;
      cursor: pointer;
    }

    .ud-modal-body { padding: 23px; }

    .ud-help-step {
      display: flex;
      gap: 12px;
      margin-bottom: 19px;
    }

    .ud-step-number {
      display: grid;
      place-items: center;
      width: 31px;
      height: 31px;
      flex-shrink: 0;
      border-radius: 9px;
      color: #315b98;
      background: #eaf1fb;
      font-size: 12px;
      font-weight: 800;
    }

    .ud-help-step h4 {
      margin: 2px 0 5px;
      color: #2b3e58;
      font-size: 12px;
      font-weight: 800;
    }

    .ud-help-step p {
      margin: 0;
      color: #7a889c;
      font-size: 11px;
      line-height: 1.8;
    }

    .ud-help-tip {
      padding: 13px;
      border-radius: 9px;
      color: #5e728d;
      background: #f1f5fb;
      font-size: 11px;
      line-height: 1.8;
    }

    .ud-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 0 23px 22px;
    }

    .ud-modal-done {
      padding: 10px 18px;
      border: 0;
      border-radius: 8px;
      color: white;
      background: #244775;
      font-size: 11px;
      font-weight: 750;
      cursor: pointer;
    }

    @media (max-width: 1100px) {
      .ud-content { padding: 24px 20px; }
      .ud-navbar { padding: 13px 20px; }
      .ud-sidebar { width: 230px; }
      .ud-main { margin-left: 230px; }
      .ud-analytics, .ud-tasks { gap: 10px; }
      .ud-metric { padding: 13px; }
    }

    @media (max-width: 850px) {
      .ud-sidebar {
        width: 255px;
        transform: translateX(-105%);
        transition: transform .22s ease;
        box-shadow: 15px 0 35px #0002;
      }

      .ud-sidebar.open { transform: translateX(0); }
      .ud-main { margin-left: 0; }
      .ud-menu-button { display: inline-grid; place-items: center; }
      .ud-analytics { grid-template-columns: 1fr; }
      .ud-tasks { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 560px) {
      .ud-content { padding: 20px 14px; }
      .ud-navbar { padding: 12px 14px; }
      .ud-status, .ud-help-top span { display: none; }
      .ud-heading-row { flex-direction: column; }
      .ud-welcome { align-items: stretch; flex-direction: column; padding: 21px; }
      .ud-profile { align-self: flex-start; }
      .ud-tasks { grid-template-columns: 1fr; }
      .ud-panel-body { padding: 14px; }
      .ud-modal-body { padding: 18px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .ud-task-card, .ud-nav button, .ud-sidebar { transition: none; }
    }
  `;

  return (
    <div className="ud">
      <style>{styles}</style>

      {/* Sidebar navigation */}
      <aside className={`ud-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ud-brand">
          <div className="ud-brand-icon">
            <i className="bi bi-buildings" aria-hidden="true" />
          </div>
          <div>
            <div className="ud-brand-name">Business Workspace</div>
            <div className="ud-brand-subtitle">Operations Portal</div>
          </div>
        </div>

        <div className="ud-nav-label">Main Menu</div>

        <nav className="ud-nav" aria-label="Main navigation">
          <button
            type="button"
            className={activeTask === "overview" ? "active" : ""}
            onClick={() => navigate("overview")}
          >
            <i className="bi bi-grid-1x2" aria-hidden="true" />
            Dashboard Overview
          </button>
        </nav>

        <div className="ud-nav-label">Available Tasks</div>

        <nav className="ud-nav" aria-label="Available tasks">
          {tasks.map((task) => (
            <button
              type="button"
              key={task.id}
              className={activeTask === task.id ? "active" : ""}
              onClick={() => navigate(task.id)}
            >
              <i className={`bi ${task.icon}`} aria-hidden="true" />
              {task.title}
            </button>
          ))}
        </nav>

        <div className="ud-sidebar-bottom">
          <div className="ud-sidebar-help">
            <i className="bi bi-lightbulb" aria-hidden="true" />
            <h4>Need assistance?</h4>
            <p>Open the user guide to learn how to navigate this workspace.</p>
            <button type="button" onClick={() => setShowHelp(true)}>
              <i className="bi bi-book" aria-hidden="true" /> &nbsp;
              How to Use Dashboard
            </button>
          </div>
          <div className="ud-sidebar-footer">
            Business Workspace · User Portal
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="ud-main">
        {/* Top navigation bar */}
        <header className="ud-navbar">
          <div className="ud-navbar-left">
            <button
              type="button"
              className="ud-menu-button"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-list" aria-hidden="true" />
            </button>

            <div>
              <div className="ud-navbar-label">
                Workspace /{" "}
                {selectedTask ? selectedTask.title : "Overview"}
              </div>
              <h1 className="ud-navbar-title">User Dashboard</h1>
            </div>
          </div>

          <div className="ud-navbar-right">
            <div className="ud-status">
              <span className="ud-status-dot" />
              Workspace available
            </div>

            <button
              type="button"
              className="ud-help-top"
              onClick={() => setShowHelp(true)}
            >
              <i className="bi bi-question-circle" aria-hidden="true" />
              <span>How to use</span>
            </button>
          </div>
        </header>

        <div className="ud-content">
          <section className="ud-heading-row">
            <div>
              <div className="ud-eyebrow">Business Operations</div>
              <h2 className="ud-page-heading">
                {selectedTask ? selectedTask.title : "Workspace Overview"}
              </h2>
              <p className="ud-page-description">
                Manage your daily tasks from one organized workspace.
                Select a service to access its existing features.
              </p>
            </div>

            <div className="ud-access-label">
              <i className="bi bi-shield-check" aria-hidden="true" />{" "}
              &nbsp; User Workspace
            </div>
          </section>

          <section className="ud-welcome">
            <div>
              <div className="ud-welcome-label">Your business workspace</div>
              <h2>Welcome back, User!</h2>
              <p>
                Stay organized and access product management, finished
                products, and customer services from a central location.
              </p>
            </div>

            <div className="ud-profile">
              <img
                src="https://via.placeholder.com/80"
                alt="User profile"
              />
              <div>
                <div className="ud-profile-label">Signed in as</div>
                <p className="ud-profile-name">User</p>
              </div>
            </div>
          </section>

          {/* Analytics summary */}
          <section>
            <div className="ud-section-header">
              <h3>Workspace Analytics</h3>
              <p>A summary of your available tasks and current session.</p>
            </div>

            <div className="ud-analytics">
              <article className="ud-metric">
                <div
                  className="ud-metric-icon"
                  style={{ color: "#3867b2", background: "#edf3ff" }}
                >
                  <i className="bi bi-grid" aria-hidden="true" />
                </div>
                <div>
                  <div className="ud-metric-label">Available Task Areas</div>
                  <div className="ud-metric-value">{tasks.length}</div>
                  <div className="ud-metric-note">
                    Three business service areas
                  </div>
                </div>
              </article>

              <article className="ud-metric">
                <div
                  className="ud-metric-icon"
                  style={{ color: "#17846c", background: "#e8f7f0" }}
                >
                  <i className="bi bi-window-stack" aria-hidden="true" />
                </div>
                <div>
                  <div className="ud-metric-label">Selected Task</div>
                  <div
                    className="ud-metric-value"
                    style={{ fontSize: 16, paddingTop: 4 }}
                  >
                    {selectedTask ? "1" : "0"}
                  </div>
                  <div className="ud-metric-note">
                    {selectedTask ? selectedTask.title : "Overview selected"}
                  </div>
                </div>
              </article>

              <article className="ud-metric">
                <div
                  className="ud-metric-icon"
                  style={{ color: "#ae751e", background: "#fff4df" }}
                >
                  <i className="bi bi-person-check" aria-hidden="true" />
                </div>
                <div>
                  <div className="ud-metric-label">Interface Status</div>
                  <div className="ud-metric-value" style={{ fontSize: 19 }}>
                    Ready
                  </div>
                  <div className="ud-metric-note">
                    Dashboard is available for use
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* Task cards */}
          <section>
            <div className="ud-section-header">
              <h3>Available Tasks</h3>
              <p>Select a task below or use the sidebar navigation.</p>
            </div>

            <div className="ud-tasks">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className={`ud-task-card ${
                    activeTask === task.id ? "selected" : ""
                  }`}
                >
                  <div
                    className="ud-task-icon"
                    style={{ color: task.color, background: task.bg }}
                  >
                    <i className={`bi ${task.icon}`} aria-hidden="true" />
                  </div>

                  <h4>{task.title}</h4>
                  <p>{task.description}</p>

                  <button
                    type="button"
                    className={`ud-task-button ${
                      activeTask === task.id ? "selected" : ""
                    }`}
                    onClick={() => navigate(task.id)}
                  >
                    <span>
                      {activeTask === task.id
                        ? "Currently selected"
                        : "Open task"}
                    </span>
                    <i
                      className={`bi ${
                        activeTask === task.id
                          ? "bi-check-circle"
                          : "bi-arrow-right"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Existing business components */}
          {activeTask === "products" && (
            <section className="ud-panel">
              <div className="ud-panel-header">
                <div className="ud-panel-bar" />
                <div>
                  <h3>Product Management</h3>
                  <p>Existing product catalog tools</p>
                </div>
              </div>
              <div className="ud-panel-body">
                <CatalogPage />
              </div>
            </section>
          )}

          {activeTask === "finished" && (
            <section className="ud-panel">
              <div className="ud-panel-header">
                <div
                  className="ud-panel-bar"
                  style={{ background: "#17846c" }}
                />
                <div>
                  <h3>Finished Products</h3>
                  <p>Existing finished product tools</p>
                </div>
              </div>
              <div className="ud-panel-body">
                <FinishedProduct />
              </div>
            </section>
          )}

          {activeTask === "services" && (
            <section className="ud-panel">
              <div className="ud-panel-header">
                <div
                  className="ud-panel-bar"
                  style={{ background: "#ae751e" }}
                />
                <div>
                  <h3>Customer Services</h3>
                  <p>Existing customer service tools</p>
                </div>
              </div>
              <div className="ud-panel-body">
                <CustomerServices />
              </div>
            </section>
          )}

          {activeTask === "overview" && (
            <section className="ud-empty">
              <div className="ud-empty-icon">
                <i className="bi bi-cursor" aria-hidden="true" />
              </div>
              <div>
                <h4>Your workspace is ready</h4>
                <p>
                  Choose Product Management, Finished Products, or Customer
                  Services from the sidebar or task cards above. The selected
                  section will appear here.
                </p>
              </div>
            </section>
          )}

          <footer className="ud-footer">
            <span>Business Workspace · User Portal</span>
            <span>Productivity · Organization · Service</span>
          </footer>
        </div>
      </main>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            border: 0,
            background: "#0d1b3066",
          }}
        />
      )}

      {/* Dashboard help popup */}
      {showHelp && (
        <div
          className="ud-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowHelp(false);
            }
          }}
        >
          <section
            className="ud-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ud-help-title"
          >
            <header className="ud-modal-header">
              <div>
                <div className="ud-modal-kicker">User Guide</div>
                <h3 id="ud-help-title">How to Use Your Dashboard</h3>
              </div>
              <button
                type="button"
                className="ud-modal-close"
                aria-label="Close help popup"
                onClick={() => setShowHelp(false)}
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </header>

            <div className="ud-modal-body">
              {[
                {
                  title: "Understand the overview",
                  description:
                    "The analytics cards summarize the task areas available and your current selection. They are interface statistics, not live sales or inventory figures.",
                },
                {
                  title: "Navigate using the sidebar",
                  description:
                    "Choose Product Management, Finished Products, or Customer Services. On mobile, tap the menu icon in the top navbar to reveal the sidebar.",
                },
                {
                  title: "Open and use a task",
                  description:
                    "The selected task appears below the task cards. Continue using the existing tools inside that section.",
                },
                {
                  title: "Return to the overview",
                  description:
                    "Choose Dashboard Overview in the sidebar to return to the main dashboard.",
                },
              ].map((step, index) => (
                <div className="ud-help-step" key={step.title}>
                  <div className="ud-step-number">{index + 1}</div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}

              <div className="ud-help-tip">
                <strong>Helpful tip:</strong> Use the question-mark button in
                the top navbar whenever you need these instructions again.
              </div>
            </div>

            <div className="ud-modal-footer">
              <button
                type="button"
                className="ud-modal-done"
                onClick={() => setShowHelp(false)}
              >
                Got it
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
