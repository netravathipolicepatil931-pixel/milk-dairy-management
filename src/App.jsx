import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Farmers from "./pages/Farmers";
import Customers from "./pages/Customers";
import MilkCollection from "./pages/MilkCollection";
import MilkSales from "./pages/MilkSales";
import Payments from "./pages/Payments";
import Products from "./pages/Products";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter basename="/milk-dairy-management">
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/farmers" element={<Farmers />} />

        <Route path="/customers" element={<Customers />} />

        <Route path="/collection" element={<MilkCollection />} />

        <Route path="/sales" element={<MilkSales />} />

        <Route path="/payments" element={<Payments />} />

        <Route path="/products" element={<Products />} />

        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;