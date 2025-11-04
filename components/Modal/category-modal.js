import * as React from "react";
import { Alert, Box, CircularProgress, Snackbar, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import PropTypes from "prop-types";
import ClearIcon from "@mui/icons-material/Clear";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";

export const categorySchema = yup
  .object({
    name: yup
      .string()
      .typeError("Name must contain characters only")
      .required("Name is required"),
    slug: yup
      .string()
      .typeError("Slug must contain characters only")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "Please enter a valid slug (letters and numbers only)"
      )
      .required("Slug is required"),
    description: yup
      .string()
      .typeError("Description must contain characters only")
      .required("Description is required"),
    is_active: yup
      .string()
      .oneOf(["0", "1"], "Is active must be either 0 or 1")
      .required("Is active is required")
      .default("1"),
    meta_title: yup
      .string()
      .typeError("Meta Title must contain characters only")
      .nullable(),
    meta_keywords: yup
      .string()
      .typeError("Meta Keywords must contain characters only")
      .nullable(),
    banner_image: yup
      .mixed()
      .test("fileRequired", "File is required", (value) => {
        return value !== undefined;
      })
      .test("fileSize", "File size should be less than 3MB", (value) => {
        if (value !== undefined) {
          return value.size <= 3000000;
        }
        return false;
      })
      .test("fileFormat", "Please select a valid image", (value) => {
        if (value !== undefined) {
          return [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
          ].includes(value.type);
        }
        return false;
      })
      .transform((value) => {
        if (value !== undefined) {
          return value;
        }
        return undefined;
      }),
    icon_image: yup
      .mixed()
      .test("fileRequired", "File is required", (value) => {
        return value !== undefined;
      })
      .test("fileSize", "File size should be less than 3MB", (value) => {
        if (value !== undefined) {
          return value.size <= 3000000;
        }
        return false;
      })
      .test("fileFormat", "Please select a valid image", (value) => {
        if (value !== undefined) {
          return [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
          ].includes(value.type);
        }
        return false;
      })
      .transform((value) => {
        if (value !== undefined) {
          return value;
        }
        return undefined;
      }),
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

export default function CategoryModal({ modal, handleClose, refetch }) {
  const { redirectLoginPage } = useCheckUnauthenticated();
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const form = useForm({
    resolver: yupResolver(categorySchema),
    values: {
      name: modal.status && modal.data ? modal.data.name : "",
      slug: modal.status && modal.data ? modal.data.slug : "",
      description: modal.status && modal.data ? modal.data.description : "",
      is_active: modal.status && modal.data ? modal.data.is_active : "1",
      meta_title:
        modal.status && modal.data && modal.data.meta_title
          ? modal.data.meta_title
          : null,
      meta_keywords:
        modal.status && modal.data && modal.data.meta_keywords
          ? modal.data.meta_keywords
          : null,
      banner_image: undefined,
      icon_image: undefined,
    },
  });

  const closeModal = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    form.reset({
      name: "",
      description: "",
      slug: "",
      is_active: "1",
      meta_title: null,
      meta_keywords: null,
      banner_image: undefined,
      icon_image: undefined,
    });
    handleClose();
  };

  const handleSubmit = async () => {

    const formData = new FormData();
    formData.append("banner_image", form.getValues("banner_image"));
    formData.append("icon_image", form.getValues("icon_image"));
    formData.append("name", form.getValues("name"));
    formData.append("slug", form.getValues("slug"));
    formData.append("is_active", form.getValues("is_active"));
    formData.append("description", form.getValues("description"));
    if (form.getValues("meta_title")) {
      formData.append("meta_title", form.getValues("meta_title"));
    }
    if (form.getValues("meta_keywords")){
      formData.append("meta_keywords", form.getValues("meta_keywords"));
    }

    const accessToken = Cookies.get("japAccessToken");

    try {
      const response = await axios.post(
        modal.type === "update"
          ? `https://server-api.jap.bio/api/v1/category/update/${modal.data.id}`
          : "https://server-api.jap.bio/api/v1/category/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccessMsg(response.data.message);
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
              {modal.type === "create" ? "Create" : "Update"} Category
            </Typography>

            <IconButton aria-label="remove" size="small" onClick={closeModal}>
              <ClearIcon />
            </IconButton>
          </Box>
          <>
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

                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mt: 2,
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

                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mt: 2,
                    mb: "12px",
                  }}
                >
                  Slug
                </Typography>
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      fullWidth
                      id="slug"
                      label="Slug"
                      name="slug"
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

                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mt: 2,
                    mb: "12px",
                  }}
                >
                  Meta Title
                </Typography>
                <Controller
                  name="meta_title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      fullWidth
                      id="meta_title"
                      label="Meta Title"
                      name="meta_title"
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

                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mt: 2,
                    mb: "12px",
                  }}
                >
                  Meta Keywords
                </Typography>
                <Controller
                  name="meta_keywords"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      fullWidth
                      id="meta_keywords"
                      label="Meta Keywords"
                      name="meta_keywords"
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

                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mt: 2,
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

                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mt: 2,
                    mb: "12px",
                  }}
                >
                  Banner Image
                </Typography>
                <Controller
                  name="banner_image"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      fullWidth
                      id="banner_image"
                      type="file"
                      label="Banner Image"
                      name="banner_image"
                      InputProps={{
                        style: { borderRadius: 8 },
                      }}
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error ? fieldState.error.message : null
                      }
                      onChange={(e) => field.onChange(e.target.files[0])}
                    />
                  )}
                />

                <Typography
                  as="h5"
                  sx={{
                    fontWeight: "500",
                    fontSize: "14px",
                    mt: 2,
                    mb: "12px",
                  }}
                >
                  Icon Image
                </Typography>
                <Controller
                  name="icon_image"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      fullWidth
                      id="icon_image"
                      type="file"
                      label="Icon Image"
                      name="icon_image"
                      InputProps={{
                        style: { borderRadius: 8 },
                      }}
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error ? fieldState.error.message : null
                      }
                      onChange={(e) => field.onChange(e.target.files[0])}
                    />
                  )}
                />

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
              </Box>
            </Box>
          </>
        </Box>
      </BootstrapDialog>
    </>
  );
}


CategoryModal.propTypes = {
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
        slug: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
      }).isRequired,
    }),
  ]).isRequired,
  handleClose: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};