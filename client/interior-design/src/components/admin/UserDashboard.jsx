import React, { useState } from "react";
import CatalogPage from "../service/CatalogPage";
import FinishedProduct from "../service/FinishedProduct";
import CustomerServices from "../service/CustomerServices";

function UserDashboard() {
  const [showProducts, setShowProducts] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [showCustomerServices, setShowCustomerServices] = useState(false);

  return (
    <div className="container mt-4">
      <h3>User Dashboard</h3>

      {/* Sidebar-style buttons */}
      <div className="mb-3 d-flex gap-2">
        <button
          className="btn btn-dark"
          onClick={() => setShowProducts(!showProducts)}
        >
          {showProducts ? "Hide Product Management" : "Product Management"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setShowFinished(!showFinished)}
        >
          {showFinished ? "Hide Finished Products" : "Finished Products"}
        </button>

        <button
          className="btn btn-info"
          onClick={() => setShowCustomerServices(!showCustomerServices)}
        >
          {showCustomerServices ? "Hide Customer Services" : "Customer Services"}
        </button>
      </div>

      {/* Profile picture on left */}
      <div className="d-flex mb-3 align-items-start">
        <div style={{ marginRight: "20px", textAlign: "center" }}>
          <img
            src="https://via.placeholder.com/80" // replace with actual user profile if needed
            alt="Profile"
            style={{ width: "80px", height: "80px", borderRadius: "50%" }}
          />
        </div>

        <div>
          <strong>Welcome, User!</strong>
          <br />
          {/* Add email or other user info if needed */}
        </div>
      </div>

      {/* Conditionally render sections */}
      {showProducts && (
        <div className="card p-3 mb-3">
          <CatalogPage />
        </div>
      )}

      {showFinished && (
        <div className="card p-3 mb-3">
          <FinishedProduct />
        </div>
      )}

      {showCustomerServices && (
        <div className="card p-3 mb-3">
          <CustomerServices />
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
