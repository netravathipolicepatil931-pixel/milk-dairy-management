import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Farmers() {
  const [farmers, setFarmers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [milkType, setMilkType] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  async function fetchFarmers() {
    const { data, error } = await supabase
      .from("farmers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error:", error);
      return;
    }

    setFarmers(data || []);
  }

  function clearForm() {
    setName("");
    setPhone("");
    setAddress("");
    setMilkType("");
    setEditingId(null);
    setShowForm(false);
  }

  async function saveFarmer(e) {
    e.preventDefault();

    if (!name || !phone || !address || !milkType) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("farmers")
        .update({
          name,
          phone,
          address,
          milk_type: milkType,
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Failed to update farmer");
        return;
      }

      alert("Farmer updated successfully!");
    } else {
      const { error } = await supabase
        .from("farmers")
        .insert([
          {
            name,
            phone,
            address,
            milk_type: milkType,
          },
        ]);

      if (error) {
        console.error(error);
        alert("Failed to add farmer");
        return;
      }

      alert("Farmer added successfully!");
    }

    clearForm();
    fetchFarmers();
  }

  function editFarmer(farmer) {
    setEditingId(farmer.id);
    setName(farmer.name);
    setPhone(farmer.phone || "");
    setAddress(farmer.address || "");
    setMilkType(farmer.milk_type || "");
    setShowForm(true);
  }

  async function deleteFarmer(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this farmer?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("farmers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete farmer");
      return;
    }

    alert("Farmer deleted successfully!");
    fetchFarmers();
  }

  const filteredFarmers = farmers.filter((farmer) => {
    const searchText = search.toLowerCase();

    return (
      farmer.name?.toLowerCase().includes(searchText) ||
      farmer.phone?.toLowerCase().includes(searchText) ||
      farmer.address?.toLowerCase().includes(searchText) ||
      farmer.milk_type?.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="management-page">

      {/* HEADER */}

      <div className="management-header">

        <div>
          <p className="dashboard-label">FARMER MANAGEMENT</p>

          <h1>Farmers</h1>

          <p className="management-description">
            Manage farmer information and milk suppliers.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
        >
          + Add Farmer
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="management-form-card">

          <div className="form-card-header">
            <div>
              <h2>
                {editingId ? "Edit Farmer" : "Add New Farmer"}
              </h2>

              <p>
                Enter the farmer's details below.
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

          <form onSubmit={saveFarmer}>

            <div className="form-grid">

              <div className="form-field">
                <label>Farmer Name</label>

                <input
                  type="text"
                  placeholder="Enter farmer name"
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
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Milk Type</label>

                <select
                  value={milkType}
                  onChange={(e) => setMilkType(e.target.value)}
                >
                  <option value="">Select milk type</option>
                  <option value="Cow">Cow</option>
                  <option value="Buffalo">Buffalo</option>
                </select>
              </div>

            </div>

            <div className="form-actions">

              <button type="submit" className="primary-action">
                {editingId ? "Update Farmer" : "Save Farmer"}
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

      {/* FARMER LIST */}

      <div className="management-card">

        <div className="list-header">

          <div>
            <h2>Farmer Directory</h2>

            <p>
              {farmers.length} farmer
              {farmers.length !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="search-box">
            🔍

            <input
              type="text"
              placeholder="Search farmers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>

        {filteredFarmers.length === 0 ? (

          <div className="empty-management">

            <div>👨‍🌾</div>

            <h3>No farmers found</h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first farmer to get started."}
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="professional-table">

              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Milk Type</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredFarmers.map((farmer) => (

                  <tr key={farmer.id}>

                    <td>

                      <div className="person-cell">

                        <div className="person-avatar">
                          {farmer.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{farmer.name}</strong>

                          <span>
                            Farmer #{farmer.id}
                          </span>
                        </div>

                      </div>

                    </td>

                    <td>
                      {farmer.phone || "—"}
                    </td>

                    <td>
                      {farmer.address || "—"}
                    </td>

                    <td>

                      <span className="status-badge">
                        {farmer.milk_type || "Not specified"}
                      </span>

                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="edit-button"
                          onClick={() => editFarmer(farmer)}
                        >
                          ✏️
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteFarmer(farmer.id)}
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

export default Farmers;