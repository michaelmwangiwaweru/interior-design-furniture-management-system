import React, { useState } from "react";
import { login, getRoleRedirect } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(email, password);

    const res = await getRoleRedirect();
    nav(res.data); // "/manager/dashboard" or "/admin/dashboard" or "/change-password"
  };

  return (
    <div style={{ maxWidth: 350, margin: "50px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        /><br/><br/>

        <input 
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        /><br/><br/>

        <button>Login</button>
      </form>
    </div>
  );
}
