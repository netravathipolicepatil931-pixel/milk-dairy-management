import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Payments() {
  const [farmers, setFarmers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [farmerId, setFarmerId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [status, setStatus] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFarmers();
    fetchPayments();
  }, []);

  async function fetchFarmers() {
    const { data, error } = await supabase
      .from("farmers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Farmer error:", error);
      return;
    }

    setFarmers(data || []);
  }

  async function fetchPayments() {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        farmers ( name )
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Payment error:", error);
      return;
    }

    setPayments(data || []);
  }

  function clearForm() {
    setFarmerId("");
    setPaymentDate("");
    setAmount("");
    setPaymentType("");
    setStatus("");
    setEditingId(null);
    setShowForm(false);
  }

  async function savePayment(e) {
    e.preventDefault();

    if (
      !farmerId ||
      !paymentDate ||
      !amount ||
      !paymentType ||
      !status
    ) {
      alert("Please fill all fields");
      return;
    }

    const paymentData = {
      farmer_id: Number(farmerId),
      payment_date: paymentDate,
      amount: Number(amount),
      payment_type: paymentType,
      status: status,
    };

    if (editingId) {
      const { error } = await supabase
        .from("payments")
        .update(paymentData)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Failed to update payment");
        return;
      }

      alert("Payment updated successfully!");
    } else {
      const { error } = await supabase
        .from("payments")
        .insert([paymentData]);

      if (error) {
        console.error(error);
        alert("Failed to add payment");
        return;
      }

      alert("Payment added successfully!");
    }

    clearForm();
    fetchPayments();
  }

  function editPayment(payment) {
    setEditingId(payment.id);
    setFarmerId(String(payment.farmer_id));
    setPaymentDate(payment.payment_date);
    setAmount(String(payment.amount));
    setPaymentType(payment.payment_type || "");
    setStatus(payment.status || "");
    setShowForm(true);
  }

  async function deletePayment(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete payment");
      return;
    }

    alert("Payment deleted successfully!");
    fetchPayments();
  }

  const filteredPayments = payments.filter((payment) =>
    payment.farmers?.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="management-page">

      {/* HEADER */}

      <div className="management-header">

        <div>
          <p className="dashboard-label">
            PAYMENT MANAGEMENT
          </p>

          <h1>Payments</h1>

          <p className="management-description">
            Manage farmer payments and payment status.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
        >
          + Add Payment
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="management-form-card">

          <div className="form-card-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Payment"
                  : "Add New Payment"}
              </h2>

              <p>
                Enter the farmer payment details.
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

          <form onSubmit={savePayment}>

            <div className="form-grid">

              <div className="form-field">
                <label>Farmer</label>

                <select
                  value={farmerId}
                  onChange={(e) =>
                    setFarmerId(e.target.value)
                  }
                >
                  <option value="">
                    Select farmer
                  </option>

                  {farmers.map((farmer) => (
                    <option
                      key={farmer.id}
                      value={farmer.id}
                    >
                      {farmer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Payment Date</label>

                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) =>
                    setPaymentDate(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Amount</label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Example: 3000"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Payment Type</label>

                <select
                  value={paymentType}
                  onChange={(e) =>
                    setPaymentType(e.target.value)
                  }
                >
                  <option value="">
                    Select payment type
                  </option>

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                  <option value="Cheque">
                    Cheque
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >
                  <option value="">
                    Select status
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Pending">
                    Pending
                  </option>
                </select>
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-action"
              >
                {editingId
                  ? "Update Payment"
                  : "Save Payment"}
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

      {/* PAYMENT TABLE */}

      <div className="management-card">

        <div className="list-header">

          <div>
            <h2>Payment Records</h2>

            <p>
              {payments.length} payment
              {payments.length !== 1 ? "s" : ""} recorded
            </p>
          </div>

          <div className="search-box">

            🔍

            <input
              type="text"
              placeholder="Search farmer..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {filteredPayments.length === 0 ? (

          <div className="empty-management">

            <div>💰</div>

            <h3>No payment records found</h3>

            <p>
              {search
                ? "Try a different farmer name."
                : "Add your first payment."}
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="professional-table">

              <thead>

                <tr>
                  <th>Farmer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredPayments.map((payment) => (

                  <tr key={payment.id}>

                    <td>

                      <div className="person-cell">

                        <div className="person-avatar">
                          {payment.farmers?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {payment.farmers?.name ||
                              "Unknown Farmer"}
                          </strong>

                          <span>
                            Payment #{payment.id}
                          </span>

                        </div>

                      </div>

                    </td>

                    <td>
                      {payment.payment_date}
                    </td>

                    <td>
                      <strong className="amount-text">
                        ₹{payment.amount}
                      </strong>
                    </td>

                    <td>
                      <span className="payment-type-badge">
                        {payment.payment_type}
                      </span>
                    </td>

                    <td>

                      <span
                        className={
                          payment.status === "Paid"
                            ? "payment-status paid"
                            : "payment-status pending"
                        }
                      >
                        {payment.status}
                      </span>

                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            editPayment(payment)
                          }
                          title="Edit payment"
                        >
                          ✏️
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deletePayment(payment.id)
                          }
                          title="Delete payment"
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

export default Payments;