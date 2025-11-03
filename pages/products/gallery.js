import * as React from "react";
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
import Link from 'next/link';
import styles from '@/styles/PageTitle.module.css';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close'; 
import { useEffect,useState } from "react";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Cookies from "js-cookie";

import VisibilityIcon from '@mui/icons-material/Visibility';
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
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // height: "100%",
  maxWidth: '700px',
  width: '100%',
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
};
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

function createData(state, min_p, max_p, status, dis, max_d, max_u) {
  return {
   state, min_p, max_p, status, dis, max_d, max_u
  };
}

const rows = [
  createData(
    "State",
    "Minimum Pincode",
    "Max Pincode",
    "Status",
    "Discount",
    "Max Discount",
    "Max Use"
  ),
].sort((a, b) => (a.name < b.name ? -1 : 1));

export default function User() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const [open2, setOpen2] = React.useState(false);
  const handleClickOpen2 = (row) => {
     setOpen2(true);
     setCurrentRow(row);
     console.log("current",row);
    
   };
  const handleClose2 = () => {
     setOpen2(false);
   };
 
  const [open, setOpen] = React.useState(false);
  const [state, setState] = useState("");
  const [minPincode, setMinPincode] = useState("");
  const [currentRow, setCurrentRow] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const [gallerys, setGallerys] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchGallery = async () => {
    const accessToken = Cookies.get("japAccessToken");
    setLoading(true);

    try {
      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/gallery/paginate?page=${page + 1}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setGallerys(response.data.data);
      console.log(response.data.data)
      setTotalItems(response.data.meta.total);
      setLoading(false);
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Failed to fetch gallery items:", error.response ? error.response.data : error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    console.log(`Page change requested: ${newPage}`);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`Rows per page change requested: ${newRowsPerPage}`);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const theme = useTheme();
  const emptyRows = Math.max(0, rowsPerPage - gallerys.length);

  const [pincode, setPincode] = useState([]);
  
  useEffect(() => {
     gallery();
  }, []);

  const gallery = async () => {
    const accessToken = Cookies.get("japAccessToken");

    try {
      const response = await axios.get(
        "https://server-api.jap.bio/api/v1/gallery/paginate",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const responseData = response.data.data;

      // Verify responseData format and structure

      if (Array.isArray(responseData)) {
        setPincode(responseData);
      } else {
        console.error("Invalid pincode data format:", responseData);
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      throw ("Failed to fetch Pincode",error.response.data);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const handleCategoryIdChange = (event) => {
    console.log("Selected category ID:", event.target.value);
    setCategoryId(event.target.value);
  };

  const handleGalleryNameChange = (event) => {
    setGalleryName(event.target.value);
  };
  const [title, setTitle] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [description, setDescription] = useState('');

 const handleSubmit = async () => {
  if (!selectedImage || !categoryId || !title || !imageTitle || !description) {
    console.error("Please select an image, category, enter a title, image title, and description.");
    return;
  }

  const formData = new FormData();
  formData.append("image", selectedImage);
  formData.append("category_id", categoryId);
  formData.append("title", title);
  formData.append("image_title", imageTitle);
  formData.append("description", description);

  const accessToken = Cookies.get("japAccessToken");

  try {
    const response = await axios.post(
      'https://server-api.jap.bio/api/v1/gallery/create',
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        }
      }
    );
    console.log("Upload success:", response.data);
    
    setImages([...images, { imageUrl: response.data.imageUrl, categoryId }]);

    setSelectedImage(null);
    setCategoryId('');
    setTitle('');
    setImageTitle('');
    setDescription('');
    handleClose();
    gallery();
    fetchGallery();
  } catch (error) {
    if (error.response.status === 401 || error.response.status === 401) {
      redirectLoginPage();
    }
    console.error("Upload error:", error);
  }
};


const handleUpdate = async (event) => {
  event.preventDefault();
  const formData = new FormData();
  if (selectedImage) {
    formData.append("image", selectedImage);
  }
  formData.append("category_id", categoryId);
  formData.append("title", title);
  formData.append("image_title", imageTitle);
  formData.append("description", description);
  const accessToken = Cookies.get("japAccessToken");

  try {
    const id = currentRow?.id;
    console.log(id);
    if (!id) {
      console.error("Row ID is undefined");
      return;
    }

    const response = await axios.post(
      `https://server-api.jap.bio/api/v1/gallery/update/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response && response.data) {
      console.log("Update success:", response.data);
    } else {
      console.error("Update response or data is undefined");
    }
    setSelectedImage(null);
    setCategoryId("");
    setTitle("");
    setImageTitle("");
    setDescription("");
    handleClose2();
    gallery();
    fetchGallery();
  } catch (error) {
    if (error.response.status === 401 || error.response.status === 401) {
      redirectLoginPage();
    }
    console.error("Error updating:", error);
    // Handle error appropriately
  }
};

useEffect(() => {
  if (currentRow) {
    // Set the initial state of form fields using data from the current row
    setCategoryId(currentRow.category_id || "");
    setTitle(currentRow.title || "");
    setImageTitle(currentRow.image_title || "");
    setDescription(currentRow.description || "");
  }
}, [currentRow]);

  useEffect(() => {
    if (pincode) {
      setState(pincode.state);
      setMinPincode(pincode.minPincode);
    }
  }, [pincode]);

  const handleDeleteGallery = async (galleryId) => {
    const accessToken = Cookies.get("japAccessToken");
  
    try {
      const response = await axios.delete(
        `https://server-api.jap.bio/api/v1/gallery/delete/${galleryId.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response && response.data) {
        console.log("Deletion successful:", response.data);
        // Remove the deleted gallery from the list of categories
        setCategories(categories.filter(gallery => gallery.id !== galleryId));
      } else {
        console.error("Delete response or data is undefined");
      }
      gallery();
      fetchGallery();
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Error While Deleting:", error);
    }
  };

  const [openedGallery, setOpenedGallery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleOpenModal = async (id) => {
    const accessToken = Cookies.get("japAccessToken");
    try {
      console.log("Fetching gallery details...", id);
      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/gallery/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Gallery details fetched successfully:", response.data.product);
  
      // Assuming the response contains gallery details
      const gallery = response.data.product;
      console.log("Gallery:", gallery);
  
      // Update the openedGallery state with the entire gallery object
      setOpenedGallery(gallery);
  
      // Open the modal
      setIsModalOpen(true);
      console.log("Modal opened.");
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Error fetching gallery:", error);
    }
  };
  
  useEffect(() => {
    // Fetch categories from API
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const accessToken = Cookies.get("japAccessToken"); // Get access token from local storage or wherever it is stored
      const response = await axios.get(
        'https://server-api.jap.bio/api/v1/gallery-category/paginate',
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
      console.error("Error fetching categories:", error);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
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
            Gallery
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
            Create Gallery
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
            <TableHead sx={{ background: "#F7FAFF" }}>
              <TableRow>
                <TableCell
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                 Gallery-ID
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Title
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Description
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Image_title
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Image
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Created_at
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Upadted_at
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              gallerys.map((row) => (
                <TableRow key={row.id}>
                  <TableCell
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }} className="ml-10px">
                      <Box>
                        <Typography as="h4" sx={{ fontWeight: "500", fontSize: "13.5px" }} className='ml-10px'>
                          {row.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center" style={{ borderBottom: "1px solid #F7FAFF", fontSize: "13px", paddingTop: "13px", paddingBottom: "13px" }}>
                    {row.title}
                  </TableCell>
                  <TableCell align="center" style={{ borderBottom: "1px solid #F7FAFF", fontSize: "13px", paddingTop: "13px", paddingBottom: "13px" }}>
                    {row.description}
                  </TableCell>
                  <TableCell align="center" style={{ borderBottom: "1px solid #F7FAFF", fontSize: "13px", paddingTop: "13px", paddingBottom: "13px" }}>
                    {row.image_title}
                  </TableCell>
                  <TableCell align="center">
                    <img style={{ width: "50px" }} src={row.image_link} alt="Product" />
                  </TableCell>
                  <TableCell align="center" style={{ borderBottom: "1px solid #F7FAFF", fontSize: "13px", paddingTop: "13px", paddingBottom: "13px" }}>
                    {row.created_at}
                  </TableCell>
                  <TableCell align="center" style={{ borderBottom: "1px solid #F7FAFF", fontSize: "13px", paddingTop: "13px", paddingBottom: "13px" }}>
                    {row.updated_at}
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: "1px solid #F7FAFF" }}>
                    <Box sx={{ display: "inline-block" }}>
                      <Tooltip title="View" placement="top">
                        <IconButton aria-label="view" size="small" color="info" className="info" onClick={() => handleOpenModal(row.id)}>
                          <VisibilityIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove" placement="top">
                        <IconButton aria-label="remove" size="small" color="danger" className="danger" onClick={() => handleDeleteGallery(row)}>
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rename" placement="top">
                        <IconButton aria-label="rename" size="small" color="primary" className="primary" onClick={() => handleClickOpen2(row)}>
                          <DriveFileRenameOutlineIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}

            {emptyRows > 0 && !loading && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={8} style={{ borderBottom: "1px solid #F7FAFF" }} />
              </TableRow>
            )}
          </TableBody>
            <TableFooter>
              <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                colSpan={8}
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={() => (
                  <Box sx={{ flexShrink: 0, ml: 2.5 }}>
                    <IconButton onClick={() => handleChangePage(null, 0)} disabled={page === 0} aria-label="first page">
                      {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
                    </IconButton>
                    <IconButton onClick={() => handleChangePage(null, page - 1)} disabled={page === 0} aria-label="previous page">
                      {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                    </IconButton>
                    <IconButton onClick={() => handleChangePage(null, page + 1)} disabled={page >= Math.ceil(totalItems / rowsPerPage) - 1} aria-label="next page">
                      {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                    </IconButton>
                    <IconButton onClick={() => handleChangePage(null, Math.max(0, Math.ceil(totalItems / rowsPerPage) - 1))} disabled={page >= Math.ceil(totalItems / rowsPerPage) - 1} aria-label="last page">
                      {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
                    </IconButton>
                  </Box>
                )}
              />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
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
                {openedGallery && (
                  <div>
                    <h2>Gallery</h2>
                    <p>Gallery ID: {openedGallery.id}</p>
                    <p>Title: {openedGallery.title}</p>
                    <p>Description: {openedGallery.description}</p>
                    <p>Image_title: {openedGallery.image_title}</p>
                    {/* <p>Title: {openedGallery.title || 'N/A'}</p> */}
                    {/* <p>Description: {openedGallery.description || 'N/A'}</p> */}
                    <p>Image: <img src={openedGallery.image_link} alt="Gallery Image" /></p>
                    <p>Created At: {openedGallery.created_at}</p>
                    <p>Updated At: {openedGallery.updated_at}</p>
                  </div>
                )}
                </div>
              </Box>
            </Box>
          </Fade>
        </Modal>
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
              Create Gallery
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
              <Select
                value={categoryId}
                onChange={handleCategoryIdChange}
                fullWidth
                id="categoryId"
                style={{ borderRadius: 8 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>

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
              <TextField
                required
                fullWidth
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                required
                fullWidth
                id="imageTitle"
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                required
                fullWidth
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                required
                fullWidth
                id="image"
                type="file"
                autoFocus
                onChange={handleImageUpload}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
              />
              
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  mt: 2,
                  textTransform: "capitalize",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "13px",
                  padding: "12px 20px",
                  color: "#fff !important"
                }}
              >
                <AddIcon sx={{ position: "relative", top: "-2px" }} className='mr-5px' /> Upload
              </Button>
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
              Update
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
              <Select
                value={categoryId}
                onChange={handleCategoryIdChange}
                fullWidth
                id="categoryId"
                style={{ borderRadius: 8 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>

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
              <TextField
                required
                fullWidth
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                required
                fullWidth
                id="imageTitle"
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                required
                fullWidth
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
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
              <TextField
                required
                fullWidth
                id="image"
                type="file"
                autoFocus
                onChange={handleImageUpload}
                InputProps={{
                  style: { borderRadius: 8 },
                }}
              />
        
          <Button
            onClick={handleUpdate}
            variant="contained"
            sx={{
              mt: 2,
              textTransform: "capitalize",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "13px",
              padding: "12px 20px",
              color: "#fff !important"
            }}
          >
            <AddIcon sx={{ position: "relative", top: "-2px" }} className='mr-5px' /> Update
          </Button>
        </Box>
          </Box>
        </Box>
      </BootstrapDialog>
    </>
  );
}
