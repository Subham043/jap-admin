import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";

const CreateProduct = () => {
  const [productName, setProductName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [discount, setDiscount] = useState("");
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestSale, setIsBestSale] = useState(true);
  const [category, setCategory] = useState("");
  const [inventory, setInventory] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const {redirectLoginPage} = useCheckUnauthenticated();
  // const [pincode, setPincode] = useState("");

  const handleFeaturedImageChange = (event) => {
    const file = event.target.files[0];
    setFeaturedImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("is_active", isActive ? "1" : "0");
      if (featuredImage) {
        formData.append("featured_image", featuredImage);
      }
      formData.append("price", price);
      formData.append("discount", discount);
      formData.append("is_new_arrival", isNewArrival ? "1" : "0");
      formData.append("is_featured", isFeatured ? "1" : "0");
      formData.append("is_best_sale", isBestSale ? "1" : "0");
      formData.append("category[0]", category);
      formData.append("inventory", inventory);
      // formData.append("pincode[0]", pincode);
      formData.append("weight", `${weight} ${weightUnit}`);

      const accessToken = Cookies.get("japAccessToken");
      if (accessToken) {
        const response = await axios.post(
          "https://server-api.jap.bio/api/v1/product/create",
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Form Data:", formData);

        console.log("Product created:", response.data);

        // Reset the form fields
        setProductName("");
        setSlug("");
        setPrice("");
        setDescription("");
        setIsActive(true);
        setDiscount("");
        setFeaturedImage(null);
        setIsNewArrival(false);
        setIsFeatured(false);
        setIsBestSale(false);
        setCategory("");
        setInventory("");
        // setPincode("");
        setWeight("");
        setWeightUnit("");

      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Error creating product:", error);
    }
  };

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const loginValue = localStorage.getItem('login_');
    // if (loginValue !== null && loginValue === '1') {
    //   console.log('ok');
    // } else {
    //   window.location.href = '/authentication/sign-in/';
    // }
  
    // Fetch categories from the API
    const fetchCategories = async () => {
      const accessToken = Cookies.get("japAccessToken");
      let page = 1;
      let allCategories = [];
  
      try {
        while (true) {
          const response = await axios.get(
            `https://server-api.jap.bio/api/v1/category/paginate?page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const newData = response.data.data;
          if (newData.length === 0) {
            // No more categories, break the loop
            break;
          }
          allCategories = [...allCategories, ...newData];
          page++;
        }
        setCategories(allCategories);
        setLoading(false);
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 401) {
          redirectLoginPage();
        }
        console.error("Error fetching categories:", error.response.data);
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, [redirectLoginPage]);
  

  return (
    <>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <h1>Create Product</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Create Product</li>
        </ul>
      </div>

      <Box component="form" noValidate onSubmit={handleSubmit}>
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
              <TextField
                autoComplete="product-name"
                name="productName"
                required
                fullWidth
                id="productName"
                label="Product Name"
                autoFocus
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                autoComplete="slug"
                name="slug"
                required
                fullWidth
                id="slug"
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                autoComplete="description"
                name="description"
                required
                fullWidth
                id="description"
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
                <Select
                  value={isActive ? "1" : "0"}
                  onChange={(e) => setIsActive(e.target.value === "1")}
                  inputProps={{
                    name: "isActive",
                    id: "isActive",
                    style: { borderRadius: 8 },
                  }}
                >
                  <MenuItem value="1">Active</MenuItem>
                  <MenuItem value="0">Inactive</MenuItem>
                </Select>
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
                Price
              </Typography>
              <TextField
                autoComplete="price"
                name="price"
                required
                fullWidth
                id="price"
                label="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                autoComplete="discount"
                name="discount"
                required
                fullWidth
                id="discount"
                label="Discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
                Is New Arrival
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={isNewArrival ? "1" : "0"}
                  onChange={(e) => setIsNewArrival(e.target.value === "1")}
                  inputProps={{
                    name: "isNewArrival",
                    id: "isNewArrival",
                    style: { borderRadius: 8 },
                  }}
                >
                  <MenuItem value="1">Yes</MenuItem>
                  <MenuItem value="0">No</MenuItem>
                </Select>
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
                <Select
                  value={isFeatured ? "1" : "0"}
                  onChange={(e) => setIsFeatured(e.target.value === "1")}
                  inputProps={{
                    name: "isFeatured",
                    id: "isFeatured",
                    style: { borderRadius: 8 },
                  }}
                >
                  <MenuItem value="1">Yes</MenuItem>
                  <MenuItem value="0">No</MenuItem>
                </Select>
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
              <input
                type="file"
                name="featuredImage"
                id="featuredImage"
                onChange={handleFeaturedImageChange}
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
                Is Best Sale
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={isBestSale ? "1" : "0"}
                  onChange={(e) => setIsBestSale(e.target.value === "1")}
                  inputProps={{
                    name: "isBestSale",
                    id: "isBestSale",
                    style: { borderRadius: 8 },
                  }}
                >
                  <MenuItem value="1">Yes</MenuItem>
                  <MenuItem value="0">No</MenuItem>
                </Select>
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
                Category
              </Typography>
              <FormControl fullWidth>
              <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  inputProps={{
                    name: "category",
                    id: "category",
                    style: { borderRadius: 8 },
                  }}
                >
                  {loading ? (
                    <MenuItem value="">Loading Categories...</MenuItem>
                  ) : (
                    Array.isArray(categories) ? (
                      categories.map((category) => (
                      <MenuItem key={category.slug} value={category.id} 
                      // onClick={() => console.log("Selected category ID:", category.id)}
                      >
                        {category.slug}
                      </MenuItem>
                    ))
                    ) : null
                  )}
                </Select>
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
                Inventory
              </Typography>
              <TextField
                autoComplete="inventory"
                name="inventory"
                required
                fullWidth
                id="inventory"
                label="Inventory"
                type="number"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
            <TextField
              autoComplete="weight"
              name="weight"
              required
              fullWidth
              id="weight"
              label="Weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              InputProps={{
                style: { borderRadius: 8 },
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              select
              fullWidth
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
            >
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="g">grams</MenuItem>
              <MenuItem value="lb">pounds</MenuItem>
              {/* Add more units as needed */}
            </TextField>
          </Grid>
        </Grid>
      </Grid>
          </Grid>

          <Grid item xs={12} textAlign="end">
            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: "capitalize",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "13px",
                padding: "12px 20px",
                color: "#fff !important",
              }}
            >
              <AddIcon
                sx={{
                  position: "relative",
                  top: "-2px",
                }}
                className="mr-5px"
              />{" "}
              Create Product
            </Button>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default CreateProduct;
