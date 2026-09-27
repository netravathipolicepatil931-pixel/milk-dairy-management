import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Reports() {
  const [farmers, setFarmers] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [products, setProducts] = useState(0);

  const [milkCollected, setMilkCollected] = useState(0);
  const [milkSold, setMilkSold] = useState(0);

  const [salesRevenue, setSalesRevenue] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);

  const [collections, setCollections] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);

    // ==============================
    // FARMERS
    // ==============================

    const { count: farmerCount } = await supabase
      .from("farmers")
      .select("*", {
        count: "exact",
        head: true,
      });

    // ==============================
    // CUSTOMERS
    // ==============================

    const { count: customerCount } = await supabase
      .from("customers")
      .select("*", {
        count: "exact",
        head: true,
      });

    // ==============================
    // PRODUCTS
    // ==============================

    const { count: productCount } = await supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      });

    // ==============================
    // COLLECTIONS
    // ==============================

    const { data: collectionData } = await supabase
      .from("milk_collections")
      .select(`
        *,
        farmers ( name )
      `)
      .order("id", {
        ascending: false,
      });

    // ==============================
    // SALES
    // ==============================

    const { data: salesData } = await supabase
      .from("milk_sales")
      .select(`
        *,
        customers ( name )
      `)
      .order("id", {
        ascending: false,
      });

    // ==============================
    // PAYMENTS
    // ==============================

    const { data: paymentData } = await supabase
      .from("payments")
      .select("amount");

    // ==============================
    // CALCULATIONS
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

    const revenue =
      salesData?.reduce(
        (sum, item) =>
          sum + Number(item.total_amount || 0),
        0
      ) || 0;

    const payments =
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

    setSalesRevenue(revenue);
    setTotalPayments(payments);

    setCollections(collectionData || []);
    setSales(salesData || []);

    setLoading(false);
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <main className="dashboard-page">

        <div className="loading-box">

          <div className="loading-icon">
            📊
          </div>

          <h2>
            Loading reports...
          </h2>

          <p>
            Preparing your dairy business report.
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="management-page">

      {/* ==============================
          HEADER
      ============================== */}

      <div className="management-header">

        <div>

          <p className="dashboard-label">
            BUSINESS REPORTS
          </p>

          <h1>
            Reports
          </h1>

          <p className="management-description">
            Overview of your dairy operations,
            sales and financial activity.
          </p>

        </div>

        <button
          className="primary-action"
          onClick={fetchReports}
        >
          🔄 Refresh Report
        </button>

      </div>

      {/* ==============================
          SUMMARY CARDS
      ============================== */}

      <div className="report-stats-grid">

        <div className="report-stat-card">

          <div className="report-stat-icon">
            👨‍🌾
          </div>

          <div>
            <p>Total Farmers</p>

            <h2>
              {farmers}
            </h2>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            👥
          </div>

          <div>
            <p>Total Customers</p>

            <h2>
              {customers}
            </h2>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            🥛
          </div>

          <div>
            <p>Milk Collected</p>

            <h2>
              {milkCollected.toFixed(1)} L
            </h2>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            🛒
          </div>

          <div>
            <p>Milk Sold</p>

            <h2>
              {milkSold.toFixed(1)} L
            </h2>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            💰
          </div>

          <div>
            <p>Sales Revenue</p>

            <h2>
              ₹{salesRevenue.toFixed(2)}
            </h2>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            💳
          </div>

          <div>
            <p>Farmer Payments</p>

            <h2>
              ₹{totalPayments.toFixed(2)}
            </h2>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            📦
          </div>

          <div>
            <p>Total Products</p>

            <h2>
              {products}
            </h2>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            📋
          </div>

          <div>
            <p>Collection Records</p>

            <h2>
              {collections.length}
            </h2>
          </div>

        </div>

      </div>

      {/* ==============================
          BUSINESS SUMMARY
      ============================== */}

      <section className="dashboard-panel report-summary">

        <div className="panel-header">

          <div>

            <h2>
              Business Summary
            </h2>

            <p>
              Current dairy operation overview
            </p>

          </div>

          <span className="panel-icon">
            📊
          </span>

        </div>

        <div className="summary-grid">

          <div className="summary-item">

            <span>
              🥛
            </span>

            <div>

              <strong>
                {milkCollected.toFixed(1)} Litres
              </strong>

              <p>
                Total milk collected
              </p>

            </div>

          </div>

          <div className="summary-item">

            <span>
              🛒
            </span>

            <div>

              <strong>
                {milkSold.toFixed(1)} Litres
              </strong>

              <p>
                Total milk sold
              </p>

            </div>

          </div>

          <div className="summary-item">

            <span>
              💰
            </span>

            <div>

              <strong>
                ₹{salesRevenue.toFixed(2)}
              </strong>

              <p>
                Total sales revenue
              </p>

            </div>

          </div>

          <div className="summary-item">

            <span>
              💳
            </span>

            <div>

              <strong>
                ₹{totalPayments.toFixed(2)}
              </strong>

              <p>
                Total farmer payments
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ==============================
          RECENT COLLECTION REPORT
      ============================== */}

      <section className="management-card">

        <div className="list-header">

          <div>

            <h2>
              Milk Collection Report
            </h2>

            <p>
              Recent milk collection records
            </p>

          </div>

        </div>

        {collections.length === 0 ? (

          <div className="empty-management">

            <div>🥛</div>

            <h3>
              No collection records
            </h3>

            <p>
              Collection records will appear here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="professional-table">

              <thead>

                <tr>

                  <th>
                    Farmer
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Fat
                  </th>

                  <th>
                    Price/L
                  </th>

                  <th>
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {collections
                  .slice(0, 10)
                  .map((collection) => (

                    <tr key={collection.id}>

                      <td>

                        <div className="person-cell">

                          <div className="person-avatar">

                            {collection.farmers?.name
                              ?.charAt(0)
                              .toUpperCase() || "F"}

                          </div>

                          <strong>
                            {collection.farmers?.name ||
                              "Unknown Farmer"}
                          </strong>

                        </div>

                      </td>

                      <td>
                        {collection.collection_date}
                      </td>

                      <td>
                        {collection.quantity_liters} L
                      </td>

                      <td>
                        {collection.fat_percentage}%
                      </td>

                      <td>
                        ₹{collection.price_per_liter}
                      </td>

                      <td>

                        <strong className="amount-text">
                          ₹{collection.total_amount || 0}
                        </strong>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* ==============================
          SALES REPORT
      ============================== */}

      <section className="management-card">

        <div className="list-header">

          <div>

            <h2>
              Milk Sales Report
            </h2>

            <p>
              Recent customer sales records
            </p>

          </div>

        </div>

        {sales.length === 0 ? (

          <div className="empty-management">

            <div>🛒</div>

            <h3>
              No sales records
            </h3>

            <p>
              Sales records will appear here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="professional-table">

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Price/L
                  </th>

                  <th>
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {sales
                  .slice(0, 10)
                  .map((sale) => (

                    <tr key={sale.id}>

                      <td>

                        <div className="person-cell">

                          <div className="person-avatar">

                            {sale.customers?.name
                              ?.charAt(0)
                              .toUpperCase() || "C"}

                          </div>

                          <strong>
                            {sale.customers?.name ||
                              "Unknown Customer"}
                          </strong>

                        </div>

                      </td>

                      <td>
                        {sale.sale_date}
                      </td>

                      <td>
                        {sale.quantity_liters} L
                      </td>

                      <td>
                        ₹{sale.price_per_liter}
                      </td>

                      <td>

                        <strong className="amount-text">
                          ₹{sale.total_amount || 0}
                        </strong>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* ==============================
          REPORT FOOTER
      ============================== */}

      <div className="report-footer">

        <span>
          📊
        </span>

        <div>

          <strong>
            Dairy Management Report
          </strong>

          <p>
            This report summarizes the data currently
            stored in your dairy management system.
          </p>

        </div>

      </div>

    </main>
  );
}

export default Reports;