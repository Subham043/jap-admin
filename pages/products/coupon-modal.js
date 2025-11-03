import * as React from "react";
import { Alert, Box, CircularProgress, FilledInput, InputAdornment, Snackbar, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import axios from "axios";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import Cookies from "js-cookie";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";

export const couponSchema = yup
  .object({
    discount: yup
      .string()
      .typeError("Discount must contain number only")
      .matches(/^[0-9]+$/, "Please enter a valid discount (e.g. 50)")
      .required("Discount is required"),
    maximum_dicount_in_price: yup
      .string()
      .typeError("Maximum Discount in price must contain number only")
      .matches(
        /^[0-9]+$/,
        "Please enter a valid maximum discount in price (e.g. 500)"
      )
      .nullable(),
    maximum_number_of_use: yup
      .string()
      .typeError("Maximum number of use per person must contain number only")
      .matches(
        /^[0-9]+$/,
        "Please enter a valid maximum number of use per person (e.g. 500)"
      )
      .nullable(),
    name: yup
      .string()
      .typeError("Coupon Name must contain characters only")
      .required("Coupon Name is required"),
    code: yup
      .string()
      .typeError("Coupon Code must contain characters only")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "Please enter a valid coupon code (letters and numbers only)"
      )
      .required("Coupon Code is required"),
    description: yup
      .string()
      .typeError("Coupon Description must contain characters only")
      .nullable(),
    is_active: yup
      .string()
      .oneOf(["0", "1"], "Is active must be either 0 or 1")
      .required("Is active is required")
      .default("1"),
  })
  .required();

// Create new user Modal
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function CouponModal({ handleClose, modal, refetch }) {
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const form = useForm({
    resolver: yupResolver(couponSchema),
    values: {
      discount: modal.status && modal.data ? modal.data.discount : 0,
      maximum_dicount_in_price: modal.status && modal.data ? modal.data.maximum_dicount_in_price : null,
      maximum_number_of_use: modal.status && modal.data ? modal.data.maximum_number_of_use : null,
      description: modal.status && modal.data ? modal.data.description : null,
      is_active: modal.status && modal.data ? modal.data.is_active : "1",
      name: modal.status && modal.data ? modal.data.name : "",
      code: modal.status && modal.data ? modal.data.code : "",
    },
  });

  const closeModal = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    form.reset({
      name: "",
      code: "",
      description: null,
      is_active: "1",
      discount: 0,
      maximum_dicount_in_price: null,
      maximum_number_of_use: null,
    });
    handleClose();
  };
  

  const handleSubmit = async () => {

    try {
      const accessToken = Cookies.get("japAccessToken");

      if (accessToken) {
        const response = await axios.post(
          modal.type === "update"
            ? `https://server-api.jap.bio/api/v1/coupon/update/${modal.data.id}`
            : "https://server-api.jap.bio/api/v1/coupon/create",
          {
            ...form.getValues(),
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSuccessMsg(response.data.message);
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
    <>
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
              {modal.type === "create" ? "Create" : "Update"} Coupon
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

          <Box
            component="form"
            noValidate
            onSubmit={form.handleSubmit(handleSubmit)}
            mt={1}
          >
            <Box
              sx={{
                background: "#fff",
                padding: "20px 20px",
                borderRadius: "8px",
              }}
              className="dark-BG-101010"
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={12} lg={6}>
                  <Typography
                    as="h5"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "12px",
                    }}
                  >
                    Coupon Name
                  </Typography>

                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="name"
                        label="Coupon Name"
                        name="name"
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
                <Grid item xs={12} md={12} lg={6}>
                  <Typography
                    as="h5"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "12px",
                    }}
                  >
                    Coupon Code
                  </Typography>

                  <Controller
                    name="code"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="code"
                        label="Coupon Code"
                        name="code"
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
                <Grid item xs={12} md={12} lg={12}>
                  <Typography
                    as="h5"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "12px",
                    }}
                  >
                    Description
                  </Typography>

                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="description"
                        label="Description"
                        name="description"
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
                <Grid item xs={12} md={12} lg={6}>
                  <Typography
                    as="h5"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "12px",
                    }}
                  >
                    Is Active
                  </Typography>
                  <FormControl fullWidth>
                    <Controller
                      name="is_active"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error ? fieldState.error.message : null
                          }
                          inputProps={{
                            name: "isActive",
                            id: "isActive",
                            style: { borderRadius: 8 },
                          }}
                        >
                          <MenuItem value="1">Active</MenuItem>
                          <MenuItem value="0">Inactive</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12} lg={6}>
                  <Typography
                    as="h5"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "12px",
                    }}
                  >
                    Discount
                  </Typography>

                  <Controller
                    name="discount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <FilledInput
                        name="discount"
                        required
                        fullWidth
                        id="discount"
                        inputProps={{
                          "aria-label": "Discount",
                        }}
                        label="Discount"
                        endAdornment={
                          <InputAdornment position="end">%</InputAdornment>
                        }
                        autoFocus
                        InputProps={{
                          style: { borderRadius: 8 },
                          "aria-label": "Discount",
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
                <Grid item xs={12} md={12} lg={6}>
                  <Typography
                    as="h5"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "12px",
                    }}
                  >
                    Max Discount in Price
                  </Typography>

                  <Controller
                    name="maximum_dicount_in_price"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="maximum_dicount_in_price"
                        label="Max Discount in Price"
                        name="maximum_dicount_in_price"
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
                <Grid item xs={12} md={12} lg={6}>
                  <Typography
                    as="h5"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "12px",
                    }}
                  >
                    Maximum Number of Use per Person
                  </Typography>

                  <Controller
                    name="maximum_number_of_use"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="maximum_number_of_use"
                        label="Maximum Number of Use per Person"
                        name="maximum_number_of_use"
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
                        <AddIcon
                          sx={{
                            position: "relative",
                            top: "-2px",
                          }}
                          className="mr-5px"
                        />{" "}
                        {modal.type === "create" ? "Create" : "Update"} Coupon
                      </>
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </BootstrapDialog>
    </>
  );
}

CouponModal.propTypes = {
  modal: PropTypes.oneOfType([
    PropTypes.shape({
      status: PropTypes.bool.isRequired,
      type: PropTypes.oneOf(["create"]).isRequired,
    }),
    PropTypes.shape({
      status: PropTypes.bool.isRequired,
      type: PropTypes.oneOf(["update"]).isRequired,
      data: PropTypes.shape({
        name: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
        discount: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
      }).isRequired,
    }),
  ]).isRequired,
  handleClose: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};