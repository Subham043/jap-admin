import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import { Alert, CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import axios from "axios";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export const loginSchema = yup
  .object({
    email: yup
      .string()
      .typeError("Email must contain characters only")
      .email("Please enter a valid email (e.g. user@domain.com)")
      .matches(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email (e.g. user@domain.com)"
      )
      .required("Email is required"),
    password: yup
      .string()
      .typeError("Password must contain characters only")
      .required("Password is required"),
  })
  .required();


const SignInForm = () => {

  const router = useRouter();
  const redirectPath =
    router.query.redirect && router.query.redirect !== "/authentication/sign-in"
      ? router.query.redirect
      : "/";
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const form = useForm({
    resolver: yupResolver(loginSchema),
  });

  const handleSubmit = async () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const response = await axios.post('https://server-api.jap.bio/api/v1/auth/login', {
        ...form.getValues()
      });
  
      // Store the access token in local storage
      setSuccessMsg(response.data.message);
      Cookies.set("japAccessToken", response.data.token, {
        expires: 1, // days
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('login_', '1');
      form.reset({email: '', password: ''})

  
      // Redirect to home page
      // window.location.href = '/'; // Replace '/home' with the actual URL of your home page
      router.push(redirectPath);
    } catch (error) {
      if (error.response) {
        if(error.response.data.message){
          setErrorMsg(error.response.data.message);
        }
        if (error.response.data.errors) {
          Object.entries(error.response.data.errors).forEach(
            ([field, messages]) => {
              form.setError(field, {
                type: "server",
                message: messages[0], // first message from array
              });
            }
          );
        }
        // Handle error response
      } else {
        setErrorMsg(error.message);
      }
    }
  };

  return (
    <>
      <div className="authenticationBox">
        <Box
          component="main"
          sx={{
            maxWidth: "510px",
            ml: "auto",
            mr: "auto",
            padding: "50px 0 100px",
          }}
        >
          <Grid item xs={12} md={12} lg={12} xl={12}>
            <div style={{margin: "auto", textAlign: "center"}}>
              <Image
                src="/images/logo.png"
                alt="favicon"
                width={100}
                height={100}
                objectFit="contain"
                className="my_logo"
                style={{ width: "100px" }}
              />
            </div>
            {successMsg && <Alert severity="success">{successMsg}</Alert>}
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <Box mt={1}>
              <Box
                component="form"
                noValidate
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <Box
                  sx={{
                    background: "#fff",
                    padding: "30px 20px",
                    borderRadius: "10px",
                    mb: "20px",
                  }}
                  className="bg-black"
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "10px",
                          display: "block",
                        }}
                      >
                        Email
                      </Typography>

                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            InputProps={{
                              style: { borderRadius: 8 },
                            }}
                            error={!!fieldState.error}
                            helperText={
                              fieldState.error ? fieldState.error.message : null
                            }
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "10px",
                          display: "block",
                        }}
                      >
                        Password
                      </Typography>
                      <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            InputProps={{
                              style: { borderRadius: 8 },
                            }}
                            error={!!fieldState.error}
                            helperText={
                              fieldState.error ? fieldState.error.message : null
                            }
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={6} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox value="allowExtraEmails" color="primary" />
                      }
                      label="Remember me."
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={form.formState.isSubmitting}
                  sx={{
                    mt: 2,
                    textTransform: "capitalize",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "16px",
                    padding: "12px 10px",
                    color: "#fff !important",
                  }}
                >
                  {form.formState.isSubmitting ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    <>Sign In</>
                  )}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Box>
      </div>
    </>
  );
};

export default SignInForm;
