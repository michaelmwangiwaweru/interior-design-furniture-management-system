import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import AddRoom from "./components/room/AddRoom";
import ExistingRooms from "./components/room/ExistingRooms";
import Home from "./components/home/Home";
import EditRoom from "./components/room/EditRoom";
import RoomListing from "./components/room/RoomListing";
import Dashboard from "./components/room/Dahboard";

import CustomerServices from "./components/service/CustomerServices";
import Sales from "./components/service/Sales";
import Orders from "./components/service/Orders";
import Products from "./components/service/Products";
import Inventory from "./components/service/Inventory";
import FinishedProduct from "./components/service/FinishedProduct";
import ProductCards from "./components/service/ProductCards";
import CatalogPage from "./components/service/CatalogPage";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Login from "./components/admin/login"; 


import LoginPage from './components/auth/LoginPage';

import WelcomeDashboard from "./components/auth/WelcomeDashboard";


import SignupPage from './components/auth/SignupPage';


import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/admin/UserDashboard';
import BillingForm  from "./components/service/BillingForm";
import PaymentPage  from "./components/service/PaymentPage";


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/existing-rooms" element={<ExistingRooms />} />
          <Route path="/add-room" element={<AddRoom />} />
          <Route path="/edit-room/:id" element={<EditRoom />} />
          <Route path="/browse-all-rooms" element={<RoomListing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer-services" element={<CustomerServices />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/finishedproduct" element={<FinishedProduct />} />
          <Route path="/cardproduct" element={<ProductCards />} />
          <Route path="/catalog" element={<CatalogPage />} />
           <Route path="/login" element={<Login />} />

<Route path="/loginpage" element={<LoginPage/>} />
            <Route path="/signup" element={ <SignupPage/>} />
                <Route path="/dashboard2" element={<WelcomeDashboard />} />

                <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/user/dashboard" element={<UserDashboard />} />




<Route path="/billing" element={<BillingForm />} />
        <Route path="/payment" element={<PaymentPage />} />


        </Routes>
      </main>
      <Footer />
       
        
        
        
      
    </Router>
    
  );
}

export default App;