import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="professional-navbar">

      <div className="navbar-brand">
        <div className="brand-icon">🥛</div>

        <div>
          <h2>Milk Dairy Management</h2>
          <span>Dairy Operations System</span>
        </div>
      </div>

      <div className="navbar-links">

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          🏠 Dashboard
        </NavLink>

        <NavLink
          to="/farmers"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          👨‍🌾 Farmers
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          👥 Customers
        </NavLink>

        <NavLink
          to="/collection"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          🥛 Collection
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          🛒 Sales
        </NavLink>

        <NavLink
          to="/payments"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          💰 Payments
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          📦 Products
        </NavLink>
        <NavLink
  to="/reports"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  📊 Reports
</NavLink>


      </div>

    </nav>
  );
}

export default Navbar;