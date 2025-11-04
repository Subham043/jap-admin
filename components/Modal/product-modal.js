import * as React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from "@mui/material";
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
import { useCallback } from "react";
import { useEffect } from "react";

export const productSchema = yup
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
    category: yup
      .string()
      .typeError("Category must contain number only")
      .matches(/^[0-9]+$/, "Please enter a valid category (e.g. 50)")
      .required("Category is required"),
    price: yup
      .string()
      .typeError("Price must contain number only")
      .matches(/^[0-9]+$/, "Please enter a valid price (e.g. 50)")
      .required("Price is required"),
    discount: yup
      .string()
      .typeError("Discount must contain number only")
      .matches(/^[0-9]+$/, "Please enter a valid discount (e.g. 50)")
      .required("Discount is required"),
    inventory: yup
      .string()
      .typeError("Inventory must contain number only")
      .matches(/^[0-9]+$/, "Please enter a valid inventory (e.g. 50)")
      .required("Inventory is required"),
    weight: yup
      .string()
      .typeError("Weight must contain number only")
      .matches(/^[0-9]+$/, "Please enter a valid weight (e.g. 50)")
      .required("Weight is required"),
    unit: yup
      .string()
      .oneOf(
        ["kg", "g", "pc"],
        "Is active must be either kg, grams or piece"
      )
      .required("Unit is required")
      .default("kg"),
    is_active: yup
      .string()
      .oneOf(["0", "1"], "Is active must be either 0 or 1")
      .required("Is active is required")
      .default("1"),
    is_new_arrival: yup
      .string()
      .oneOf(["0", "1"], "Is new arrival must be either 0 or 1")
      .required("Is new arrival is required")
      .default("1"),
    is_featured: yup
      .string()
      .oneOf(["0", "1"], "Is featured must be either 0 or 1")
      .required("Is featured is required")
      .default("1"),
    is_best_sale: yup
      .string()
      .oneOf(["0", "1"], "Is best sale must be either 0 or 1")
      .required("Is best sale is required")
      .default("1"),
    image_title: yup
      .string()
      .typeError("Image Title must contain characters only")
      .nullable(),
    image_keywords: yup
      .string()
      .typeError("Image Alt must contain characters only")
      .nullable(),
    meta_title: yup
      .string()
      .typeError("Meta Title must contain characters only")
      .nullable(),
    meta_keywords: yup
      .string()
      .typeError("Meta Keywords must contain characters only")
      .nullable(),
    featured_image: yup
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

