import * as React from "react";
import { Box } from "@mui/material";
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
import axios from "axios";
import Cookies from "js-cookie";
import { useCheckUnauthenticated } from "@/components/Authentication/useCheckUnauthenticated";

function OrdersList(props) {
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

OrdersList.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const OrdersLists = () =>{
  const [orders, setOrders] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [count, setCount] = React.useState(0);
  const {redirectLoginPage} = useCheckUnauthenticated();

  React.useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage]);
  const fetchOrders = async () => {
    try {
      const accessToken = Cookies.get("japAccessToken");
      const response = await axios.get(`https://server-api.jap.bio/api/v1/order/paginate?page=${page + 1}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Replace with your access token variable
        },
      }
      );
      console.log(response.data)
      const { data } = response.data;
      setOrders(data);
      setCount(data.total);
    console.log('Orders Fetched for Page', page + 1, response.data.data);

    } catch (error) {
      if (error.response.status === 401 || error.response.status === 401) {
        redirectLoginPage();
      }
      console.error("Error fetching orders:", error);
    }
  };
  const handleChangePage = (event, newPage) => {
    if (newPage < 0) {
      // Loop to the last page if the user goes to a negative page
      setPage(Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    } else if (newPage >= Math.ceil(count / rowsPerPage)) {
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
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, orders.length);


  return (
    <>
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
            Recent Orders
          </Typography>

          
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
          }}
        >
          <Table 
            sx={{ minWidth: 950 }} 
            aria-label="custom pagination table"
            className="dark-table"
          >
          <TableHead sx={{ background: "#F7FAFF" }}>
  <TableRow>
    <TableCell
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Order ID
    </TableCell>
    <TableCell
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
     Products
    </TableCell>
    <TableCell
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
     Weight
    </TableCell>
    <TableCell
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Total Items
    </TableCell>

    <TableCell
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Total Quantity
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Subtotal
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Total Discount
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Total Price (without GST and Delivery Charge)
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      GST Charge
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Delivery Charge
    </TableCell>
    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Mode Of Payment
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Total Price (with GST and Delivery Charge)
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Coupon Discount
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Total Price (with Coupon Discount)
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Billing First Name
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Billing Last Name
    </TableCell>
    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Billing Adresss
    </TableCell>
    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Billing Number
    </TableCell>
    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Shipping First Name
    </TableCell>

    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Shipping Last Name
    </TableCell>
    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Shipping Adresss
    </TableCell>
    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #F7FAFF",
        fontSize: "13.5px",
        padding: "16px 10px",
      }}
    >
      Shipping Number
    </TableCell>
    
    {/* Add more TableCells for other properties */}
  </TableRow>
</TableHead>
            <TableBody>
                {Array.isArray(orders) ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
          {order.products.length > 0 ? (
            <ul>
              {order.products.map((product) => (
                <li key={product.id}>{product.name}</li>
              ))}
            </ul>
          ) : (
            <p>No products in this order.</p>
          )}
        </TableCell>
        <TableCell>
          {order.products.length > 0 ? (
            <ul>
              {order.products.map((product) => (
                <li key={product.id}>{product.weight}</li>
              ))}
            </ul>
          ) : (
            <p>No products weight.</p>
          )}
        </TableCell>
                      <TableCell>{order.total_items}</TableCell>
                      <TableCell>{order.total_quantity}</TableCell>
                      <TableCell>{order.sub_total}</TableCell>
                      <TableCell>{order.total_discount}</TableCell>
                      <TableCell>{order.total_price_without_gst_delivery_charge}</TableCell>
                      <TableCell>{order.gst_charge}</TableCell>
                      <TableCell>{order.delivery_charge}</TableCell>
                      <TableCell>{order.mode_of_payment}</TableCell>
                      <TableCell>{order.total_price_with_gst_delivery_charge.toFixed(2)}</TableCell>
                      <TableCell>{order.coupon_discount}</TableCell>
                      <TableCell>{order.total_price_with_coupon_dicount}</TableCell>
                      <TableCell>{order.billing_first_name}</TableCell>
                      <TableCell>{order.billing_last_name}</TableCell>
                      <TableCell>{order.billing_address_1} {order.billing_address_2}</TableCell>
                      <TableCell>{order.billing_phone}</TableCell> 
                      <TableCell>{order.shipping_first_name}</TableCell>
                      <TableCell>{order.shipping_last_name}</TableCell>
                      <TableCell>{order.shipping_address_1} {order.shipping_address_2}</TableCell>
                      <TableCell>{order.shipping_phone}</TableCell>                     

                      {/* Add more cells as needed */}
                    </TableRow>
                  ))
                ) : null}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell
                    colSpan={8}
                    style={{ borderBottom: "1px solid #F7FAFF" }}
                  />
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
           { Array.isArray(orders) && orders.length > 0 && (
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  count={count}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={OrdersList}
                />
              </TableRow>
              )}
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
export default OrdersLists;
