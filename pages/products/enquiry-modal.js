import * as React from "react";
import { Alert, Box, CircularProgress, Snackbar, Typography } from "@mui/material";
import PropTypes from "prop-types";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
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

export const enquirySchema = yup
  .object({
    phone: yup
      .string()
      .typeError("Phone must contain number only")
      .matches(
        /^[0-9]+$/,
        "Please enter a valid phone number (e.g. 9876543210)"
      )
      .required("Phone is required"),
    email: yup
      .string()
      .typeError("Email must contain characters only")
      .email("Please enter a valid email (e.g. user@domain.com)")
      .matches(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email (e.g. user@domain.com)"
      )
      .required("Email is required"),
    name: yup
      .string()
      .typeError("Name must contain characters only")
      .required("Name is required"),
    company_name: yup
      .string()
      .typeError("Company Name must contain characters only")
      .required("Company Name is required"),
    company_website: yup
      .string()
      .typeError("Company Website must contain characters only")
      .url("Please enter a valid website URL (e.g. https://www.example.com)")
      .required("Company Website is required"),
    designation: yup
      .string()
      .typeError("Designation must contain characters only")
      .required("Designation is required"),
    product: yup
      .string()
      .typeError("Product must contain characters only")
      .required("Product is required"),
    quantity: yup
      .string()
      .typeError("Quantity must contain characters only")
      .required("Quantity is required"),
    gst: yup
      .string()
      .typeError("GST must contain characters only")
      .required("GST is required"),
    certification: yup
      .string()
      .typeError("Certification must contain characters only")
      .required("Certification is required"),
    address: yup
      .string()
      .typeError("Address must contain characters only")
      .required("Address is required"),
    message: yup
      .string()
      .typeError("Message must contain characters only")
      .nullable(),
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

export default function EnquiryModal({ modal, handleClose, refetch }) {
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { redirectLoginPage } = useCheckUnauthenticated();

  const form = useForm({
    resolver: yupResolver(enquirySchema),
    values: {
      name: modal.status && modal.data ? modal.data.name : "",
      email: modal.status && modal.data ? modal.data.email : "",
      phone: modal.status && modal.data ? modal.data.phone : "",
      company_name: modal.status && modal.data ? modal.data.company_name : "",
      company_website:
        modal.status && modal.data ? modal.data.company_website : "",
      designation: modal.status && modal.data ? modal.data.designation : "",
      product: modal.status && modal.data ? modal.data.product : "",
      quantity: modal.status && modal.data ? modal.data.quantity : "",
      gst: modal.status && modal.data ? modal.data.gst : "",
      certification: modal.status && modal.data ? modal.data.certification : "",
      address: modal.status && modal.data ? modal.data.address : "",
      message:
        modal.status && modal.data && modal.data.message
          ? modal.data.message
          : null,
    },
  });

  const closeModal = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      company_name: "",
      company_website: "",
      designation: "",
      product: "",
      quantity: "",
      gst: "",
      certification: "",
      address: "",
      message: null,
    });
    handleClose();
  };

  const handleSubmit = async () => {

    try {

      const accessToken = Cookies.get("japAccessToken");
      if (accessToken) {
        const response = await axios.post(
          modal.type === "update"
            ? `https://server-api.jap.bio/api/v1/enquiry/update/${modal.data.id}`
            : "https://server-api.jap.bio/api/v1/enquiry/create",
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
              {modal.type === "create" ? "Create" : "Update"} Enquiry
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
                    Name
                  </Typography>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="name"
                        label="Name"
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
                    Company Name
                  </Typography>
                  <Controller
                    name="company_name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="company_name"
                        label="Company Name"
                        name="company_name"
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
                    Company_Website
                  </Typography>
                  <Controller
                    name="company_website"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="company_website"
                        label="Company Website"
                        name="company_website"
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
                        label="Email"
                        name="email"
                        type="email"
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
                    Phone
                  </Typography>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="phone"
                        label="Phone"
                        name=""
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
                    Designation
                  </Typography>
                  <Controller
                    name="designation"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="designation"
                        label="Designation"
                        name="designation"
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
                    Product
                  </Typography>
                  <Controller
                    name="product"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="product"
                        label="Product"
                        name="product"
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
                    Quantity
                  </Typography>
                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="quantity"
                        label="Quantity"
                        name="quantity"
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
                    GST
                  </Typography>
                  <Controller
                    name="gst"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="gst"
                        label="GST"
                        name="gst"
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
                    Certification Type
                  </Typography>
                  <Controller
                    name="certification"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="certification"
                        label="Certification Type"
                        name="certification"
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
                    Address
                  </Typography>
                  <Controller
                    name="address"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="address"
                        label="Address"
                        name="address"
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
                    Message
                  </Typography>
                  <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        required
                        fullWidth
                        id="message"
                        label="Message"
                        name="message"
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
                        {modal.type === "create" ? "Create" : "Update"} Enquiry
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

EnquiryModal.propTypes = {
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
        email: PropTypes.string.isRequired,
        phone: PropTypes.string.isRequired,
        company_name: PropTypes.string.isRequired,
        company_website: PropTypes.string.isRequired,
        designation: PropTypes.string.isRequired,
        product: PropTypes.string.isRequired,
        quantity: PropTypes.string.isRequired,
        gst: PropTypes.string.isRequired,
        certification: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
      }).isRequired,
    }),
  ]).isRequired,
  handleClose: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};