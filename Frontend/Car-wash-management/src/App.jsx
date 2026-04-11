import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import Global Context
import { QueueProvider } from './context/QueueContext';

// 2. Import Layout Components
import NavBar from './components/NavBar';

// 3. Import Pages (from your /pages directory)
import PublicQueue from './pages/PublicQueue';
import StaffConsole from './pages/StaffConsole';
import OwnerDashboard from './pages/OwnerDashboard';
import CustomerStatus from './pages/CustomerStatus';
import Payment from './pages/Payment';

import './App.css';

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
              {/* Public-facing traffic page */}
              <Route path="/" element={<PublicQueue />} />

              {/* Page for staff to update car statuses */}
              <Route path="/staff" element={<StaffConsole />} />

              {/* Secure owner dashboard for revenue/stats */}
              <Route path="/owner" element={<OwnerDashboard />} />

              {/* Individual car tracking page for customers */}
              <Route path="/status/:carId" element={<CustomerStatus />} />

              {/* Payment processing page */}
              <Route path="/pay/:carId" element={<Payment />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueueProvider>
  );
}

export default App;