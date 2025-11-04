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
import EnquiryModal from "../../components/Modal/enquiry-modal";

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
  }, [fetchEnquiries, id, redirectLoginPage]);

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

  const [modal, setModal] = React.useState({ status: false, type: "create" });
  
  const handleClose = () => {
    setModal({ status: false, type: "create" });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [enquiries, setEnquiries] = useState([]);
  
  const fetchEnquiries = useCallback(async () => {
    const accessToken = Cookies.get("japAccessToken");
    try {
      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/enquiry/paginate?page=${page+1}&total=${rowsPerPage}`,
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
  }, [page, redirectLoginPage, rowsPerPage]);

  useEffect(() => {
    fetchEnquiries();
  }, [page, rowsPerPage, fetchEnquiries]);

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
            onClick={() => setModal({ status: true, type: "create" })}
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
                          onClick={() =>
                            setModal({
                              status: true,
                              type: "update",
                              data: row,
                            })
                          }
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

      <EnquiryModal
        modal={modal}
        handleClose={handleClose}
        refetch={fetchEnquiries}
      />
    </>
  );
}
