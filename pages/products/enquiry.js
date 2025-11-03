import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
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
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { useState, useEffect } from "react";
import axios from "axios";
import { useCallback } from "react";
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
// End Create new user Modal

function EnquiryPagination(props) {
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

EnquiryPagination.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

function EnquiryDeleteButton({ id, fetchEnquiries }) {
  const [loading, setLoading] = useState(false);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const handleDeleteEnquiry = useCallback(async () => {
    if (confirm("Are you sure you want to delete this item?")) {
      setLoading(true);
      try {
        const accessToken = Cookies.get("japAccessToken");

        if (accessToken && id) {
          const enquiryId = id;
          const response = await axios.delete(
            `https://server-api.jap.bio/api/v1/enquiry/delete/${enquiryId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          // Perform any additional actions after successful deletion
          // Reload the page or update the pincode list
          // For example, you can call fetchPincode() to update the pincode list
          fetchEnquiries();
        }
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 401) {
          redirectLoginPage();
        }
        console.error("Error deleting pincode:", error.response.data);
        // Handle error case
      } finally {
        setLoading(false);
      }
    }
  }, [fetchEnquiries, id]);

  return (
    <Tooltip title="Remove" placement="top">
      <IconButton
        aria-label="remove"
        size="small"
        color="danger"
        className="danger"
        disabled={loading}
        onClick={handleDeleteEnquiry}
      >
        {loading ? (
          <CircularProgress color="inherit" />
        ) : (
          <DeleteIcon fontSize="inherit" />
        )}
      </IconButton>
    </Tooltip>
  );
}

EnquiryDeleteButton.propTypes = {
  fetchEnquiries: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
};

export default function User() {
  // Table
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(0);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Create new user modal
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  /**/
  const [open2, setOpen2] = React.useState(false);

  const handleClickOpen2 = (row) => {
    setOpen2(true);
    setCurrentEnquiry(row)
    console.log(row);

  };
  const handleClose2 = () => {
    setOpen2(false);
  };
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }));
  };

    // Define state variables
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [address, setAddress] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [company_website, setCompany_website]= useState('');
    const [designation, setDesignation] = useState('');
    const [product, setProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [gst,setGst]= useState('');
    const [certification, setCertification] = useState('');

const [currentEnquiry, setCurrentEnquiry] = useState(null);

  const [enquiries, setEnquiries] = useState([]);
  
  const fetchEnquiries = useCallback(async () => {
    const accessToken = Cookies.get("japAccessToken");
    try {
      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/enquiry/paginate?page=${page}&total=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setEnquiries(response.data.data);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error('Error fetching enquiries:', error.response.data);
      // Handle error
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchEnquiries();
  }, [page, rowsPerPage, fetchEnquiries]);


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.target);
      formData.append('name', name),
      formData.append('email', email),
      formData.append('phone', phone),
      formData.append('message', message)
      formData.append('address', address)
      formData.append('company_name', companyName)
      formData.append('company_website', company_website)
      formData.append('designation', designation)
      formData.append('product', product)
      formData.append('quantity', quantity)
      formData.append('gst', gst)
      formData.append('certification', certification)

      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const response = await axios.post(
          'https://server-api.jap.bio/api/v1/enquiry/create',
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            }
          }
        );
        console.log('Enquiry created:', response.data);

        // Reset the form fields
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setAddress('');
        setCompanyName('');
        setCompany_website('');
        setDesignation('');
        setProduct('');
        setQuantity('');
        setGst('');
        setCertification('');
        setMessage('')

        handleClose();
        fetchEnquiries();
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error('Error creating enquiry:', error.response.data);
    }
  };

  const handleUpdateEnquiry = async (event) => {
    event.preventDefault();
  
    try {
      const formData = new FormData(event.target);
      formData.append("name", currentEnquiry.name);
      formData.append("email", currentEnquiry.email);
      formData.append("phone", currentEnquiry.phone);
      formData.append("message", currentEnquiry.message);
      formData.append('address', currentEnquiry.address)
      formData.append('company_name', currentEnquiry.companyName)
      formData.append('company_website', currentEnquiry.company_website)
      formData.append('designation', currentEnquiry.designation)
      formData.append('product', currentEnquiry.product)
      formData.append('quantity', currentEnquiry.quantity)
      formData.append('gst', currentEnquiry.gst)
      formData.append('certification', currentEnquiry.certification)
  
      const accessToken = Cookies.get("japAccessToken");
  
      if (accessToken && currentEnquiry && currentEnquiry.id) {
        const enquiryId = currentEnquiry.id;
        const response = await axios.post(
          `https://server-api.jap.bio/api/v1/enquiry/update/${enquiryId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        setOpen2(false);
        setCurrentEnquiry(null);
        console.log("Enquiry updated:", response.data);
  
        // Reset the form fields
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setAddress('');
        setCompanyName('');
        setCompany_website('');
        setDesignation('');
        setProduct('');
        setQuantity('');
        setGst('');
        setCertification('');
        setMessage('')
        
        handleClose2();
        fetchEnquiries();
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Error updating enquiry:", error.response.data);
    }
  };
  useEffect(() => {
    if (currentEnquiry) {
        setName(currentEnquiry.name);
        setEmail(currentEnquiry.email);
        setPhone(currentEnquiry.phone);
        setMessage(currentEnquiry.message);
        setAddress(currentEnquiry.address);
        setCompanyName(currentEnquiry.companyname);
        setCompany_website(currentEnquiry.company_website);
        setDesignation(currentEnquiry.designation);
        setProduct(currentEnquiry.product);
        setQuantity(currentEnquiry.quantity);
        setGst(currentEnquiry.gst);
        setCertification(currentEnquiry.certification);
        setMessage(currentEnquiry.message)
        
    }
  }, [currentEnquiry]);

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
            Enquiry List
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
              className="mr-5px"
            />{" "}
            Create New Enquiry
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
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Name{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Email{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Phone{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Message{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Address{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Company Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Company Website{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Designation{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Product{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Quantity{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  GST{" "}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Certification{" "}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  {" "}
                  Action{" "}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enquiries.map((row) => (
                <TableRow key={row.id}>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.name}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.email}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.phone}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.message}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.address}
                  </TableCell>{" "}
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.company_name}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.company_website}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.designation}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.product}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.quantity}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.gst}
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {row.certification}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottom: "1px solid #F7FAFF" }}
                  >
                    <Box
                      sx={{
                        display: "inline-block",
                      }}
                    >
                      <EnquiryDeleteButton
                        id={row.id}
                        fetchEnquiries={fetchEnquiries}
                      />
                      <Tooltip title="Rename" placement="top">
                        <IconButton
                          aria-label="rename"
                          size="small"
                          color="primary"
                          className="primary"
                          onClick={() => handleClickOpen2(row)}
                        >
                          <DriveFileRenameOutlineIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {enquiries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    style={{ borderBottom: "1px solid #F7FAFF" }}
                  >
                    No enquiries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={8}
                  count={totalItems}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: {
                      "aria-label": "rows per page",
                    },
                    native: true,
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={EnquiryPagination}
                  style={{ borderBottom: "none" }}
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
              Create New Enquiry
            </Typography>

            <IconButton aria-label="remove" size="small" onClick={handleClose}>
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
                  <TextField
                    autoComplete="companyName"
                    name="companyName"
                    required
                    fullWidth
                    id="companyName"
                    label="CompanyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
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
                    Company_Website
                  </Typography>
                  <TextField
                    autoComplete="company_website"
                    name="company_website"
                    required
                    fullWidth
                    id="company_website"
                    label="Company_website"
                    value={company_website}
                    onChange={(e) => setCompany_website(e.target.value)}
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
                    Email
                  </Typography>
                  <TextField
                    autoComplete="email"
                    name="email"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    Phone
                  </Typography>
                  <TextField
                    autoComplete="phone"
                    name="phone"
                    required
                    fullWidth
                    id="phone"
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                    Designation
                  </Typography>
                  <TextField
                    autoComplete="designation"
                    name="designation"
                    required
                    fullWidth
                    id="designation"
                    label="Designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
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
                    Product
                  </Typography>
                  <TextField
                    autoComplete="product"
                    name="product"
                    required
                    fullWidth
                    id="product"
                    label="Product"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
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
                    Quantity
                  </Typography>
                  <TextField
                    autoComplete="quantity"
                    name="quantity"
                    required
                    fullWidth
                    id="quantity"
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
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
                    GST
                  </Typography>
                  <TextField
                    autoComplete="gst"
                    name="gst"
                    required
                    fullWidth
                    id="gst"
                    label="Gst"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
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
                    Certification Type
                  </Typography>
                  <TextField
                    autoComplete="certification"
                    name="certification"
                    required
                    fullWidth
                    id="certification"
                    label="Certification"
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
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
                    Address
                  </Typography>
                  <TextField
                    autoComplete="address"
                    name="address"
                    required
                    fullWidth
                    id="address"
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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
                    Message
                  </Typography>
                  <TextField
                    autoComplete="message"
                    name="message"
                    required
                    fullWidth
                    id="message"
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    InputProps={{
                      style: { borderRadius: 8 },
                    }}
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
                    <AddIcon
                      sx={{
                        position: "relative",
                        top: "-2px",
                      }}
                      className="mr-5px"
                    />{" "}
                    Create Enquiry
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
              Update Enquiry
            </Typography>

            <IconButton aria-label="remove" size="small" onClick={handleClose2}>
              <ClearIcon />
            </IconButton>
          </Box>

          <Box component="form" noValidate onSubmit={handleUpdateEnquiry}>
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
                  <TextField
                    autoComplete="company_name"
                    name="company_name"
                    required
                    fullWidth
                    id="company_name"
                    label="company_name"
                    value={companyName}
                    onChange={(e) => setComapnyName(e.target.value)}
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
                    Email
                  </Typography>
                  <TextField
                    autoComplete="email"
                    name="email"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    Phone
                  </Typography>
                  <TextField
                    autoComplete="phone"
                    name="phone"
                    required
                    fullWidth
                    id="phone"
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                    Designation
                  </Typography>
                  <TextField
                    autoComplete="designation"
                    name="designation"
                    required
                    fullWidth
                    id="designation"
                    label="Designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
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
                    Product
                  </Typography>
                  <TextField
                    autoComplete="product"
                    name="product"
                    required
                    fullWidth
                    id="product"
                    label="Product"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
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
                    Quantity
                  </Typography>
                  <TextField
                    autoComplete="quantity"
                    name="quantity"
                    required
                    fullWidth
                    id="quantity"
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
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
                    GST
                  </Typography>
                  <TextField
                    autoComplete="gst"
                    name="gst"
                    required
                    fullWidth
                    id="gst"
                    label="Gst"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
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
                    Certification Type
                  </Typography>
                  <TextField
                    autoComplete="certification"
                    name="certification"
                    required
                    fullWidth
                    id="certification"
                    label="Certification"
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
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
                    Address
                  </Typography>
                  <TextField
                    autoComplete="address"
                    name="address"
                    required
                    fullWidth
                    id="address"
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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
                    Message
                  </Typography>
                  <TextField
                    autoComplete="message"
                    name="message"
                    required
                    fullWidth
                    id="message"
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    InputProps={{
                      style: { borderRadius: 8 },
                    }}
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
                    <AddIcon
                      sx={{
                        position: "relative",
                        top: "-2px",
                      }}
                      className="mr-5px"
                    />{" "}
                    Update Enquiry
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
