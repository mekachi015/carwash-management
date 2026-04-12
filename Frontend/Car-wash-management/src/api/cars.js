import { apiFetch } from './index';

// ── Queue (public page) ───────────────────────────────────────────────────────

/**
 * GET /api/queue
 * Returns { queue, totalWaiting, estimatedWaitMins, suggestedArrival, statusColor }
 */
export async function getQueue() {
  return apiFetch('/api/queue');
}

// ── Cars (staff + status pages) ───────────────────────────────────────────────

/**
 * GET /api/cars
 * Returns all cars — used by owner dashboard.
 */
export async function getAllCars() {
  return apiFetch('/api/cars');
}

/**
 * GET /api/cars/{id}
 */
export async function getCarById(id) {
  return apiFetch(`/api/cars/${id}`);
}

/**
 * GET /api/cars/by-phone/{phoneNumber}
 * Used by the customer status page.
 */
export async function getCarByPhone(phone) {
  return apiFetch(`/api/cars/by-phone/${encodeURIComponent(phone)}`);
}

/**
 * POST /api/cars
 * Body: { customerName, phoneNumber, serviceType, licensePlate }
 * Returns the created Car.
 */
export async function addCar({ customerName, phoneNumber, serviceType, licensePlate = '' }) {
  return apiFetch('/api/cars', {
    method: 'POST',
    body: JSON.stringify({ customerName, phoneNumber, serviceType, licensePlate }),
  });
}

/**
 * PATCH /api/cars/{id}/status
 * Body: { status } — must be one of: WAITING, WASHING, RINSING, DRYING, DONE
 * Returns the updated Car.
 */
export async function updateCarStatus(id, status) {
  return apiFetch(`/api/cars/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * DELETE /api/cars/{id}
 * Returns null (204 No Content).
 */
export async function deleteCar(id) {
  return apiFetch(`/api/cars/${id}`, { method: 'DELETE' });
}

// ── Payments ──────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/{carId}
 * Body: { cardLast4 }
 * Returns the created Payment.
 */
export async function processPayment(carId, cardLast4) {
  return apiFetch(`/api/payments/${carId}`, {
    method: 'POST',
    body: JSON.stringify({ cardLast4 }),
  });
}

// ── Stats (owner dashboard) ───────────────────────────────────────────────────

/**
 * GET /api/stats/today
 * Returns { todayRevenue, carsWashed, avgWaitMins, queueLength }
 */
export async function getTodayStats() {
  return apiFetch('/api/stats/today');
}

/**
 * GET /api/stats/revenue?days=7
 * Returns array of { date, label, revenue }
 */
export async function getRevenueByDay(days = 7) {
  return apiFetch(`/api/stats/revenue?days=${days}`);
}

export async function exportToCSV() {
  const cars = await getAllCars();
  if (!cars.length) return false;

  // Added 'Price' to the header
  const header = ['ID', 'Name', 'Phone', 'Plate', 'Service', 'Price', 'Status', 'Paid', 'Arrival', 'Completion'];
  
  const rows = cars.map(c => {
    // Simple logic to match your backend pricing
    const price = c.serviceType === 'DELUXE' ? 200 : 100;
    
    return [
      c.id,
      c.customerName,
      c.phoneNumber,
      c.licensePlate || '',
      c.serviceType,
      `R${price}`, // Added Price column
      c.status,
      c.paid ? 'Yes' : 'No',
      c.arrivalTime ? new Date(c.arrivalTime).toLocaleString() : '',
      c.completionTime ? new Date(c.completionTime).toLocaleString() : '',
    ];
  });

  const csv = [header, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `carwash_report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  return true;
}