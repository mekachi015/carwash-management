import { useState, useEffect } from "react";
import { getCarById, getCarByPhone, processPayment } from "../api/cars";
import { useQueueContext } from "../context/QueueContext";
import { fmtCardNumber, fmtExpiry } from "../utils/formatters";

// Match your backend prices (e.g., R100 for Basic, R200 for Deluxe)
const SERVICE_PRICES = { BASIC: 100, DELUXE: 200 };

export function Payment({ onNavigate }) {
  const { refresh } = useQueueContext();

  // State for searching
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searching, setSearching] = useState(false);

  // Existing states
  const [id, setId] = useState(sessionStorage.getItem("pay_car"));
  const [car, setCar] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  // Load car if ID exists in session
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

  // Handler to search by phone
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
        setId(foundCar.id);
        sessionStorage.setItem("pay_car", foundCar.id);
      }
    } catch {
      setError("No active car found for this phone number.");
    } finally {
      setSearching(false);
    }
  }

  function update(field, raw) {
    let val = raw;
    if (field === "number") val = fmtCardNumber(raw);
    if (field === "expiry") val = fmtExpiry(raw);
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handlePay() {
    // 1. Create the 'clean' variable
    const clean = form.number.replace(/\s/g, "");

    // 2. Validate
    if (clean.length < 12 || !form.expiry || form.cvc.length < 3) {
      setError("Please fill in all card details correctly.");
      return;
    }

    // 3. DEFINE cardLast4 HERE
    const cardLast4 = clean.slice(-4);

    setLoading(true);
    setError("");

    try {
      await processPayment(id, cardLast4);
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded)
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );

  // STEP 1: If no car is selected/found yet, show the Search Screen
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
            {error && (
              <div className="alert alert-error" style={{ marginTop: "1rem" }}>
                {error}
              </div>
            )}
            <button
              className="btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={searching}
            >
              {searching ? "Searching..." : "Find My Car"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // STEP 2: Show Success Screen
  if (car?.paid || success) {
    return (
      <div>
        <h1>Payment</h1>
        <div
          className="card"
          style={{
            maxWidth: 480,
            textAlign: "center",
            padding: "2.5rem 1.5rem",
            marginTop: "1rem",
          }}
        >
          <div
            style={
              {
                /* styles... */
              }
            }
          >
            ✓
          </div>
          <h2 style={{ color: "var(--green)" }}>Payment Successful</h2>
          <p style={{ color: "var(--gray-500)", margin: "0.5rem 0 1.5rem" }}>
            Payment complete for {car?.customerName}. Thank you!
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              sessionStorage.removeItem("pay_car");
              // FIXED: Using the onNavigate prop instead of window.location
              onNavigate?.("status");

              // Fallback if onNavigate isn't provided
              if (!onNavigate) window.location.href = "/";
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: Show the Payment Form
  const amount = SERVICE_PRICES[car?.serviceType] ?? "0";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Checkout</h1>
        <button
          className="btn-sm"
          onClick={() => {
            sessionStorage.removeItem("pay_car");
            setCar(null);
            setId(null);
          }}
        >
          Change Car
        </button>
      </div>
      <div className="card" style={{ maxWidth: 480, marginTop: "1rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h2>{car?.customerName}</h2>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {car?.serviceType} WASH{" "}
            {car?.licensePlate ? ` · ${car.licensePlate}` : ""}
          </p>
        </div>
        <div className="stat" style={{ marginBottom: "1.25rem" }}>
          <div className="stat-label">Amount Due</div>
          <div className="stat-value">R{amount}</div>
        </div>

        <h3 style={{ marginBottom: "1rem" }}>Card Details</h3>
        <div className="cc-grid">
          {/* ... Input fields exactly as you had them ... */}
          <div className="cc-full form-row">
            <label>Card Number</label>
            <input
              className="cc-input"
              placeholder="1234 5678 9012 3456"
              value={form.number}
              onChange={(e) => update("number", e.target.value)}
              maxLength={19}
            />
          </div>
          <div className="form-row">
            <label>Expiry</label>
            <input
              className="cc-input"
              placeholder="MM/YY"
              value={form.expiry}
              onChange={(e) => update("expiry", e.target.value)}
              maxLength={5}
            />
          </div>
          <div className="form-row">
            <label>CVC</label>
            <input
              className="cc-input"
              placeholder="123"
              value={form.cvc}
              onChange={(e) => update("cvc", e.target.value)}
              maxLength={3}
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ margin: "1rem 0" }}>
            {error}
          </div>
        )}

        <button
          className="btn-success btn-lg"
          style={{ width: "100%" }}
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay R${amount} Now`}
        </button>
      </div>
    </div>
  );
}

export default Payment;
