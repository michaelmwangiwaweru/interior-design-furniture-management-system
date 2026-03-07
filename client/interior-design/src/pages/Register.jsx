import React, { useState } from "react";
import { registerUser } from "../api/auth";

export default function Register() {

  const [user, setUser] = useState({
    email: "",
    password: "",
    role: "ADMIN"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerUser(user);
    alert("User registered");
  };

  return (
    <div style={{ maxWidth: 350, margin: "50px auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Email"
          value={user.email}
          onChange={e => setUser({...user, email: e.target.value})}
        /><br/><br/>

        <input 
          placeholder="Password"
          type="password"
          value={user.password}
          onChange={e => setUser({...user, password: e.target.value})}
        /><br/><br/>

        <select 
          value={user.role}
          onChange={e => setUser({...user, role: e.target.value})}
        >
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
        </select><br/><br/>

        <button>Register</button>
      </form>
    </div>
  );
}
