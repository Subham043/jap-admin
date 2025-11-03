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
import axios from 'axios';
import { useCallback } from "react";
import DeliveryChargeModal from "./delivery-charge-modal";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";


export default function User() {
  // Table
 
  // Create new user modal
  const {redirectLoginPage} = useCheckUnauthenticated();
  const [modal, setModal] = React.useState({status: false});

  const handleClose = () => {
    setModal({ status: false });
  };

  // End Add Task Modal
  const [data, setData] = React.useState();

  const fetchData = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken'); // Get the authentication token from local storage

      const response = await axios.get('https://server-api.jap.bio/api/v1/delivery-charge',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setData(response.data.deliveryCharge); 
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error('Error fetching data:', error.response.data);
    }
  }, []);

  // Fetch data from the API when the component mounts
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            Delivery Charge
          </Typography>

          <Button
            onClick={() =>
              setModal({
                status: true,
                data: {
                  delivery_charges: data ? data.delivery_charges : 0,
                  no_delivery_charges_for_cart_total_price_above: data
                    ? data.no_delivery_charges_for_cart_total_price_above
                    : 0,
                },
              })
            }
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
            Update Charges
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
                  Delivery Charge
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderBottom: "1px solid #F7FAFF", fontSize: "13.5px" }}
                >
                  Minimum Cart Charge
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
              {data ? (
                <TableRow key={data.id}>
                  <TableCell
                    align="center"
                    style={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                    }}
                  >
                    {data.delivery_charges}%
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
                    {data.no_delivery_charges_for_cart_total_price_above}
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
                    {data.created_at}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 500,
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "12px",
                      padding: "8px 10px",
                    }}
                  >
                    <span>{data.updated_at}</span>
                  </TableCell>
                </TableRow>
              ) : (
                // Render a message if tax data is not available
                <TableRow>
                  <TableCell
                    colSpan={4}
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

      <DeliveryChargeModal
        modal={modal}
        handleClose={handleClose}
        refetch={fetchData}
      />
    </>
  );
}
