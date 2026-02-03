import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("admin/dashboard/");

        setUsers(data.users);
        setProducts(data.products);
        setOrders(data.orders);

      } catch (error) {
        console.error("Admin dashboard error:", error);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.products.reduce((oSum, p) => oSum + p.price * (p.quantity || 1), 0),
    0
  );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF00CC"];
  const salesData = products.map(p => ({
    name: p.name,
    sales: orders.reduce((sum, o) => {
      const match = o.products.find(pr => pr.id === p.id);
      return sum + (match ? match.quantity || 0 : 0);
    }, 0),
  }));

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <h1 className="admin-header">Admin Dashboard 👑</h1>

      <div className="dashboard-metrics">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
          { label: "Total Orders", value: orders.length },
          { label: "Total Users", value: users.length },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            className="metric-card"
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <h2>{metric.value}</h2>
            <p>{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-charts">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Sales Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={salesData} dataKey="sales" cx="50%" cy="50%" outerRadius={100}>
                {salesData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h3>Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
