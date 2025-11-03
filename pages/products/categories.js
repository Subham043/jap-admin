import React,{useState, useEffect} from "react";
import { Box, Typography } from "@mui/material";
import Card from "@mui/material/Card";
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
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close'; 
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Cookies from "js-cookie";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";


const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

// Create new user Modal
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};
// End Create new user Modal

function UsersList(props) {
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

UsersList.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};



export default function User() {
  // Table
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isActive, setIsActive] = useState(true);
  const {redirectLoginPage} = useCheckUnauthenticated();
 
  // Create new user modal
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [currentRow, setCurrentRow] = useState(null);


  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen2 = (category) => {
    setOpen2(true);
    setCurrentRow(category);
    console.log(category);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [iconImage, setIconImage] = useState(null);

  const handleBannerImageChange = (event) => {
    const file = event.target.files[0];
    setBannerImage(file);
  };

  const handleIconImageChange = (event) => {
    const file = event.target.files[0];
    setIconImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("is_active", isActive ? "1" : "0");
      formData.append("banner_image", bannerImage);
      formData.append("icon_image", iconImage);
    
      const accessToken = Cookies.get("japAccessToken");
  
      if (accessToken) {
        const response = await axios.post(
          "https://server-api.jap.bio/api/v1/category/create",
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        console.log("Category created successfully:", response.data);
        // Reset the form after successful submission if needed
        setName("");
        setSlug("");
        setDescription("");
        setIsActive(true);
        setBannerImage(null);
        setIconImage(null);

        handleClose();
        fetchCategories();
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
      formData.append("name", name); // Include the name field
      formData.append("slug", slug); // Include the slug field
      formData.append("description", description); // Include the description field
      formData.append("is_active", isActive ? "1" : "0"); // Include the is_active field
  
      const accessToken = Cookies.get("japAccessToken");
  
      if (accessToken) {
        const response = await axios.post(
          `https://server-api.jap.bio/api/v1/category/update/${currentRow.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        console.log("Category updated successfully:", response.data);
        // Reset the form after successful submission if needed
        setName("");
        setSlug("");
        setDescription("");
        setIsActive(true);
        setBannerImage(null);
        setIconImage(null);
  
        handleClose2();
        fetchCategories();
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Error updating category:", error.response.data);
    }
  };
  
  
  useEffect(() => {
    // const loginValue = localStorage.getItem('login_');
    // if (loginValue !== null && loginValue === '1') {
    //   console.log('ok');
    // } else {
    //   window.location.href = '/authentication/sign-in/';
    // }
    if (currentRow) {
      setName(currentRow.name);
      setSlug(currentRow.slug);
      setDescription(currentRow.description);
      setIsActive(currentRow.isActive ? "1":"0");
      
    }
  }, [currentRow]);
  
  
  // End Add Task Modal
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories]=useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
     fetchCategories();
  }, [page, rowsPerPage]);
  const fetchCategories = async () => {
    const accessToken = Cookies.get("japAccessToken");

    try {
      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/category/paginate?page=${page + 1}&total=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setCategories(response.data.data);
      setTotalCategories(response.data.meta.total)
      setLoading(false); // Set loading to false after fetching data
      console.log('Products Fetched for Page', page + 1, response.data.data);
      console.log(response.data.data)
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
    }
  };
  const handleChangePage = (event, newPage) => {
    if (newPage < 0) {
      // Loop to the last page if the user goes to a negative page
      setPage(Math.max(0, Math.ceil(totalCategories / rowsPerPage) - 1));
    } else if (newPage >= Math.ceil(totalCategories / rowsPerPage)) {
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

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, categories.length);

  const handleDelete = async (id) => {
    const accessToken = Cookies.get("japAccessToken");
      try {
        await axios.delete(`https://server-api.jap.bio/api/v1/category/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
    
      // Remove the deleted product from the state
      setCategories((prevProducts) =>
        prevProducts.filter((category) => category.id !== id)
      );
      console.log(id)
      fetchCategories();
      console.log(`category with ID ${id} deleted successfully.`);
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error(`Error deleting category with ID ${id}:`, error.response.data);
    }
  };

  return (
    <>
      

      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px 20px 15px",
          mb: "15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #EEF0F7",
            paddingBottom: "10px",
            mb: "20px",
          }}
          className="for-dark-bottom-border"
        >
          <Typography
            as="h3"
            sx={{
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            Cayegory List
          </Typography>

          <Button
            onClick={handleClickOpen}
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
            Create New Category
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
          }}
        >
          <Table 
            sx={{ minWidth: 900 }} 
            aria-label="custom pagination table"
            className="dark-table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="left">Products Name</TableCell>
                <TableCell align="left">Categories</TableCell>
                <TableCell align="left">Banner_Image</TableCell>
                <TableCell align="left">Icon</TableCell>
                <TableCell align="right">Actions</TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
            {categories.map((category) => (
                <TableRow key={category.slug}>
                 <TableCell align="left">{category.name}</TableCell>
                  <TableCell align="left">{category.slug}</TableCell>
                  <TableCell align="left"><img src={category.banner_image_link} alt="Product Img" width={50} className="borderRadius10" /></TableCell>
                  <TableCell align="left"><img src={category.icon_image_link} alt="Product Img" width={50} className="borderRadius10" /></TableCell>
                  
                  <TableCell
                    align="right"
                  >
                    <Box
                      sx={{
                        display: "inline-block",
                      }}
                    >
                      <Tooltip title="Remove" placement="top">
                        <IconButton
                          aria-label="remove"
                          size="small"
                          color="danger"
                          className="danger"
                          onClick={()=>{handleDelete(category.id)}}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Rename" placement="top">
                        <IconButton
                          aria-label="rename"
                          size="small"
                          color="primary"
                          className="primary"
                          onClick={()=>{handleClickOpen2(category)}}

                        >
                          <DriveFileRenameOutlineIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell
                    colSpan={5}
                    style={{ borderBottom: "1px solid #F7FAFF" }}
                  />
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  count={totalCategories}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={UsersList}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>

      {/* Create new user modal */}
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
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
              Create New Category
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

                  <TextField
                    autoComplete="name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    autoFocus
                    value={name}
                onChange={(e) => setName(e.target.value)}
                    InputProps={{
                      style: { borderRadius: 8 },
                    }}
                  />
                </Grid><Grid item xs={12} md={12} lg={6}>
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
                    autoFocus
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    InputProps={{
                      style: { borderRadius: 8 },
                    }}
                  />
                </Grid><Grid item xs={12} md={12} lg={6}>
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
                    autoFocus
                    value={description}
                onChange={(e) => setDescription(e.target.value)}
                    InputProps={{
                      style: { borderRadius: 8 },
                    }}
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
                <Grid item xs={12} md={12} lg={6}>
              <Typography
                as="h5"
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  mb: "12px",
                }}
              >
                Banner Image
              </Typography>
              <input
                type="file"
                name="bannerImage"
                id="bannerImage"
                onChange={handleBannerImageChange}
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
                    Icon Image
                  </Typography>
                  <input
                    type="file"
                    name="iconImage"
                    id="iconImage"
                    onChange={handleIconImageChange}
                  />
                </Grid>         

            <Grid item xs={12} textAlign="end">
        <Button
          type="submit"
          variant="contained"
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
          <AddIcon sx={{ position: "relative", top: "-2px" }} className="mr-5px" /> Create Category
        </Button>
      </Grid>
      
              </Grid>
            </Box>
          </Box>
        </Box>
      </BootstrapDialog>
      <BootstrapDialog
        onClose={handleClose2}
        aria-labelledby="customized-dialog-title"
        open={open2}
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
              Update Category
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

                  <TextField
                  autoComplete="name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)} // Update the name state
                  InputProps={{
                    style: { borderRadius: 8 },
                  }}
                />
                </Grid><Grid item xs={12} md={12} lg={6}>
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
                  autoFocus
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)} // Update the slug state
                  InputProps={{
                    style: { borderRadius: 8 },
                  }}
                />
                </Grid><Grid item xs={12} md={12} lg={6}>
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
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)} // Update the description state
                  InputProps={{
                    style: { borderRadius: 8 },
                  }}
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
                <Grid item xs={12} md={12} lg={6}>
              <Typography
                as="h5"
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  mb: "12px",
                }}
              >
                Banner Image
              </Typography>
              <input
                type="file"
                name="bannerImage"
                id="bannerImage"
                onChange={handleBannerImageChange}
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
                    Icon Image
                  </Typography>
                  <input
                    type="file"
                    name="iconImage"
                    id="iconImage"
                    onChange={handleIconImageChange}
                  />
                </Grid>         

            <Grid item xs={12} textAlign="end">
        <Button
          type="submit"
          variant="contained"
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
          <AddIcon sx={{ position: "relative", top: "-2px" }} className="mr-5px" /> Update Category
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
