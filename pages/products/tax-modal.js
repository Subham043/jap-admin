import * as React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FilledInput,
  InputAdornment,
  Snackbar,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import { useState } from "react";
import axios from "axios";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Cookies from "js-cookie";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";

export const taxSchema = yup
  .object({
    tax_in_percentage: yup
      .string()
      .typeError("Tax must contain number only")
      .matches(/^[0-9]+$/, "Please enter a valid tax (e.g. 50)")
      .required("Tax is required"),
  })
  .required();

// Create new user Modal
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function TaxModal({ handleClose, modal, refetch }) {
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const form = useForm({
    resolver: yupResolver(taxSchema),
    values: {
      tax_in_percentage:
        modal.status && modal.data ? modal.data.tax_in_percentage : 0,
    },
  });

  const closeModal = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    handleClose();
  };

  const handleSubmit = async () => {
    try {
      const accessToken = Cookies.get("japAccessToken");
      if (accessToken) {
        const response = await axios.post(
          "https://server-api.jap.bio/api/v1/tax/",
          {
            ...form.getValues(),
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json", // Since we are sending JSON data
            },
          }
        );
        setSuccessMsg(response.data.message);

        // Fetch updated tax data from the server
        // Add your fetchTax() function here if you have it
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.message) {
          setErrorMsg(error.response.data.message);
          if (error.response.status === 401 || error.response.status === 401) {
            redirectLoginPage();
          }
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
    <BootstrapDialog
      onClose={closeModal}
      aria-labelledby="customized-dialog-title"
      open={modal.status}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#EDEFF5",
            borderRadius: "8px",
            padding: "20px 20px",
          }}
          className="bg-black"
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{
              fontWeight: "500",
              fontSize: "18px",
            }}
          >
            Update Tax
          </Typography>

          <IconButton aria-label="remove" size="small" onClick={closeModal}>
            <ClearIcon />
          </IconButton>
        </Box>

        <Snackbar
          open={successMsg !== null}
          autoHideDuration={500}
          onClose={() => {
            refetch();
            closeModal();
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

        <Box component="form" noValidate onSubmit={form.handleSubmit(handleSubmit)} mt={1}>
          <Box
            sx={{
              background: "#fff",
              padding: "20px 20px",
              borderRadius: "8px",
            }}
            className="dark-BG-101010"
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12}>
                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mb: "12px",
                  }}
                >
                  Tax
                </Typography>

                <Controller
                  name="tax_in_percentage"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <FilledInput
                      name="tax_in_percentage"
                      required
                      fullWidth
                      id="tax_in_percentage"
                      inputProps={{
                        "aria-label": "Tax",
                      }}
                      label="Tax"
                      endAdornment={
                        <InputAdornment position="end">%</InputAdornment>
                      }
                      autoFocus
                      InputProps={{
                        style: { borderRadius: 8 },
                        "aria-label": "Tax",
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

              <Grid item xs={12} textAlign="end">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={form.formState.isSubmitting}
                  sx={{
                    mt: 1,
                    textTransform: "capitalize",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "13px",
                    padding: "12px 20px",
                    color: "#fff !important",
                  }}
                >
                  {form.formState.isSubmitting ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    <>
                      <SaveIcon
                        sx={{
                          position: "relative",
                          top: "-2px",
                        }}
                        className="mr-5px"
                      />{" "}
                      Update Tax
                    </>
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </BootstrapDialog>
  );
}

TaxModal.propTypes = {
  modal: PropTypes.oneOfType([
    PropTypes.shape({
      status: PropTypes.bool.isRequired, // status can be false here
    }),
    PropTypes.shape({
      status: PropTypes.bool.isRequired, // true case
      data: PropTypes.shape({
        tax_in_percentage: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ]).isRequired,

  handleClose: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};
