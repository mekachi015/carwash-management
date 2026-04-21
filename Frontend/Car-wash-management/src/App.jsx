import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 1. Import Global Context
import { QueueProvider } from "./context/QueueContext";

// 2. Import Layout Components
import NavBar from "./components/NavBar";

// 3. Import Pages (from your /pages directory)
import PublicQueue from "./pages/PublicQueue";
import StaffConsole from "./pages/StaffConsole";
import OwnerDashboard from "./pages/OwnerDashboard";
import CustomerStatus from "./pages/CustomerStatus";
import Payment from "./pages/Payment";
import { PaymentReturn } from "./pages/PaymentReturn";

import "./App.css";

function App() {
  return (
    /* Wrap the entire app in the Context Provider so all pages 
       can access the car queue data without prop drilling */
    <QueueProvider>
      <Router>
        <div className="app-container">
          {/* NavBar stays at the top regardless of which page is active */}
          <NavBar />

          <main className="content">
            <Routes>
              <Route path="/" element={<PublicQueue />} />
              <Route path="/staff" element={<StaffConsole />} />
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/status/:carId" element={<CustomerStatus />} />
              <Route path="/status" element={<CustomerStatus />} />
              <Route path="/payment/:carId" element={<Payment />} />
              <Route path="/payment" element={<Payment />} />

              {/* ← These were missing */}
              <Route
                path="/payment-success"
                element={
                  <PaymentReturn
                    onNavigate={(page) => (window.location.href = `/${page}`)}
                  />
                }
              />
              <Route
                path="/payment-cancelled"
                element={
                  <PaymentReturn
                    onNavigate={(page) => (window.location.href = `/${page}`)}
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </QueueProvider>
  );
}

export default App;
