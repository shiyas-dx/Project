import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";

function Activate() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [called, setCalled] = useState(false);

  useEffect(() => {
    if (called) return;  // prevents duplicate calls
    setCalled(true);

    const activateAccount = async () => {
      try {
        const res = await api.get(`/activate/${uid}/${token}/`);

        // if backend says already activated
        if (res.data.message === "Account already activated") {
          Swal.fire("Info", "Account already activated", "info").then(() =>
            navigate("/login")
          );
        } else {
          Swal.fire("Success", "Account activated successfully", "success").then(
            () => navigate("/login")
          );
        }
      } catch (error) {
        Swal.fire("Error", "Activation link is invalid or expired", "error");
      }
    };

    activateAccount();
  }, [uid, token, navigate, called]);

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
      Activating your account...
    </div>
  );
}

export default Activate;
