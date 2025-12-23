import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiFilter,
  FiX,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState({
    foodCount: 0,
    userCount: 0,
    orderCount: 0,
    totalRevenue: 0,
    graphData: [],
    paymentStats: [],
  });

  // State lưu ngày lọc
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 👇 Gửi dateFilter lên API
        let apiPath = `${url}/api/order/admin/dashboard`;
        if (dateFilter) {
          apiPath += `?date=${dateFilter}`;
        }

        const res = await axios.get(apiPath);
        if (res.data.success) setStats(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, [url, dateFilter]); // Chạy lại khi dateFilter thay đổi

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tổng quan kinh doanh</h2>

        {/* 👇 BỘ LỌC NGÀY */}
        <div className="date-filter-box">
          <FiFilter className="icon" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-input"
          />
          {/* Nút xóa lọc */}
          {dateFilter && (
            <button className="clear-filter" onClick={() => setDateFilter("")}>
              <FiX /> Bỏ lọc (Xem tất cả)
            </button>
          )}
        </div>
      </div>

      {/* --- ROW 1: STAT CARDS --- */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <h3>Doanh thu {dateFilter ? "(Theo ngày)" : "(Tổng)"}</h3>
            <p>{stats.totalRevenue.toLocaleString()} ₫</p>
          </div>
        </div>
        <div className="stat-card orders">
          <div className="stat-icon">
            <FiShoppingBag />
          </div>
          <div className="stat-info">
            <h3>Đơn hàng {dateFilter ? "(Theo ngày)" : "(Tổng)"}</h3>
            <p>{stats.orderCount}</p>
          </div>
        </div>
        <div className="stat-card users">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>Khách hàng</h3>
            <p>{stats.userCount}</p>
          </div>
        </div>
        <div className="stat-card foods">
          <div className="stat-icon">
            <FiBox />
          </div>
          <div className="stat-info">
            <h3>Món ăn</h3>
            <p>{stats.foodCount}</p>
          </div>
        </div>
      </div>

      {/* --- ROW 2: CHARTS --- */}
      <div className="charts-section">
        <div className="chart-container main-chart">
          <h3>Xu hướng doanh thu (7 ngày qua)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.graphData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v) => `${v.toLocaleString()} ₫`}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Bar
                  dataKey="sales"
                  fill="#e4002b"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-container sub-chart">
          <h3>Thanh toán {dateFilter ? "(Ngày này)" : "(Tất cả)"}</h3>

          {stats.paymentStats.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.paymentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.paymentStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p
              style={{ textAlign: "center", color: "#999", marginTop: "50px" }}
            >
              Chưa có dữ liệu ngày này
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
