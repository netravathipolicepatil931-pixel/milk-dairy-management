import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function MilkSales() {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchSales();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Customer error:", error);
      return;
    }

    setCustomers(data || []);
  }

  async function fetchSales() {
    const { data, error } = await supabase
      .from("milk_sales")
      .select(`
        *,
        customers ( name )
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Sales error:", error);
      return;
    }

    setSales(data || []);
  }

  function clearForm() {
    setCustomerId("");
    setSaleDate("");
    setQuantity("");
    setPrice("");
    setEditingId(null);
    setShowForm(false);
  }

  async function saveSale(e) {
    e.preventDefault();

    if (!customerId || !saleDate || !quantity || !price) {
      alert("Please fill all fields");
      return;
    }

    const totalAmount =
      Number(quantity) * Number(price);

    if (editingId) {
      const { error } = await supabase
        .from("milk_sales")
        .update({
          customer_id: Number(customerId),
          sale_date: saleDate,
          quantity_liters: Number(quantity),
          price_per_liter: Number(price),
          total_amount: totalAmount,
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Failed to update sale");
        return;
      }

      alert("Milk sale updated successfully!");
    } else {
      const { error } = await supabase
        .from("milk_sales")
        .insert([
          {
            customer_id: Number(customerId),
            sale_date: saleDate,
            quantity_liters: Number(quantity),
            price_per_liter: Number(price),
            total_amount: totalAmount,
          },
        ]);

      if (error) {
        console.error(error);
        alert("Failed to add sale");
        return;
      }

      alert("Milk sale added successfully!");
    }

    clearForm();
    fetchSales();
  }

  function editSale(sale) {
    setEditingId(sale.id);
    setCustomerId(String(sale.customer_id));
    setSaleDate(sale.sale_date);
    setQuantity(String(sale.quantity_liters));
    setPrice(String(sale.price_per_liter));
    setShowForm(true);
  }

  async function deleteSale(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("milk_sales")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete sale");
      return;
    }

    alert("Milk sale deleted successfully!");
    fetchSales();
  }

  const filteredSales = sales.filter((sale) =>
    sale.customers?.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const calculatedTotal =
    quantity && price
      ? Number(quantity) * Number(price)
      : 0;

  return (
    <main className="management-page">

      {/* HEADER */}

      <div className="management-header">

        <div>
          <p className="dashboard-label">
            MILK SALES
          </p>

          <h1>Milk Sales</h1>

          <p className="management-description">
            Manage customer milk sales and revenue.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
        >
          + Add Sale
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="management-form-card">

          <div className="form-card-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Milk Sale"
                  : "Add Milk Sale"}
              </h2>

              <p>
                Enter the customer's milk purchase details.
              </p>
            </div>

            <button
              className="close-button"
              type="button"
              onClick={clearForm}
            >
              ✕
            </button>

          </div>

          <form onSubmit={saveSale}>

            <div className="form-grid">

              <div className="form-field">
                <label>Customer</label>

                <select
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(e.target.value)
                  }
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Sale Date</label>

                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) =>
                    setSaleDate(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Quantity (Litres)</label>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Example: 5"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Price Per Litre</label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Example: 50"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Total Amount</label>

                <div className="calculated-amount">
                  ₹{calculatedTotal.toFixed(2)}
                </div>
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-action"
              >
                {editingId
                  ? "Update Sale"
                  : "Save Sale"}
              </button>

              <button
                type="button"
                className="secondary-action"
                onClick={clearForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* SALES TABLE */}

      <div className="management-card">

        <div className="list-header">

          <div>
            <h2>Sales Records</h2>

            <p>
              {sales.length} sale
              {sales.length !== 1 ? "s" : ""} recorded
            </p>
          </div>

          <div className="search-box">

            🔍

            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {filteredSales.length === 0 ? (

          <div className="empty-management">

            <div>🛒</div>

            <h3>No sales records found</h3>

            <p>
              {search
                ? "Try a different customer name."
                : "Add your first milk sale."}
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="professional-table">

              <thead>

                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Quantity</th>
                  <th>Price/L</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredSales.map((sale) => (

                  <tr key={sale.id}>

                    <td>

                      <div className="person-cell">

                        <div className="person-avatar">
                          {sale.customers?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {sale.customers?.name ||
                              "Unknown Customer"}
                          </strong>

                          <span>
                            Sale #{sale.id}
                          </span>

                        </div>

                      </div>

                    </td>

                    <td>
                      {sale.sale_date}
                    </td>

                    <td>
                      <strong>
                        {sale.quantity_liters} L
                      </strong>
                    </td>

                    <td>
                      ₹{sale.price_per_liter}
                    </td>

                    <td>
                      <strong className="amount-text">
                        ₹{sale.total_amount}
                      </strong>
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="edit-button"
                          onClick={() => editSale(sale)}
                          title="Edit sale"
                        >
                          ✏️
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteSale(sale.id)
                          }
                          title="Delete sale"
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </main>
  );
}

export default MilkSales;