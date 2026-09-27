import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function MilkCollection() {
  const [farmers, setFarmers] = useState([]);
  const [collections, setCollections] = useState([]);

  const [farmerId, setFarmerId] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fat, setFat] = useState("");
  const [price, setPrice] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFarmers();
    fetchCollections();
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

  async function fetchCollections() {
    const { data, error } = await supabase
      .from("milk_collections")
      .select(`
        *,
        farmers ( name )
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Collection error:", error);
      return;
    }

    setCollections(data || []);
  }

  function clearForm() {
    setFarmerId("");
    setCollectionDate("");
    setQuantity("");
    setFat("");
    setPrice("");
    setEditingId(null);
    setShowForm(false);
  }

  async function saveCollection(e) {
    e.preventDefault();

    if (
      !farmerId ||
      !collectionDate ||
      !quantity ||
      !fat ||
      !price
    ) {
      alert("Please fill all fields");
      return;
    }

    const totalAmount =
      Number(quantity) * Number(price);

    if (editingId) {
      const { error } = await supabase
        .from("milk_collections")
        .update({
          farmer_id: Number(farmerId),
          collection_date: collectionDate,
          quantity_liters: Number(quantity),
          fat_percentage: Number(fat),
          price_per_liter: Number(price),
          total_amount: totalAmount,
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Failed to update collection");
        return;
      }

      alert("Milk collection updated successfully!");
    } else {
      const { error } = await supabase
        .from("milk_collections")
        .insert([
          {
            farmer_id: Number(farmerId),
            collection_date: collectionDate,
            quantity_liters: Number(quantity),
            fat_percentage: Number(fat),
            price_per_liter: Number(price),
            total_amount: totalAmount,
          },
        ]);

      if (error) {
        console.error(error);
        alert("Failed to add collection");
        return;
      }

      alert("Milk collection added successfully!");
    }

    clearForm();
    fetchCollections();
  }

  function editCollection(collection) {
    setEditingId(collection.id);
    setFarmerId(String(collection.farmer_id));
    setCollectionDate(collection.collection_date);
    setQuantity(String(collection.quantity_liters));
    setFat(String(collection.fat_percentage));
    setPrice(String(collection.price_per_liter));
    setShowForm(true);
  }

  async function deleteCollection(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this collection?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("milk_collections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete collection");
      return;
    }

    alert("Milk collection deleted successfully!");
    fetchCollections();
  }

  const filteredCollections = collections.filter((collection) =>
    collection.farmers?.name
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
            MILK COLLECTION
          </p>

          <h1>Milk Collection</h1>

          <p className="management-description">
            Record and manage milk collected from farmers.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
        >
          + Add Collection
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="management-form-card">

          <div className="form-card-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Milk Collection"
                  : "Add Milk Collection"}
              </h2>

              <p>
                Enter today's milk collection details.
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

          <form onSubmit={saveCollection}>

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
                <label>Collection Date</label>

                <input
                  type="date"
                  value={collectionDate}
                  onChange={(e) =>
                    setCollectionDate(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Quantity (Litres)</label>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Example: 10"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Fat Percentage</label>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Example: 4.5"
                  value={fat}
                  onChange={(e) =>
                    setFat(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Price Per Litre</label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Example: 40"
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
                  ? "Update Collection"
                  : "Save Collection"}
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

      {/* COLLECTION TABLE */}

      <div className="management-card">

        <div className="list-header">

          <div>
            <h2>Collection Records</h2>

            <p>
              {collections.length} collection
              {collections.length !== 1 ? "s" : ""} recorded
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

        {filteredCollections.length === 0 ? (

          <div className="empty-management">

            <div>🥛</div>

            <h3>No collection records found</h3>

            <p>
              {search
                ? "Try a different farmer name."
                : "Add your first milk collection."}
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="professional-table">

              <thead>

                <tr>
                  <th>Farmer</th>
                  <th>Date</th>
                  <th>Quantity</th>
                  <th>Fat</th>
                  <th>Price/L</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredCollections.map(
                  (collection) => (

                    <tr key={collection.id}>

                      <td>

                        <div className="person-cell">

                          <div className="person-avatar">
                            {collection.farmers?.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {collection.farmers?.name ||
                                "Unknown Farmer"}
                            </strong>

                            <span>
                              Collection #{collection.id}
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>
                        {collection.collection_date}
                      </td>

                      <td>
                        <strong>
                          {collection.quantity_liters} L
                        </strong>
                      </td>

                      <td>

                        <span className="status-badge">
                          {collection.fat_percentage}%
                        </span>

                      </td>

                      <td>
                        ₹{collection.price_per_liter}
                      </td>

                      <td>

                        <strong className="amount-text">
                          ₹{collection.total_amount}
                        </strong>

                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              editCollection(collection)
                            }
                            title="Edit collection"
                          >
                            ✏️
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteCollection(
                                collection.id
                              )
                            }
                            title="Delete collection"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </main>
  );
}

export default MilkCollection;
