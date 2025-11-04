import * as React from "react";
import { Box, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import axios from 'axios';
import { useCallback } from "react";
import TaxModal from "../../components/Modal/tax-modal";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";

export default function User() {
  // Table
  const [rows, setRows] = useState();
  const {redirectLoginPage} = useCheckUnauthenticated();

  // Create new user modal
  const [modal, setModal] = React.useState({status: false});

  const handleClose = () => {
    setModal({ status: false });
  };

  // Function to fetch the tax details from the API
  const fetchTaxDetails = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken'); // Get the authentication token from local storage

      // Make the API call to fetch the tax details
      const response = await axios.get('https://server-api.jap.bio/api/v1/tax', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Set the tax details in the state
      setRows(response.data.tax); // Assuming the API response contains an array of tax details
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error('Failed to fetch tax details:', error.response.data);
    }
  }, [redirectLoginPage]);

  // Fetch the tax details when the component mounts
  useEffect(() => {
    fetchTaxDetails();
  }, [fetchTaxDetails]);
  // End Add Task Modal

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
            Tax
          </Typography>

          <Button
            onClick={() =>
              setModal({
                status: true,
                data: { tax_in_percentage: rows ? rows.tax_in_percentage : 0 },
              })
            }
            disabled={rows ? false : true}
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
            <SaveIcon
              sx={{ position: "relative", top: "-1px" }}
              className="mr-5px"
            />{" "}
            Update Tax
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
                  Tax Percentage
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Created On
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Updated On
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows ? (
                <TableRow key={rows.id}>
                  <TableCell align="center">
                    {rows.tax_in_percentage}%
                  </TableCell>
                  <TableCell align="center">{rows.created_at}</TableCell>
                  <TableCell align="center">{rows.updated_at}</TableCell>

                  {/* Add more TableCell components for other data */}
                </TableRow>
              ) : (
                // Render a message if tax data is not available
                <TableRow>
                  <TableCell
                    colSpan={3}
                    style={{ borderBottom: "1px solid #F7FAFF" }}
                  >
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <TaxModal
        modal={modal}
        handleClose={handleClose}
        refetch={fetchTaxDetails}
      />
    </>
  );
}
