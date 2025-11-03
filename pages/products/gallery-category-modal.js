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

export const galleryCategorySchema = yup
  .object({
    name: yup
      .string()
      .typeError("Category Name must contain characters only")
      .required("Category Name is required"),
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

export default function GalleryCategoryModal({ handleClose, modal, refetch }) {
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const form = useForm({
    resolver: yupResolver(galleryCategorySchema),
    values: {
      name: modal.type === "update" ? modal.data.name : "",
    },
  });

  const closeModal = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    form.reset({ name: "" });
    handleClose();
  };

  const handleSubmit = async () => {
    try {
      const accessToken = Cookies.get("japAccessToken");

      if (accessToken) {
        const response = await axios.post(
          modal.type === "update"
            ? `https://server-api.jap.bio/api/v1/gallery-category/update/${modal.data.id}`
            : "https://server-api.jap.bio/api/v1/gallery-category/create",
          {
            ...form.getValues(),
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
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
            {modal.type === "create" ? "Create" : "Update"} Gallery Category
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
              <Grid item xs={12} md={12} lg={12}>
                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mb: "12px",
                  }}
                >
                  Category Name
                </Typography>

                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      required
                      fullWidth
                      id="name"
                      label="Gallery Category Name"
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
                      {modal.type === "create" ? "Create" : "Update"} Category
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

GalleryCategoryModal.propTypes = {
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
    id: PropTypes.number.isRequired,
   }).isRequired,
  }),
 ]).isRequired,
 handleClose: PropTypes.func.isRequired,
 refetch: PropTypes.func.isRequired,
};