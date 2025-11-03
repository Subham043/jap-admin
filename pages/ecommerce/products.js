import * as React from "react";
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Link from 'next/link';
import styles from '@/styles/PageTitle.module.css'
import axios from 'axios'
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import dynamic from 'next/dynamic'
import { identity } from "@fullcalendar/core/internal";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";
const RichTextEditor = dynamic(() => import('@mantine/rte'), {
  ssr: false,
})

// Create Product Modal Style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  height: "100%",
  maxWidth: '700px',
  width: '100%',
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
};

function Product(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

Product.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};


export default function Products() {
  // Table
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openedProductId, setOpenedProductId] = useState(null);
  const [openedProduct, setOpenedProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const {redirectLoginPage} = useCheckUnauthenticated();


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOpenedProductId(null);
    setOpenedProduct(null);
  };

  // Create Product Modal & Form
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [currentRow, setCurrentRow] = useState(null);

  const handleOpen = () => setOpen(true);

  const handleClickOpen2 = (row) => {
    setOpen2(true);
    setCurrentRow(row);
    console.log(row);

  };
  const handleClose = () => setOpen(false);
  const handleClose2 = () => setOpen2(false);
  const [name, setProductName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState('');
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
  const [weightUnit, setWeightUnit] = useState("");
  // const [pincode, setPincode] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Initialize error state variable

  useEffect(() => {
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
  

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage]);

  const fetchProducts = async () => {
    const accessToken = Cookies.get("japAccessToken");

    try {
      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/product/paginate?page=${
          page + 1
        }&total=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Replace with your access token variable
          },
        }
      );
      setProducts(response.data.data);
      setTotalProducts(response.data.meta.total);
      setLoading(false); // Set loading to false after fetching data
      // console.log('Products Fetched for Page', page + 1, response.data.data);

    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Failed to fetch products:", error.response.data);
    }
  };

  const handleChangePage = (event, newPage) => {
    if (newPage < 0) {
      // Loop to the last page if the user goes to a negative page
      setPage(Math.max(0, Math.ceil(totalProducts / rowsPerPage) - 1));
    } else if (newPage >= Math.ceil(totalProducts / rowsPerPage)) {
      // Loop to the first page if the user goes beyond the last page
      setPage(0);
    } else {
      // Fetch the products for the new page
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, products.length);

  const handleOpenModal = async (id) => {
    const accessToken = Cookies.get("japAccessToken");
    try {

      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/product/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const product = response.data.product
      setOpenedProduct(product);
      // console.log(product)
      setIsModalOpen(true);
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Error fetching product:", error);
    }
  };

  const handleFeaturedImageChange = (event) => {
    const file = event.target.files[0];
    setFeaturedImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", currentRow.name);
      formData.append("slug", currentRow.slug);
      formData.append("description", currentRow.description);
      formData.append("is_active", currentRow.isActive ? "1" : "0");
      if (featuredImage) {
        formData.append("featured_image", featuredImage);
      }
      formData.append("price", currentRow.price);
      formData.append("discount", currentRow.discount);
      formData.append("is_new_arrival", currentRow.isNewArrival ? "1" : "0");
      formData.append("is_featured", currentRow.isFeatured ? "1" : "0");
      formData.append("is_best_sale", currentRow.isBestSale ? "1" : "0");
      formData.append("category[0]", currentRow.category);
      formData.append("inventory", currentRow.inventory);
      formData.append("weight", `${weight} ${weightUnit}`);
      // formData.append("pincode[0]", pincode);

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

        // console.log("Form Data:", formData);

        // console.log("Product created:", response.data);

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
        setWeight("");
        // setWeightUnit("");
        // setPincode("");

        handleClose();
        fetchProducts();
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Error creating product:", error.response.data);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("is_active", isActive ? "1" : "0");
      if (featuredImage) {
        formData.append("featured_image", featuredImage);
      }
      formData.append("price", price); // Use price directly from state
      formData.append("discount", discount);
      formData.append("is_new_arrival", isNewArrival ? "1" : "0");
      formData.append("is_featured", isFeatured ? "1" : "0");
      formData.append("is_best_sale", isBestSale ? "1" : "0");
      formData.append("category[0]", category);
      formData.append("inventory", inventory); // Use inventory directly from state
      formData.append("weight", `${weight} ${weightUnit}`); // Use weight directly from state
      // formData.append("weightUnit", weightUnit); // Use weightUnit directly from state
  
      const accessToken = Cookies.get("japAccessToken");
      if (accessToken && currentRow && currentRow.id) {
        const productId = currentRow.id;
        const response = await axios.post(
          "https://server-api.jap.bio/api/v1/product/update/" + productId,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        // console.log("Product updated:", response.data);
  
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
        setWeight("");
        setWeightUnit("");
        // setPincode("");
        handleClose2();
        fetchProducts();
        setError('');
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      setError('Error updating product: ' + error.response.data.message);
      // console.log('Error updating product: ' + error.response.data.message);
      alert("An error occurred while updating the product."); // Display error in alert

    }
  };
  useEffect(() => {
    if (currentRow) {
      setProductName(currentRow.name);
      setSlug(currentRow.slug);
      setPrice(currentRow.price);
      setDescription(currentRow.description);
      setIsActive(currentRow.isActive ? "1" : "0");
      setDiscount(currentRow.discount);
      setIsNewArrival(currentRow.isNewArrival ? "1" : "0");
      setIsFeatured(currentRow.isFeatured ? "1" : "0");
      setIsBestSale(currentRow.isBestSale ? "1" : "0");
      if (currentRow && currentRow.categories && currentRow.categories.length > 0) {
        setCategory(currentRow.categories[0].name);
      } else {
        setCategory("");
      }
      setInventory(currentRow.inventory);
      const weightParts = currentRow.weight.split(' ');
      if (weightParts.length === 2) {
        setWeight(weightParts[0]);
        setWeightUnit(weightParts[1]);
      } else {
        setWeight('');
        setWeightUnit('');
      }
      // setPincode(currentRow.pincode);
      // ... set other state variables as needed
    }
  }, [currentRow]);
  useEffect(() => {
    console.log('Category Name:', category);
  }, [category]);
  const handleDelete = async (id) => {
    const accessToken = Cookies.get("japAccessToken");
    try {
      await axios.delete(`https://server-api.jap.bio/api/v1/product/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Remove the deleted product from the state
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );
      fetchProducts();
      // console.log(id)
      console.log(`Product with ID ${id} deleted successfully.`);
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error(`Error deleting product with ID ${id}:`, error.response.data);
    }
  };

  return (
    <>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <h1>Products</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Products</li>
        </ul>
      </div>

      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px 25px 10px",
          mb: "15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "10px",
          }}
        >
          <Typography
            as="h3"
            sx={{
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            Products
          </Typography>

          <Button
            onClick={handleOpen}
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
              sx={{ position: "relative", top: "-1px" }}
              className='mr-5px'
            />{" "}
            Create Product
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table sx={{ minWidth: 850 }} aria-label="custom pagination table" className="dark-table">
            <TableHead sx={{ background: "#F7FAFF" }}>
              <TableRow>
                <TableCell sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}>Product Name</TableCell>
                <TableCell sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}>Category</TableCell>
                <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}>Price</TableCell>
                <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}>Orders</TableCell>
                <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}>Stock</TableCell>
                <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}>Rating</TableCell>
                <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}>Weight</TableCell>
                <TableCell align="right" sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {products.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ width: 250, borderBottom: "1px solid #F7FAFF", padding: "8px 10px" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <img src={row.featured_image_link} alt="Product Img" width={50} className="borderRadius10" />
                      <Typography as="h4" sx={{ fontWeight: "500", fontSize: "13px" }} className="ml-10px">
                        {row.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #F7FAFF", padding: "8px 10px", fontSize: "13px" }}>
                    {row.categories.map((category) => category.slug).join(", ")}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", padding: "8px 10px", fontSize: "13px" }}>
                    {row.price}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", padding: "8px 10px", fontSize: "13px" }}>
                    {row.orders}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", padding: "8px 10px", fontSize: "13px" }}>
                    {row.inventory}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", padding: "8px 10px", fontSize: "13px" }}>
                    {row.rating}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #F7FAFF", padding: "8px 10px", fontSize: "13px" }}>
                    {row.weight}
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: "1px solid #F7FAFF", padding: "8px 10px" }}>
                    <Box
                      sx={{
                        display: "inline-block",
                      }}
                    >
                      <Tooltip title="View" placement="top">
                        <IconButton
                          aria-label="view"
                          size="small"
                          color="info"
                          className="info"
                          onClick={() => handleOpenModal(row.id)}
                        >
                          <VisibilityIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit" placement="top">
                        <IconButton
                          aria-label="edit"
                          size="small"
                          color="primary"
                          className="primary"
                          onClick={() => handleClickOpen2(row)}
                        >
                          <DriveFileRenameOutlineIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remove" placement="top">
                        <IconButton
                          aria-label="remove"
                          size="small"
                          color="danger"
                          className="danger"
                          onClick={() => handleDelete(row.id)}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={8} style={{ borderBottom: "1px solid #F7FAFF" }} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  count={totalProducts}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={Product}
                />
              </TableRow>
            </TableFooter>
            <Modal
              open={isModalOpen}
              onClose={handleCloseModal}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={isModalOpen}>
                <Box sx={style} className="bg-black">
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

                    <div className="modal-content">
                      {openedProduct && (
                        <div>
                          <h2>Product Name:{openedProduct.name}</h2>
                          <p>Product Description:{openedProduct.description}</p>
                          <p>Product Image:{openedProduct.featured_image_link}</p>
                          <img src={openedProduct.featured_image_link} />
                          <p>Price: {openedProduct.price}</p>
                          <p>Discount: {openedProduct.discount}</p>
                          <p>Inventory: {openedProduct.inventory}</p>
                          <p>Is Active: {openedProduct.is_active.toString()}</p>
                          <p>Is Best Sale: {openedProduct.is_best_sale.toString()}</p>
                          <p>Is Featured: {openedProduct.is_featured.toString()}</p>
                          <p>Is New Arrival: {openedProduct.is_new_arrival.toString()}</p>
                          <p>In Stock: {openedProduct.in_stock.toString()}</p>
                          <p>Created At: {openedProduct.created_at}</p>
                          <p>Updated At: {openedProduct.updated_at}</p>
                          <p>Weight: {openedProduct.weight}</p>
                          {/* Render other product details */}
                          {openedProduct.categories && openedProduct.categories.length > 0 && (
                            <div>
                              <h3>Categories:</h3>
                              {openedProduct.categories.map((category) => (
                                <div key={category.id}>
                                  <p>Category Name: {category.name}</p>
                                  <p>Category Slug: {category.slug}</p>
                                  {/* Display other category data as needed */}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Box>
                </Box>
              </Fade>
            </Modal>
            {/* ...existing code... */}
          </Table>
        </TableContainer>
      </Card>

      {/* Create Product Modal */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style} className="bg-black">
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
                  fontSize: "17px",
                }}
              >
                Create Product
              </Typography>

              <IconButton
                aria-label="remove"
                size="small"
                onClick={handleClose}
              >
                <ClearIcon />
              </IconButton>
            </Box>

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
                      autoComplete="name"
                      name="name"
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      autoFocus
                      value={name}
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

                  {/* <Grid item xs={12} md={6}>
              <Typography
                as="h5"
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  mb: "12px",
                }}
              >
                Pincode
              </Typography>
              <TextField
                autoComplete="pincode"
                name="pincode"
                required
                fullWidth
                id="pincode"
                label="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
              />
            </Grid> */}
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
                          <MenuItem value="pc">Piece</MenuItem>
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
          </Box>
        </Fade>
      </Modal>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open2}
        onClose={handleClose2}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open2}>
          <Box sx={style} className="bg-black">
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
                  fontSize: "17px",
                }}
              >
                Update Product
              </Typography>

              <IconButton
                aria-label="remove"
                size="small"
                onClick={handleClose2}
              >
                <ClearIcon />
              </IconButton>
            </Box>

            <Box component="form" noValidate onSubmit={handleUpdate}>
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
                      autoComplete="name"
                      name="name"
                      required
                      fullWidth
                      id="name"
                      label="Product Name"
                      autoFocus
                      value={name}
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

                  {/* <Grid item xs={12} md={6}>
              <Typography
                as="h5"
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  mb: "12px",
                }}
              >
                Pincode
              </Typography>
              <TextField
                autoComplete="pincode"
                name="pincode"
                required
                fullWidth
                id="pincode"
                label="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
              />
            </Grid> */}
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
                          <MenuItem value="pieces">pieces</MenuItem>
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
                    Update Product
                  </Button>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