export default function ProductModal({ modal, handleClose, refetch }) {
  const { redirectLoginPage } = useCheckUnauthenticated();
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const form = useForm({
    resolver: yupResolver(productSchema),
    values: {
      name: modal.status && modal.data ? modal.data.name : "",
      slug: modal.status && modal.data ? modal.data.slug : "",
      description: modal.status && modal.data ? modal.data.description : "",
      price: modal.status && modal.data ? modal.data.price : "",
      discount: modal.status && modal.data ? modal.data.discount : "",
      inventory: modal.status && modal.data ? modal.data.inventory : "",
      weight: modal.status && modal.data ? modal.data.weight : "",
      unit:
        modal.status && modal.data && modal.data.unit ? modal.data.unit : "kg",
      is_active: modal.status && modal.data ? modal.data.is_active : "1",
      is_new_arrival:
        modal.status && modal.data ? modal.data.is_new_arrival : "1",
      is_featured: modal.status && modal.data ? modal.data.is_featured : "1",
      is_best_sale: modal.status && modal.data ? modal.data.is_best_sale : "1",
      image_title:
        modal.status && modal.data && modal.data.image_title
          ? modal.data.image_title
          : null,
      image_alt:
        modal.status && modal.data && modal.data.image_alt
          ? modal.data.image_alt
          : null,
      meta_title:
        modal.status && modal.data && modal.data.meta_title
          ? modal.data.meta_title
          : null,
      meta_keywords:
        modal.status && modal.data && modal.data.meta_keywords
          ? modal.data.meta_keywords
          : null,
      category:
        modal.status &&
        modal.data &&
        modal.data.categories &&
        modal.data.categories.length > 0
          ? modal.data.categories[0].id.toString()
          : "",
      featured_image: undefined,
    },
  });

  const closeModal = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    form.reset({
      name: "",
      description: "",
      slug: "",
      category: "",
      price: "",
      discount: "",
      inventory: "",
      weight: "",
      unit: "kg",
      is_active: "1",
      is_new_arrival: "1",
      is_featured: "1",
      is_best_sale: "1",
      image_title: null,
      image_alt: null,
      meta_title: null,
      meta_keywords: null,
      featured_image: undefined,
    });
    handleClose();
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("featured_image", form.getValues("featured_image"));
    formData.append("name", form.getValues("name"));
    formData.append("slug", form.getValues("slug"));
    formData.append("category[0]", form.getValues("category"));
    formData.append("price", form.getValues("price"));
    formData.append("discount", form.getValues("discount"));
    formData.append("inventory", form.getValues("inventory"));
    formData.append(
      "weight",
      `${form.getValues("weight")} ${form.getValues("unit")}`
    );
    formData.append("is_active", form.getValues("is_active"));
    formData.append("is_new_arrival", form.getValues("is_new_arrival"));
    formData.append("is_featured", form.getValues("is_featured"));
    formData.append("is_best_sale", form.getValues("is_best_sale"));
    formData.append("description", form.getValues("description"));
    if (form.getValues("meta_title")) {
      formData.append("meta_title", form.getValues("meta_title"));
    }
    if (form.getValues("image_title")) {
      formData.append("image_title", form.getValues("image_title"));
    }
    if (form.getValues("image_alt")) {
      formData.append("image_alt", form.getValues("image_alt"));
    }
    if (form.getValues("meta_keywords")) {
      formData.append("meta_keywords", form.getValues("meta_keywords"));
    }

    const accessToken = Cookies.get("japAccessToken");

    try {
      const response = await axios.post(
        modal.type === "update"
          ? `https://server-api.jap.bio/api/v1/product/update/${modal.data.id}`
          : "https://server-api.jap.bio/api/v1/product/create",
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
        "https://server-api.jap.bio/api/v1/category/paginate?page=1&total=50",
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
              {modal.type === "create" ? "Create" : "Update"} Product
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
                    padding: "30px 20px",
                    borderRadius: "8px",
                    mb: "15px",
                  }}
                  className="bg-black"
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "12px",
                        }}
                      >
                        Product Name
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
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
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
                    </Grid>

                    <Grid item xs={12}>
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
                            fullWidth
                            id="description"
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
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

                    <Grid item xs={12} md={6}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "12px",
                        }}
                      >
                        Price
                      </Typography>
                      <Controller
                        name="price"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            fullWidth
                            id="price"
                            label="Price"
                            name="price"
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

                    <Grid item xs={12} md={6}>
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
                          <TextField
                            fullWidth
                            id="discount"
                            label="Discount"
                            name="discount"
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

                    <Grid item xs={12} md={6}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "12px",
                        }}
                      >
                        Inventory
                      </Typography>
                      <Controller
                        name="inventory"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            fullWidth
                            id="inventory"
                            label="Inventory"
                            name="inventory"
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

                    <Grid item xs={12} md={6}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "12px",
                        }}
                      >
                        Weight
                      </Typography>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={8}>
                          <Controller
                            name="weight"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <TextField
                                fullWidth
                                id="weight"
                                label="Weight"
                                name="weight"
                                InputProps={{
                                  style: { borderRadius: 8 },
                                }}
                                error={!!fieldState.error}
                                helperText={
                                  fieldState.error
                                    ? fieldState.error.message
                                    : null
                                }
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Controller
                            name="unit"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Select
                                value={field.value}
                                onChange={field.onChange}
                                error={!!fieldState.error}
                                helperText={
                                  fieldState.error
                                    ? fieldState.error.message
                                    : null
                                }
                                inputProps={{
                                  name: "isActive",
                                  id: "isActive",
                                  style: { borderRadius: 8 },
                                }}
                              >
                                <MenuItem value="kg">kg</MenuItem>
                                <MenuItem value="g">grams</MenuItem>
                                <MenuItem value="pc">Piece</MenuItem>
                              </Select>
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={12}>
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
                      <FormControl fullWidth>
                        <Controller
                          name="category"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              error={!!fieldState.error}
                              helperText={
                                fieldState.error
                                  ? fieldState.error.message
                                  : null
                              }
                              inputProps={{
                                name: "isActive",
                                id: "isActive",
                                style: { borderRadius: 8 },
                              }}
                            >
                              {categoryLoading ? (
                                <MenuItem value="">
                                  Loading Categories...
                                </MenuItem>
                              ) : Array.isArray(categories) ? (
                                categories.map((category) => (
                                  <MenuItem
                                    key={category.slug}
                                    value={category.id}
                                    // onClick={() => console.log("Selected category ID:", category.id)}
                                  >
                                    {category.slug}
                                  </MenuItem>
                                ))
                              ) : null}
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "12px",
                        }}
                      >
                        Featured Image
                      </Typography>
                      <Controller
                        name="featured_image"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            fullWidth
                            id="featured_image"
                            type="file"
                            label="Featured Image"
                            name="featured_image"
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
                    </Grid>

                    <Grid item xs={12} md={6}>
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
                                fieldState.error
                                  ? fieldState.error.message
                                  : null
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

                    <Grid item xs={12} md={6}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "12px",
                        }}
                      >
                        Is New Arrival
                      </Typography>
                      <FormControl fullWidth>
                        <Controller
                          name="is_new_arrival"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              error={!!fieldState.error}
                              helperText={
                                fieldState.error
                                  ? fieldState.error.message
                                  : null
                              }
                              inputProps={{
                                name: "isActive",
                                id: "isActive",
                                style: { borderRadius: 8 },
                              }}
                            >
                              <MenuItem value="1">Yes</MenuItem>
                              <MenuItem value="0">No</MenuItem>
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "12px",
                        }}
                      >
                        Is Best Sale
                      </Typography>
                      <FormControl fullWidth>
                        <Controller
                          name="is_best_sale"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              error={!!fieldState.error}
                              helperText={
                                fieldState.error
                                  ? fieldState.error.message
                                  : null
                              }
                              inputProps={{
                                name: "isActive",
                                id: "isActive",
                                style: { borderRadius: 8 },
                              }}
                            >
                              <MenuItem value="1">Yes</MenuItem>
                              <MenuItem value="0">No</MenuItem>
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        as="h5"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "12px",
                        }}
                      >
                        Is Featured
                      </Typography>
                      <FormControl fullWidth>
                        <Controller
                          name="is_featured"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              error={!!fieldState.error}
                              helperText={
                                fieldState.error
                                  ? fieldState.error.message
                                  : null
                              }
                              inputProps={{
                                name: "isActive",
                                id: "isActive",
                                style: { borderRadius: 8 },
                              }}
                            >
                              <MenuItem value="1">Yes</MenuItem>
                              <MenuItem value="0">No</MenuItem>
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
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
                          {modal.type === "create" ? "Create" : "Update"}{" "}
                          Product
                        </>
                      )}
                    </Button>
                  </Grid>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </BootstrapDialog>
    </>
  );
}

ProductModal.propTypes = {
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
