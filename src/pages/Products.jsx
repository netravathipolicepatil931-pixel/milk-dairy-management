import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Products() {
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Product error:", error);
      return;
    }

    setProducts(data || []);
  }

  function clearForm() {
    setName("");
    setCategory("");
    setPrice("");
    setStock("");
    setUnit("");
    setEditingId(null);
    setShowForm(false);
  }

  async function saveProduct(e) {
    e.preventDefault();

    if (!name || !category || !price || !stock || !unit) {
      alert("Please fill all fields");
      return;
    }

    const productData = {
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      unit,
    };

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Failed to update product");
        return;
      }

      alert("Product updated successfully!");
    } else {
      const { error } = await supabase
        .from("products")
        .insert([productData]);

      if (error) {
        console.error(error);
        alert("Failed to add product");
        return;
      }

      alert("Product added successfully!");
    }

    clearForm();
    fetchProducts();
  }

  function editProduct(product) {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category || "");
    setPrice(String(product.price));
    setStock(String(product.stock));
    setUnit(product.unit || "");
    setShowForm(true);
  }

  async function deleteProduct(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete product");
      return;
    }

    alert("Product deleted successfully!");
    fetchProducts();
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.unit?.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="management-page">

      {/* HEADER */}

      <div className="management-header">

        <div>
          <p className="dashboard-label">
            INVENTORY MANAGEMENT
          </p>

          <h1>Products</h1>

          <p className="management-description">
            Manage dairy products, prices and inventory stock.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
        >
          + Add Product
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="management-form-card">

          <div className="form-card-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                Enter the product and inventory details.
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

          <form onSubmit={saveProduct}>

            <div className="form-grid">

              {/* PRODUCT NAME */}

              <div className="form-field">
                <label>Product Name</label>

                <input
                  type="text"
                  placeholder="Example: Fresh Milk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* CATEGORY */}

              <div className="form-field">
                <label>Category</label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Milk">
                    Milk
                  </option>

                  <option value="Curd">
                    Curd
                  </option>

                  <option value="Paneer">
                    Paneer
                  </option>

                  <option value="Butter">
                    Butter
                  </option>

                  <option value="Ghee">
                    Ghee
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* PRICE */}

              <div className="form-field">
                <label>Price</label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Example: 60"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              {/* STOCK */}

              <div className="form-field">
                <label>Stock</label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Example: 100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>

              {/* UNIT */}

              <div className="form-field">
                <label>Unit</label>

                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="">
                    Select unit
                  </option>

                  <option value="Litres">
                    Litres
                  </option>

                  <option value="Kg">
                    Kg
                  </option>

                  <option value="Packets">
                    Packets
                  </option>

                  <option value="Pieces">
                    Pieces
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
                  ? "Update Product"
                  : "Save Product"}
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

      {/* PRODUCT LIST */}

      <div className="management-card">

        <div className="list-header">

          <div>
            <h2>Product Inventory</h2>

            <p>
              {products.length} product
              {products.length !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="search-box">

            🔍

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

        </div>

        {filteredProducts.length === 0 ? (

          <div className="empty-management">

            <div>📦</div>

            <h3>No products found</h3>

            <p>
              {search
                ? "Try a different product name or category."
                : "Add your first product to the inventory."}
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="professional-table">

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredProducts.map((product) => {

                  const stockValue = Number(product.stock || 0);

                  const isLowStock = stockValue <= 10;

                  return (
                    <tr key={product.id}>

                      {/* PRODUCT */}

                      <td>

                        <div className="person-cell">

                          <div className="product-avatar">
                            📦
                          </div>

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              Product #{product.id}
                            </span>
                          </div>

                        </div>

                      </td>

                      {/* CATEGORY */}

                      <td>
                        <span className="status-badge">
                          {product.category}
                        </span>
                      </td>

                      {/* PRICE */}

                      <td>
                        <strong className="amount-text">
                          ₹{Number(product.price).toFixed(2)}
                        </strong>
                      </td>

                      {/* STOCK */}

                      <td>
                        <strong>
                          {stockValue}
                        </strong>
                      </td>

                      {/* UNIT */}

                      <td>
                        {product.unit}
                      </td>

                      {/* STOCK STATUS */}

                      <td>

                        <span
                          className={
                            isLowStock
                              ? "stock-status low"
                              : "stock-status available"
                          }
                        >
                          {isLowStock
                            ? "Low Stock"
                            : "Available"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="table-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              editProduct(product)
                            }
                            title="Edit product"
                          >
                            ✏️
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                            title="Delete product"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </main>
  );
}

export default Products;