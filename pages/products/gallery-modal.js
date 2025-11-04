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
import { useEffect, useState } from "react";
import axios from "axios";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Cookies from "js-cookie";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";
import { useCallback } from "react";

export const gallerySchema = yup
  .object({
    category: yup
      .string()
      .typeError("Category must contain number only")
      .matches(/^[0-9]+$/, "Please enter a valid category number (e.g. 9)")
      .nullable(),
    title: yup
      .string()
      .typeError("Title must contain characters only")
      .required("Title is required"),
    description: yup
      .string()
      .typeError("Description must contain characters only")
      .nullable(),
    image_title: yup
      .string()
      .typeError("Image Title must contain characters only")
      .nullable(),
    image_alt: yup
      .string()
      .typeError("Image Alt must contain characters only")
      .nullable(),
    image: yup
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

export default function GalleryModal({ modal, handleClose, refetch }) {
  const { redirectLoginPage } = useCheckUnauthenticated();
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const form = useForm({
    resolver: yupResolver(gallerySchema),
    values: {
      title: modal.status && modal.data ? modal.data.title : "",
      description:
        modal.status && modal.data && modal.data.description
          ? modal.data.description
          : null,
      image_title:
        modal.status && modal.data && modal.data.image_title
          ? modal.data.image_title
          : null,
      image_alt:
        modal.status && modal.data && modal.data.image_alt
          ? modal.data.image_alt
          : null,
      category:
        modal.status && modal.data && modal.data.category
          ? modal.data.category
          : null,
      image: undefined,
    },
  });

  const closeModal = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    form.reset({
      title: "",
      description: null,
      image_title: null,
      image_alt: null,
      category: null,
      image: undefined,
    });
    handleClose();
  };

  const handleSubmit = async () => {

    const formData = new FormData();
    formData.append("image", form.getValues("image"));
    if (form.getValues("category")){
      formData.append("category", form.getValues("category"));
    }
    formData.append("title", form.getValues("title"));
    if (form.getValues("image_title")){
      formData.append("image_title", form.getValues("image_title"));
    }
    if (form.getValues("image_alt")){
      formData.append("image_alt", form.getValues("image_alt"));
    }
    if (form.getValues("description")){
      formData.append("description", form.getValues("description"));
    }

    const accessToken = Cookies.get("japAccessToken");

    try {
      const response = await axios.post(
        modal.type === "update"
          ? `https://server-api.jap.bio/api/v1/gallery/update/${modal.data.id}`
          : "https://server-api.jap.bio/api/v1/gallery/create",
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

  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true);
    try {
      const accessToken = Cookies.get("japAccessToken"); // Get access token from local storage or wherever it is stored
      const response = await axios.get(
        "https://server-api.jap.bio/api/v1/gallery-category/paginate?page=1&total=50",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setCategories(response.data.data || []);
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
    } finally {
      setCategoryLoading(false);
    }
  }, [redirectLoginPage]);

  useEffect(() => {
    // Fetch categories from API
    if (modal.status) {
      fetchCategories();
    }
  }, [fetchCategories, modal.status]);

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
              {modal.type === "create" ? "Create" : "Update"} Gallery
            </Typography>

            <IconButton aria-label="remove" size="small" onClick={closeModal}>
              <ClearIcon />
            </IconButton>
          </Box>

          {categoryLoading ? (
            <Box
              sx={{
                background: "#fff",
                padding: "20px 20px",
                borderRadius: "8px",
              }}
              className="dark-BG-101010"
              textAlign="center"
            >
              <CircularProgress color="inherit" />
            </Box>
          ) : (
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
                      mb: "12px",
                    }}
                  >
                    Category
                  </Typography>
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Select
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error ? fieldState.error.message : null
                        }
                        value={field.value}
                        onChange={field.onChange}
                        fullWidth
                        id="category"
                        style={{ borderRadius: 8 }}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
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
                    Title
                  </Typography>
                  <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        id="title"
                        label="Title"
                        name="title"
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
                    Image Title
                  </Typography>
                  <Controller
                    name="image_title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        id="image_title"
                        label="Image Title"
                        name="image_title"
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
                    Image Alt
                  </Typography>
                  <Controller
                    name="image_alt"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        id="image_alt"
                        label="Image Alt"
                        name="image_alt"
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
                    Upload Image
                  </Typography>
                  <Controller
                    name="image"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        id="image"
                        type="file"
                        label="Image"
                        name="image"
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
                        {modal.type === "create" ? "Create" : "Update"} Gallery
                      </>
                    )}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </BootstrapDialog>
    </>
  );
}


GalleryModal.propTypes = {
  modal: PropTypes.oneOfType([
    PropTypes.shape({
      status: PropTypes.bool.isRequired,
      type: PropTypes.oneOf(["create"]).isRequired,
    }),
    PropTypes.shape({
      status: PropTypes.bool.isRequired,
      type: PropTypes.oneOf(["update"]).isRequired,
      data: PropTypes.shape({
        title: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
      }).isRequired,
    }),
  ]).isRequired,
  handleClose: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};