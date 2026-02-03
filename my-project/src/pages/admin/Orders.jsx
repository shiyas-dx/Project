import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("admin/orders/");
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirm = await Swal.fire({
      title: "Cancel Order?",
      text: "This order will be cancelled!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No",
      background: "#111",
      color: "#fff",
      confirmButtonColor: "#ff00cc",
    });

    if (confirm.isConfirmed) {
      try {
        await api.patch(`admin/orders/${orderId}/cancel/`);

        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "CANCELLED" } : o
          )
        );

        Swal.fire("Cancelled!", "Order has been cancelled.", "success");
      } catch (error) {
        console.error("Error cancelling order:", error);
        Swal.fire("Error!", "Something went wrong while cancelling.", "error");
      }
    }
  };
  const handleReorder = async (orderId) => {
    const confirm = await Swal.fire({
      title: "Reorder this order?",
      text: "This will create a new order with the same products.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, reorder",
      cancelButtonText: "No",
      background: "#111",
      color: "#fff",
      confirmButtonColor: "#00ccff",
    });

    if (!confirm.isConfirmed) return;

    try {
      const { data } = await api.post(`orders/admin/orders/${orderId}/reorder/`);


      setOrders(prev => [ { ...data }, ...prev ]);

      Swal.fire("Reordered!", "A new order has been created.", "success");
    } catch (error) {
      console.error("Error reordering:", error);
      Swal.fire("Error!", "Something went wrong while reordering.", "error");
    }
  };


const handleDeleteOrder = async (orderId) => {
  const confirm = await Swal.fire({
    title: "Delete Order?",
    text: "This order will be permanently deleted!",
    icon: "error",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "No",
    background: "#111",
    color: "#fff",
    confirmButtonColor: "#ff0033",
  });

  if (confirm.isConfirmed) {
    try {
      await api.delete(`orders/admin/orders/${orderId}/delete/`);

      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      Swal.fire("Deleted!", "Order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Failed to delete order.", "error");
    }
  }
};


  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="admin-table-section">
      <h1 style={{display:"flex" ,justifyContent:"center", paddingBottom:"20px"}}>Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Email</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {orders.map(o => (
                <motion.tr
                  key={o.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <td>{o.id}</td>
                  <td>{o.userEmail}</td>
                  <td>
                    {o.products.map((p, i) => (
                      <div key={i}>
                        {p.name} (Qty: {p.quantity})
                      </div>
                    ))}
                  </td>
                  <td>
                    ₹
                    {o.products
                      .reduce((sum, p) => sum + p.price * p.quantity, 0)
                      .toLocaleString()}
                  </td>



                    <td>
                      {o.status === "CANCELLED" ? (
                        <>
                          <span style={{ color: "red", fontWeight: "bold", marginRight: "10px" }}>
                            Cancelled
                          </span>

                          <button onClick={() => handleReorder(o.id)} style={{ marginRight: "8px" }}>
                            Reorder
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            style={{ background: "#ff0033", color: "#fff" }}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleCancelOrder(o.id)}
                            style={{ marginRight: "8px" }}
                          >
                            Cancel Order
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            style={{ background: "#ff0033", color: "#fff" }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>




                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;