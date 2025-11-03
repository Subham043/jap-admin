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
  const {redirectLoginPage} = useCheckUnauthenticated();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openedProductId, setOpenedProductId] = useState(null);
  const [openedProduct, setOpenedProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);


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
    // console.log(row);

  };
  const handleClose = () => setOpen(false);
  const handleClose2 = () => setOpen2(false);
  const [name, setProductName] = useState("");
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
  // const [pincode, setPincode] = useState("");
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

      try {
        const response = await axios.get(
          "https://server-api.jap.bio/api/v1/category/paginate",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // console.log("Categories API Response:", response.data.data);
        setCategories(response.data.data);
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
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage]);

  const fetchProducts = async () => {
    const accessToken = Cookies.get("japAccessToken");

    try {
      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/product/paginate?page=${page + 1}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Replace with your access token variable
          },
        }
      );
      setProducts(response.data.data);
      setTotalProducts(response.data.meta.total);
      setTotalPages(response.data.meta.last_page-1);
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
    // if (newPage < 0) {
    //   // Loop to the last page if the user goes to a negative page
    //   setPage(Math.max(0, Math.ceil(totalProducts / rowsPerPage) - 1));
    // } else if (newPage >= Math.ceil(totalProducts / rowsPerPage)) {
    //   // Loop to the first page if the user goes beyond the last page
    //   setPage(0);
    // } else {
    //   // Fetch the products for the new page
    //   setPage(newPage);
    // }
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, products.length);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filteredProducts = products.filter((product) => {
        if (selectedCategory === "All") {
          return product.name.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          return (
            product.status === selectedCategory &&
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });
      const getYesNoValue = (value) => {
        return value ? "Yes" : "No";
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
      setWeight(`${currentRow.weight} kg`);
      // setWeightUnit(currentRow.weightUnit);
      // setPincode(currentRow.pincode);
      // ... set other state variables as needed
    }
  }, [currentRow]);
  useEffect(() => {
    console.log('Category Name:', category);
  }, [category]);
 
  return (
    <>
      <h1>All Products</h1>

      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px",
          mb: "15px",
        }}
      >
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table
            sx={{ minWidth: 850 }}
            aria-label="custom pagination table"
            className="dark-table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="left">Image</TableCell>
                <TableCell align="left">Product Name</TableCell>
                <TableCell align="left">Slug</TableCell>
                <TableCell align="left">Description</TableCell>
                <TableCell align="left">Price</TableCell>
                <TableCell align="left">Discount</TableCell>
                <TableCell align="left">Discounted Price</TableCell>
                <TableCell align="left">Inventory</TableCell>
                <TableCell align="left">In Stock</TableCell>
                <TableCell align="left">Featured Image Link</TableCell>
                <TableCell align="left">Image Title</TableCell>
                <TableCell align="left">Is Active</TableCell>
                <TableCell align="left">Is New Arrival</TableCell>
                <TableCell align="left">Is Featured</TableCell>
                <TableCell align="left">Is Best Sale</TableCell>
                <TableCell align="left">Other Images</TableCell>
                <TableCell align="left">Categories</TableCell>
                <TableCell align="left">Created At</TableCell>
                <TableCell align="left">Updated At</TableCell>
                <TableCell align="left">Weight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="left">
                    <img
                      style={{ width: "50px" }}
                      src={product.featured_image_link}
                      alt="Product"
                    />
                  </TableCell>
                  <TableCell align="left">{product.name}</TableCell>
                  <TableCell align="left">{product.slug}</TableCell>
                  <TableCell align="left">{product.description}</TableCell>
                  <TableCell align="left">{product.price}</TableCell>
                  <TableCell align="left">{product.discount}</TableCell>
                  <TableCell align="left">{product.discounted_price}</TableCell>
                  <TableCell align="left">{product.inventory}</TableCell>
                  <TableCell align="left">
                    {getYesNoValue(product.in_stock)}
                  </TableCell>
                  <TableCell align="left">
                    {product.featured_image_link}
                  </TableCell>
                  <TableCell align="left">{product.image_title}</TableCell>
                  <TableCell align="left">
                    {getYesNoValue(product.is_active)}
                  </TableCell>
                  <TableCell align="left">
                    {getYesNoValue(product.is_new_arrival)}
                  </TableCell>
                  <TableCell align="left">
                    {getYesNoValue(product.is_featured)}
                  </TableCell>
                  <TableCell align="left">
                    {getYesNoValue(product.is_best_sale)}
                  </TableCell>
                  <TableCell align="left">
                    {product.other_images.join(", ")}
                  </TableCell>
                  <TableCell align="left">
                    {product.categories
                      .map((category) => category.slug)
                      .join(", ")}
                  </TableCell>
                  <TableCell align="left">{product.created_at}</TableCell>
                  <TableCell align="left">{product.updated_at}</TableCell>
                  <TableCell align="left">{product.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  count={totalPages}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={Product}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
