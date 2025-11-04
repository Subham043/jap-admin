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
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog'; 
import { useEffect,useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";
import { useCallback } from "react";
import GalleryModal from "../../components/Modal/gallery-modal";

// Create new user Modal
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function GalleryPagination(props) {
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

GalleryPagination.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

function GalleryDeleteButton({ id, fetchGallery }) {
  const [loading, setLoading] = useState(false);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const handleDeleteGallery = useCallback(async () => {
    if (confirm("Are you sure you want to delete this item?")) {
      setLoading(true);
      try {
        const accessToken = Cookies.get("japAccessToken");

        if (accessToken && id) {
          const galleryId = id;
          const response = await axios.delete(
            `https://server-api.jap.bio/api/v1/gallery/delete/${galleryId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          // Perform any additional actions after successful deletion
          // Reload the page or update the pincode list
          // For example, you can call fetchPincode() to update the pincode list
          fetchGallery();
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
  }, [fetchGallery, id, redirectLoginPage]);

  return (
    <Tooltip title="Remove" placement="top">
      <IconButton
        aria-label="remove"
        size="small"
        color="danger"
        className="danger"
        disabled={loading}
        onClick={handleDeleteGallery}
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

GalleryDeleteButton.propTypes = {
  fetchGallery: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
};

export default function User() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const {redirectLoginPage} = useCheckUnauthenticated();

  const [modal, setModal] = React.useState({ status: false, type: "create" });
  
  const handleClose = () => {
    setModal({ status: false, type: "create" });
  };

  const [gallerys, setGallerys] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    const accessToken = Cookies.get("japAccessToken");
    try {
      const response = await axios.get(
        `https://server-api.jap.bio/api/v1/gallery/paginate?page=${
          page + 1
        }&total=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setGallerys(response.data.data);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
    }finally {
      setLoading(false);
    }
  }, [page, redirectLoginPage, rowsPerPage]);

  
  useEffect(() => {
    fetchGallery();
  }, [page, rowsPerPage, fetchGallery]);

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
            Gallery
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
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Title
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Image alt
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
                  Created at
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Upadted at
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
                      align="center"
                      style={{
                        borderBottom: "1px solid #F7FAFF",
                        fontSize: "13px",
                        paddingTop: "13px",
                        paddingBottom: "13px",
                      }}
                    >
                      {row.title}
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
                      {row.image_alt}
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
                      <img
                        style={{ width: "50px" }}
                        src={row.image_link}
                        alt="Product"
                      />
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
                      {row.created_at}
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
                      {row.updated_at}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ borderBottom: "1px solid #F7FAFF" }}
                    >
                      <Box sx={{ display: "inline-block" }}>
                        <GalleryDeleteButton
                          id={row.id}
                          fetchGallery={fetchGallery}
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
                ))
              )}

              {gallerys.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    style={{ borderBottom: "1px solid #F7FAFF" }}
                  >
                    No images found.
                  </TableCell>
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
                    inputProps: { "aria-label": "rows per page" },
                    native: true,
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={GalleryPagination}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>

      <GalleryModal
        modal={modal}
        handleClose={handleClose}
        refetch={fetchGallery}
      />
    </>
  );
}
