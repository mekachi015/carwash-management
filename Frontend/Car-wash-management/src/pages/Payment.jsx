import { useState, useEffect } from "react";
import { getCarById, getCarByPhone, initiatePayment } from "../api/cars";
import { useQueueContext } from "../context/QueueContext";

const SERVICE_PRICES = { BASIC: 100, DELUXE: 200 };

export function Payment({ onNavigate }) {
  useQueueContext();

  // Search and Car State
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [email, setEmail] = useState("");
  const [id, setId] = useState(sessionStorage.getItem("pay_car"));
  const [car, setCar] = useState(null);
  
  // UI State
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoaded(true);
      return;
    }
    getCarById(id)
      .then((c) => {
        setCar(c);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
        setError("Could not find car details.");
      });
  }, [id]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!phoneSearch) return;

    setSearching(true);
    setError("");
    try {
      const foundCar = await getCarByPhone(phoneSearch);
      if (foundCar.paid) {
        setError("This car is already paid for.");
      } else {
        setCar(foundCar);
        setId(String(foundCar.id));
        sessionStorage.setItem("pay_car", foundCar.id);
      }
    } catch {
      setError("No active car found for this phone number.");
    } finally {
      setSearching(false);
    }
  }

  async function handlePay() {
  if (!email || !email.includes("@")) {
    setError("Please enter a valid email for your receipt.");
    return;
  }
 
  setLoading(true);
  setError("");
 
  try {
    const data = await initiatePayment({ carId: id, customerEmail: email });
    // data = { payfastUrl, payfastParams, paymentToken, amount, customerName }
 
    sessionStorage.setItem("paymentToken", data.paymentToken);
 
    // ── Build a hidden form and auto-submit it to PayFast ──────────────────
    // This is the correct PayFast integration method.
    // A GET redirect encodes the URL values twice, breaking the signature.
    // A form POST sends the raw values exactly as signed.
    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.payfastUrl;
 
    Object.entries(data.payfastParams).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type  = "hidden";
      input.name  = key;
      input.value = value;
      form.appendChild(input);
    });
 
    document.body.appendChild(form);
    form.submit();   // Browser encodes values exactly once — PayFast expects this
 
  } catch (err) {
    setError(err.response?.data?.error || "Could not start payment.");
    setLoading(false);
  }
}

  if (!loaded) return <div className="loading-container"><p>Loading...</p></div>;

  // SCREEN 1: Search for car
  if (!id && !car) {
    return (
      <div>
        <h1>Payment</h1>
        <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>
          Enter your number to find your car.
        </p>
        <div className="card" style={{ maxWidth: 480 }}>
          <form onSubmit={handleSearch}>
            <div className="form-row">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="081 234 5678"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>Email Address (for receipt)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={searching}>
              {searching ? "Searching..." : "Find My Car"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // SCREEN 2: Already Paid (Success)
  if (car?.paid) {
    return (
      <div>
        <h1>Payment</h1>
        <div className="card" style={{ maxWidth: 480, textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <div className="success-icon">✓</div>
          <h2 style={{ color: "var(--green)" }}>Payment Successful</h2>
          <p style={{ color: "var(--gray-500)", margin: "0.5rem 0 1.5rem" }}>
            Payment complete for {car?.customerName}. Thank you!
          </p>
          <button className="btn-primary" onClick={() => {
            sessionStorage.removeItem("pay_car");
            onNavigate?.("status");
          }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 3: Checkout Redirect
  const amount = SERVICE_PRICES[car?.serviceType] ?? "0";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Checkout</h1>
        <button className="btn-sm" onClick={() => {
            sessionStorage.removeItem("pay_car");
            setCar(null);
            setId(null);
        }}>
          Change Car
        </button>
      </div>

      <div className="card" style={{ maxWidth: 480, marginTop: "1rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h2>{car?.customerName}</h2>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {car?.serviceType} WASH {car?.licensePlate ? ` · ${car.licensePlate}` : ""}
          </p>
        </div>

        <div className="stat" style={{ marginBottom: "1.25rem" }}>
          <div className="stat-label">Amount Due</div>
          <div className="stat-value">R{amount}</div>
        </div>

        {/* --- ADDED EMAIL SECTION START --- */}
        <div className="form-row" style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
            Email Address (for your receipt)
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--gray-300)" }}
            required
          />
        </div>
        {/* --- ADDED EMAIL SECTION END --- */}

        <div className="payment-notice" style={{ padding: "1rem", background: "#f8fafc", borderRadius: "8px", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", margin: 0 }}>
            You will be redirected to <strong>PayFast</strong> to complete your R{amount} payment securely.
          </p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <button className="btn-success btn-lg" style={{ width: "100%" }} onClick={handlePay} disabled={loading}>
          {loading ? "Redirecting..." : "Pay with PayFast"}
        </button>
      </div>
    </div>
  );
}

export default Payment;