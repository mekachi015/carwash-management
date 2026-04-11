import { uid } from '../utils/formatters';
import { SERVICE_PRICES } from '../utils/constants';

const KEY = 'cw_cars';

export function getAllCars() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCars(cars) {
  localStorage.setItem(KEY, JSON.stringify(cars));
}

export function getQueue() {
  return getAllCars()
    .filter(c => c.status !== 'Done')
    .sort((a, b) => a.arrivalTime - b.arrivalTime);
}

export function getTodayCars() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return getAllCars().filter(c => c.arrivalTime >= start.getTime());
}

export function getCarByPhone(phone) {
  const clean = phone.replace(/\s/g, '');
  return getAllCars().find(c => c.phone.replace(/\s/g, '') === clean) || null;
}

export function getCarById(id) {
  return getAllCars().find(c => c.id === id) || null;
}

export function addCar({ name, phone, service, plate }) {
  const cars = getAllCars();
  const existing = cars.find(
    c => c.phone.replace(/\s/g, '') === phone.replace(/\s/g, '') && c.status !== 'Done'
  );
  if (existing) throw new Error('A car with this phone number is already in the queue.');

  const car = {
    id: uid(),
    name,
    phone,
    service,
    plate: plate || '',
    status: 'Waiting',
    paid: false,
    arrivalTime: Date.now(),
    completionTime: null,
  };
  cars.push(car);
  saveCars(cars);
  return car;
}

export function updateCarStatus(id, status) {
  const cars = getAllCars();
  const car = cars.find(c => c.id === id);
  if (!car) throw new Error('Car not found.');
  car.status = status;
  if (status === 'Done' && !car.completionTime) car.completionTime = Date.now();
  saveCars(cars);
  return car;
}

export function markCarPaid(id) {
  const cars = getAllCars();
  const car = cars.find(c => c.id === id);
  if (!car) throw new Error('Car not found.');
  car.paid = true;
  saveCars(cars);
  return car;
}

export function deleteCar(id) {
  saveCars(getAllCars().filter(c => c.id !== id));
}

export function getRevenueByDay(daysBack = 7) {
  const result = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    const cars = getAllCars().filter(
      c => c.arrivalTime >= d.getTime() && c.arrivalTime <= end.getTime() && c.paid
    );
    const rev = cars.reduce((s, c) => s + SERVICE_PRICES[c.service], 0);
    result.push({ date: d.getTime(), revenue: rev, label: i === 0 ? 'Today' : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) });
  }
  return result;
}

export function exportToCSV() {
  const cars = getAllCars();
  if (!cars.length) return false;
  const header = ['ID', 'Name', 'Phone', 'Plate', 'Service', 'Status', 'Paid', 'Arrival', 'Completion'];
  const rows = cars.map(c => [
    c.id, c.name, c.phone, c.plate || '',
    c.service, c.status, c.paid ? 'Yes' : 'No',
    new Date(c.arrivalTime).toLocaleString(),
    c.completionTime ? new Date(c.completionTime).toLocaleString() : '',
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `carwash_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  return true;
}

export function loadDemoData() {
  const now = Date.now();
  const demo = [
    { id: uid(), name: 'Lerato Dlamini',  phone: '0821234567', service: 'deluxe', plate: 'GP 123 ABC', status: 'Washing',  paid: false, arrivalTime: now - 18 * 60000, completionTime: null },
    { id: uid(), name: 'Sipho Nkosi',     phone: '0731234567', service: 'basic',  plate: 'LIM 456 CD', status: 'Waiting',  paid: false, arrivalTime: now - 10 * 60000, completionTime: null },
    { id: uid(), name: 'Zanele Mokoena',  phone: '0611234567', service: 'deluxe', plate: '',            status: 'Done',     paid: true,  arrivalTime: now - 50 * 60000, completionTime: now - 20 * 60000 },
    { id: uid(), name: 'Thabo Sithole',   phone: '0841234567', service: 'basic',  plate: 'NW 789 EF',  status: 'Waiting',  paid: false, arrivalTime: now - 5  * 60000, completionTime: null },
  ];
  saveCars(demo);
}