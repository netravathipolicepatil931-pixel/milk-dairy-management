import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error:", error);
      return;
    }

    setCustomers(data || []);
  }

  function clearForm() {
    setName("");
    setPhone("");
    setAddress("");
    setEditingId(null);
    setShowForm(false);
  }

  async function saveCustomer(e) {
    e.preventDefault();

    if (!name || !phone || !address) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("customers")
        .update({
          name,
          phone,
          address,
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Failed to update customer");
        return;
      }

      alert("Customer updated successfully!");
    } else {
      const { error } = await supabase
        .from("customers")
        .insert([
          {
            name,
            phone,
            address,
          },
        ]);

      if (error) {
        console.error(error);
        alert("Failed to add customer");
        return;
      }

      alert("Customer added successfully!");
    }

    clearForm();
    fetchCustomers();
  }

  function editCustomer(customer) {
    setEditingId(customer.id);
    setName(customer.name);
    setPhone(customer.phone || "");
    setAddress(customer.address || "");
    setShowForm(true);
  }

  async function deleteCustomer(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete customer");
      return;
    }

    alert("Customer deleted successfully!");
    fetchCustomers();
  }

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(searchText) ||
      customer.phone?.toLowerCase().includes(searchText) ||
      customer.address?.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="management-page">

      {/* HEADER */}

      <div className="management-header">

        <div>
          <p className="dashboard-label">CUSTOMER MANAGEMENT</p>

          <h1>Customers</h1>

          <p className="management-description">
            Manage customers and their dairy purchases.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
        >
          + Add Customer
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="management-form-card">

          <div className="form-card-header">

            <div>
              <h2>
                {editingId ? "Edit Customer" : "Add New Customer"}
              </h2>

              <p>
                Enter the customer's details below.
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

          <form onSubmit={saveCustomer}>

            <div className="form-grid">

              <div className="form-field">
                <label>Customer Name</label>

                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Phone Number</label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Address</label>

                <input
                  type="text"
                  placeholder="Enter customer address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-action"
              >
                {editingId ? "Update Customer" : "Save Customer"}
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

      {/* CUSTOMER LIST */}

      <div className="management-card">

        <div className="list-header">

          <div>
            <h2>Customer Directory</h2>

            <p>
              {customers.length} customer
              {customers.length !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="search-box">

            🔍

            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

        </div>

        {filteredCustomers.length === 0 ? (

          <div className="empty-management">

            <div>👥</div>

            <h3>No customers found</h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first customer to get started."}
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="professional-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map((customer) => (

                  <tr key={customer.id}>

                    <td>

                      <div className="person-cell">

                        <div className="person-avatar">
                          {customer.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {customer.name}
                          </strong>

                          <span>
                            Customer #{customer.id}
                          </span>

                        </div>

                      </div>

                    </td>

                    <td>
                      {customer.phone || "—"}
                    </td>

                    <td>
                      {customer.address || "—"}
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="edit-button"
                          onClick={() => editCustomer(customer)}
                          title="Edit customer"
                        >
                          ✏️
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteCustomer(customer.id)}
                          title="Delete customer"
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

export default Customers;