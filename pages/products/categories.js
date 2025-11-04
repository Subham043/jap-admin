import React,{useState, useEffect} from "react";
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
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Cookies from "js-cookie";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";
import { useCallback } from "react";
import CategoryModal from "../../components/Modal/category-modal";

// Create new user Modal
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function CategoryPagination(props) {
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

CategoryPagination.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

function CategoryDeleteButton({ id, fetchCategories }) {
  const [loading, setLoading] = useState(false);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const handleDeleteCategory = useCallback(async () => {
    if (confirm("Are you sure you want to delete this item?")) {
      setLoading(true);
      try {
        const accessToken = Cookies.get("japAccessToken");

        if (accessToken && id) {
          const categoryId = id;
          const response = await axios.delete(
            `https://server-api.jap.bio/api/v1/category/delete/${categoryId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          // Perform any additional actions after successful deletion
          // Reload the page or update the pincode list
          // For example, you can call fetchPincode() to update the pincode list
          fetchCategories();
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
  }, [fetchCategories, id, redirectLoginPage]);

  return (
    <Tooltip title="Remove" placement="top">
      <IconButton
        aria-label="remove"
        size="small"
        color="danger"
        className="danger"
        disabled={loading}
        onClick={handleDeleteCategory}
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

CategoryDeleteButton.propTypes = {
  fetchCategories: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
};



export default function User() {
  // Table
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const {redirectLoginPage} = useCheckUnauthenticated();
 
  // Create new user modal
  const [modal, setModal] = useState({ status: false, type: "create" });

  const handleClose = () => {
    setModal({ status: false, type: "create" });
  };
  
  
  // End Add Task Modal
  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories]=useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
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
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
    }finally {
      setLoading(false);
    }
  }, [page, redirectLoginPage, rowsPerPage]);

  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage, fetchCategories]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
                  <TableCell align="left">
                    <img
                      src={category.banner_image_link}
                      alt="Product Img"
                      width={50}
                      className="borderRadius10"
                    />
                  </TableCell>
                  <TableCell align="left">
                    <img
                      src={category.icon_image_link}
                      alt="Product Img"
                      width={50}
                      className="borderRadius10"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "inline-block",
                      }}
                    >
                      <CategoryDeleteButton
                        id={category.id}
                        fetchCategories={fetchCategories}
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
                              data: {
                                ...category,
                                is_active: category.is_active ? "1" : "0",
                              },
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

              {categories.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    style={{ borderBottom: "1px solid #F7FAFF" }}
                  >
                    No Categories Found
                  </TableCell>
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
                  ActionsComponent={CategoryPagination}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>

      <CategoryModal
        modal={modal}
        handleClose={handleClose}
        refetch={fetchCategories}
      />
    </>
  );
}
