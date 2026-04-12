import { useState, useEffect } from "react";
import { getCarById, processPayment } from "../api/cars";
import { useQueueContext } from "../context/QueueContext";
import { fmtCardNumber, fmtExpiry } from "../utils/formatters";

const SERVICE_PRICES = { basic: 10, deluxe: 20 };

export function Payment({ onNavigate }) {
  const { refresh } = useQueueContext();
  const id = sessionStorage.getItem("pay_car");
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

  // Load the car once when the component mounts
  useEffect(() => {
    if (!id) return;
    getCarById(id)
      .then((c) => {
        setCar(c);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [id]);

  if (!loaded) {
      return (
        <div className="loading-container">
          <p>Loading car details...</p>
        </div>
      );
    }

  function update(field, raw) {
    let val = raw;
    if (field === "number") val = fmtCardNumber(raw);
    if (field === "expiry") val = fmtExpiry(raw);
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handlePay() {
    const clean = form.number.replace(/\s/g, "");
    if (clean.length < 12 || !form.expiry || form.cvc.length < 3) {
      setError("Please fill in all card details correctly.");
      return;
    }

    // Send only the last 4 digits to the backend
    const cardLast4 = clean.slice(-4);
    setLoading(true);
    setError("");
    try {
      await processPayment(id, cardLast4);
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!id) {
    return (
      <div>
        <h1>Payment</h1>
        <div className="card" style={{ maxWidth: 480, marginTop: "1rem" }}>
          <p style={{ color: "var(--gray-500)" }}>
            No car selected. Go to{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("status");
              }}
              style={{ color: "var(--blue)" }}
            >
              Status
            </a>{" "}
            to find your car first.
          </p>
        </div>
      </div>
    );
  }

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
            style={{
              width: 64,
              height: 64,
              background: "var(--green-light)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: "2rem",
            }}
          >
            ✓
          </div>
          <h2 style={{ color: "var(--green)" }}>Payment Successful</h2>
          <p style={{ color: "var(--gray-500)", margin: "0.5rem 0 1.5rem" }}>
            ${SERVICE_PRICES[car?.serviceType]} paid for {car?.customerName}.
            Thank you!
          </p>
          <button className="btn-primary" onClick={() => onNavigate?.("/")}>
            Back to Status
          </button>
        </div>
      </div>
    );
  }

  const amount = SERVICE_PRICES[car?.serviceType] ?? "...";

  return (
    <div>
      <h1>Payment</h1>
      <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>
        Secure simulated checkout.
      </p>
      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h2>{car?.customerName ?? "..."}</h2>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {car?.serviceType === "basic" ? "Basic Wash" : "Deluxe Wash"}
            {car?.licensePlate ? ` · ${car.licensePlate}` : ""}
          </p>
        </div>
        <div className="stat" style={{ marginBottom: "1.25rem" }}>
          <div className="stat-label">Amount Due</div>
          <div className="stat-value">${amount}</div>
        </div>
        <h3 style={{ marginBottom: "1rem" }}>Card Details</h3>
        <div className="cc-grid">
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
          <div className="cc-full form-row">
            <label>Cardholder Name</label>
            <input
              placeholder={car?.customerName ?? ""}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
        </div>
        {error && (
          <div
            className="alert alert-error"
            style={{ marginBottom: "0.75rem" }}
          >
            {error}
          </div>
        )}
        <button
          className="btn-success btn-lg"
          style={{ width: "100%", marginTop: "0.5rem" }}
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay $${amount} Now`}
        </button>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--gray-400)",
            textAlign: "center",
            marginTop: "0.75rem",
          }}
        >
          🔒 This is a simulated payment — no real charges
        </p>
      </div>
    </div>
  );
}

export default Payment;
