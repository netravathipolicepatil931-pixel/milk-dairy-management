import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Dashboard() {
  const [farmers, setFarmers] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [milkCollected, setMilkCollected] = useState(0);
  const [milkSold, setMilkSold] = useState(0);
  const [salesRevenue, setSalesRevenue] = useState(0);
  const [payments, setPayments] = useState(0);
  const [products, setProducts] = useState(0);

  const [recentCollections, setRecentCollections] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    // ==============================
    // BASIC COUNTS
    // ==============================

    const { count: farmerCount } = await supabase
      .from("farmers")
      .select("*", {
        count: "exact",
        head: true,
      });

    const { count: customerCount } = await supabase
      .from("customers")
      .select("*", {
        count: "exact",
        head: true,
      });

    const { count: productCount } = await supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      });

    // ==============================
    // MILK COLLECTION DATA
    // ==============================

    const { data: collectionData } = await supabase
      .from("milk_collections")
      .select(
        "quantity_liters, collection_date, total_amount"
      );

    // ==============================
    // MILK SALES DATA
    // ==============================

    const { data: salesData } = await supabase
      .from("milk_sales")
      .select(
        "quantity_liters, sale_date, total_amount"
      );

    // ==============================
    // PAYMENT DATA
    // ==============================

    const { data: paymentData } = await supabase
      .from("payments")
      .select("amount");

    // ==============================
    // CALCULATE TOTALS
    // ==============================

    const totalCollected =
      collectionData?.reduce(
        (sum, item) =>
          sum + Number(item.quantity_liters || 0),
        0
      ) || 0;

    const totalSold =
      salesData?.reduce(
        (sum, item) =>
          sum + Number(item.quantity_liters || 0),
        0
      ) || 0;

    const totalRevenue =
      salesData?.reduce(
        (sum, item) =>
          sum + Number(item.total_amount || 0),
        0
      ) || 0;

    const totalPayments =
      paymentData?.reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      ) || 0;

    setFarmers(farmerCount || 0);
    setCustomers(customerCount || 0);
    setProducts(productCount || 0);

    setMilkCollected(totalCollected);
    setMilkSold(totalSold);
    setSalesRevenue(totalRevenue);
    setPayments(totalPayments);

    // ==============================
    // RECENT COLLECTIONS
    // ==============================

    const { data: collectionRecords } = await supabase
      .from("milk_collections")
      .select(`
        *,
        farmers ( name )
      `)
      .order("id", {
        ascending: false,
      })
      .limit(5);

    // ==============================
    // RECENT SALES
    // ==============================

    const { data: salesRecords } = await supabase
      .from("milk_sales")
      .select(`
        *,
        customers ( name )
      `)
      .order("id", {
        ascending: false,
      })
      .limit(5);

    // ==============================
    // LOW STOCK PRODUCTS
    // ==============================

    const { data: stockRecords } = await supabase
      .from("products")
      .select("*")
      .lte("stock", 10)
      .order("stock");

    setRecentCollections(collectionRecords || []);
    setRecentSales(salesRecords || []);
    setLowStockProducts(stockRecords || []);

    // ==============================
    // COLLECTION + SALES CHART
    // ==============================

    const collectionChart = {};
    const salesChart = {};

    (collectionData || []).forEach((item) => {
      const date = item.collection_date;

      if (!collectionChart[date]) {
        collectionChart[date] = 0;
      }

      collectionChart[date] += Number(
        item.quantity_liters || 0
      );
    });

    (salesData || []).forEach((item) => {
      const date = item.sale_date;

      if (!salesChart[date]) {
        salesChart[date] = {
          sold: 0,
          revenue: 0,
        };
      }

      salesChart[date].sold += Number(
        item.quantity_liters || 0
      );

      salesChart[date].revenue += Number(
        item.total_amount || 0
      );
    });

    const allDates = [
      ...new Set([
        ...Object.keys(collectionChart),
        ...Object.keys(salesChart),
      ]),
    ];

    const combinedChartData = allDates
      .sort()
      .slice(-10)
      .map((date) => ({
        date,
        collected: collectionChart[date] || 0,
        sold: salesChart[date]?.sold || 0,
        revenue: salesChart[date]?.revenue || 0,
      }));

    setChartData(combinedChartData);

    // ==============================
    // PRODUCT CATEGORY CHART
    // ==============================

    const { data: allProducts } = await supabase
      .from("products")
      .select("category");

    const categoryCounts = {};

    (allProducts || []).forEach((product) => {
      const category = product.category || "Other";

      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }

      categoryCounts[category]++;
    });

    const productCategoryData = Object.entries(
      categoryCounts
    ).map(([name, value]) => ({
      name,
      value,
    }));

    setCategoryData(productCategoryData);

    setLoading(false);
  }

  // ==============================
  // LOADING SCREEN
  // ==============================

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="loading-box">
          <div className="loading-icon">
            🥛
          </div>

          <h2>
            Loading dashboard...
          </h2>

          <p>
            Please wait while we fetch your dairy data.
          </p>
        </div>
      </main>
    );
  }

  // ==============================
  // DASHBOARD
  // ==============================

  return (
    <main className="dashboard-page">

      {/* ================= HEADER ================= */}

      <div className="dashboard-header">

        <div>
          <p className="dashboard-label">
            OVERVIEW
          </p>

          <h1>
            Dairy Dashboard
          </h1>

          <p className="dashboard-description">
            Monitor your dairy operations,
            sales and payments.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboardData}
        >
          🔄 Refresh
        </button>

      </div>

      {/* ================= STAT CARDS ================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon farmer-icon">
            👨‍🌾
          </div>

          <div>
            <p>Total Farmers</p>
            <h2>{farmers}</h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon customer-icon">
            👥
          </div>

          <div>
            <p>Total Customers</p>
            <h2>{customers}</h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon milk-icon">
            🥛
          </div>

          <div>
            <p>Milk Collected</p>
            <h2>
              {milkCollected.toFixed(1)} L
            </h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon sales-icon">
            🛒
          </div>

          <div>
            <p>Milk Sold</p>
            <h2>
              {milkSold.toFixed(1)} L
            </h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon revenue-icon">
            ₹
          </div>

          <div>
            <p>Sales Revenue</p>
            <h2>
              ₹{salesRevenue.toFixed(0)}
            </h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon payment-icon">
            💰
          </div>

          <div>
            <p>Total Payments</p>
            <h2>
              ₹{payments.toFixed(0)}
            </h2>
          </div>

        </div>

      </div>

      {/* ================= RECENT ACTIVITY ================= */}

      <div className="dashboard-columns">

        {/* RECENT COLLECTIONS */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                Recent Collections
              </h2>

              <p>
                Latest milk collection records
              </p>
            </div>

            <span className="panel-icon">
              🥛
            </span>

          </div>

          {recentCollections.length === 0 ? (

            <div className="empty-state">

              <span>🥛</span>

              <p>
                No collection records yet.
              </p>

            </div>

          ) : (

            <div className="activity-list">

              {recentCollections.map(
                (collection) => (

                  <div
                    className="activity-item"
                    key={collection.id}
                  >

                    <div className="activity-avatar">

                      {collection.farmers?.name
                        ?.charAt(0) || "F"}

                    </div>

                    <div className="activity-info">

                      <strong>
                        {collection.farmers?.name ||
                          "Unknown Farmer"}
                      </strong>

                      <span>
                        {collection.collection_date}
                      </span>

                    </div>

                    <div className="activity-value">

                      <strong>
                        {collection.quantity_liters} L
                      </strong>

                      <span>
                        ₹{collection.total_amount || 0}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* RECENT SALES */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                Recent Sales
              </h2>

              <p>
                Latest milk sales records
              </p>
            </div>

            <span className="panel-icon">
              🛒
            </span>

          </div>

          {recentSales.length === 0 ? (

            <div className="empty-state">

              <span>🛒</span>

              <p>
                No sales records yet.
              </p>

            </div>

          ) : (

            <div className="activity-list">

              {recentSales.map((sale) => (

                <div
                  className="activity-item"
                  key={sale.id}
                >

                  <div className="activity-avatar">

                    {sale.customers?.name
                      ?.charAt(0) || "C"}

                  </div>

                  <div className="activity-info">

                    <strong>
                      {sale.customers?.name ||
                        "Unknown Customer"}
                    </strong>

                    <span>
                      {sale.sale_date}
                    </span>

                  </div>

                  <div className="activity-value">

                    <strong>
                      {sale.quantity_liters} L
                    </strong>

                    <span>
                      ₹{sale.total_amount || 0}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="analytics-grid">

        {/* MILK CHART */}

        <section className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>
              <h2>
                Milk Collection & Sales
              </h2>

              <p>
                Milk collected versus milk sold
              </p>
            </div>

            <span className="panel-icon">
              📊
            </span>

          </div>

          {chartData.length === 0 ? (

            <div className="empty-state">

              <span>📊</span>

              <p>
                Add collection or sales
                records to see the chart.
              </p>

            </div>

          ) : (

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="collected"
                    name="Collected (L)"
                  />

                  <Bar
                    dataKey="sold"
                    name="Sold (L)"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

        </section>

        {/* PRODUCT PIE CHART */}

        <section className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>
              <h2>
                Product Categories
              </h2>

              <p>
                Products by category
              </p>
            </div>

            <span className="panel-icon">
              📦
            </span>

          </div>

          {categoryData.length === 0 ? (

            <div className="empty-state">

              <span>📦</span>

              <p>
                Add products to see
                category distribution.
              </p>

            </div>

          ) : (

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >

                    {categoryData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </section>

      </div>

      {/* ================= REVENUE CHART ================= */}

      <section className="dashboard-panel chart-panel">

        <div className="panel-header">

          <div>
            <h2>
              Sales Revenue
            </h2>

            <p>
              Revenue generated from milk sales
            </p>
          </div>

          <span className="panel-icon">
            💰
          </span>

        </div>

        {chartData.length === 0 ? (

          <div className="empty-state">

            <span>💰</span>

            <p>
              Add sales records to see
              revenue analytics.
            </p>

          </div>

        ) : (

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toFixed(2)}`
                  }
                />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        )}

      </section>

      {/* ================= INVENTORY ALERTS ================= */}

      <section className="dashboard-panel stock-panel">

        <div className="panel-header">

          <div>
            <h2>
              Inventory Alerts
            </h2>

            <p>
              Products that need attention
            </p>
          </div>

          <span className="panel-icon">
            📦
          </span>

        </div>

        {lowStockProducts.length === 0 ? (

          <div className="success-message">

            <span>✓</span>

            <div>

              <strong>
                Inventory looks good
              </strong>

              <p>
                No products are currently
                low in stock.
              </p>

            </div>

          </div>

        ) : (

          <div className="stock-list">

            {lowStockProducts.map(
              (product) => (

                <div
                  className="stock-item"
                  key={product.id}
                >

                  <div>

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.category}
                    </span>

                  </div>

                  <div className="stock-badge">

                    {product.stock}{" "}
                    {product.unit}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* ================= PRODUCT SUMMARY ================= */}

      <div className="product-summary">

        <span>📦</span>

        <div>

          <strong>
            {products} Products
          </strong>

          <p>
            Currently registered in
            your inventory.
          </p>

        </div>

      </div>

    </main>
  );
}

export default Dashboard;