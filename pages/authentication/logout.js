import { Alert, CircularProgress, Snackbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Button from "@mui/material/Button";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useCallback } from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from 'axios';

export default function Logout() {
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const redirectLoginPage = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    Cookies.remove("japAccessToken");
    router.push("/authentication/sign-in");
  };

  const logoutHandler = useCallback(async ()=>{
    // /auth/logout
    setLoading(true);
    try {
      const accessToken = Cookies.get("japAccessToken");

      if (accessToken) {
        const response = await axios.post(
          "https://server-api.jap.bio/api/v1/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSuccessMsg(response.data.message);

        // Fetch updated data
      }
    } catch (error) {
     if (error.response) {
       if (error.response.data.message) {
         setErrorMsg(error.response.data.message);
         if (error.response.status === 401 || error.response.status === 401) {
           redirectLoginPage();
         }
       }
       // Handle error response
     } else {
       setErrorMsg(error.message);
     } 
    }finally {
      setLoading(false);
    }
  }, [])

  return (
    <>
      <div className="authenticationBox">
        <Box
          component="main"
          sx={{
            padding: "70px 0 100px",
          }}
        >
          <Box
            sx={{
              background: "#fff",
              padding: "30px 20px",
              borderRadius: "10px",
              maxWidth: "510px",
              ml: "auto",
              mr: "auto",
              textAlign: "center",
            }}
            className="bg-black"
          >
            <Box>
              <img
                src="/images/logo.png"
                alt="Black logo"
                className="black-logo"
              />

              <img
                src="/images/logo-white.png"
                alt="White logo"
                className="white-logo"
              />
            </Box>

            <Snackbar
              open={successMsg !== null}
              autoHideDuration={500}
              onClose={() => {
                redirectLoginPage();
              }}
            >
              <Alert
                onClose={() => {
                  setSuccessMsg(null);
                }}
                severity="success"
                variant="filled"
                sx={{ width: "100%" }}
              >
                {successMsg}
              </Alert>
            </Snackbar>

            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

            <Typography as="h1" fontSize="20px" fontWeight="500" mt={1}>
              Are you sure you want to logout?
            </Typography>

            <Button
              variant="contained"
              disabled={loading}
              onClick={logoutHandler}
              sx={{
                mt: 3,
                mr: 2,
                textTransform: "capitalize",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "16px",
                padding: "12px 10px",
                color: "#fff !important",
              }}
            >
              {loading ? <CircularProgress color="inherit" /> : <>Sign Out</>}
            </Button>
            <Button
              variant="outlined"
              disabled={loading}
              onClick={() => router.push("/")}
              sx={{
                mt: 3,
                textTransform: "capitalize",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "16px",
                padding: "12px 10px",
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </div>
    </>
  );
}
