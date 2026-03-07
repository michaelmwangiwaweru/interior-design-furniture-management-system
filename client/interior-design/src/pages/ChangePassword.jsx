import React, { useState } from "react";
import { changePassword } from "../api/auth";

export default function ChangePassword() {

  const [newPassword, setNewPassword] = useState("");

  const submit = async () => {
    await changePassword(newPassword);
    alert("Password changed successfully");
  };

  return (
    <div style={{ maxWidth: 350, margin: "50px auto" }}>
      <h2>Change Password</h2>

      <input 
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      /><br/><br/>

      <button onClick={submit}>Update</button>
    </div>
  );
}
