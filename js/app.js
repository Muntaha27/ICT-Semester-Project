/* CampusCarpool App JS
   Features:
   - Demo data in localStorage (simulating a backend)
   - Render rides with filters and validation (rides.html)
   - Save selected ride for details page
   - Details page: live rider counter, confirm seats, fare per rider auto-calculation
*/

(function () {
  // Seed dataset (replace with API in real app)
  const ridesSeed = [
    {
      id: 'r1',
      driver: {
        name: 'Ahsan Khan',
        photo: 'images/driver1.jpeg',
        email: 'ahsan.khan@university.edu',
        phone: '+92-300-1111111'
      },
      car: { model: 'Toyota Corolla', color: 'White', plate: 'LEB-1234' },
      pickup: 'Main Gate',
      destination: 'Lahore',
      date: '2025-11-29',
      time: '18:00',
      type: 'home',
      seatsAvailable: 3,
      totalFare: 1800, // PKR total for the trip
      riders: 1 // driver counts as 1 occupant for splitting logic
    },
    {
      id: 'r2',
      driver: {
        name: 'Sara Malik',
        photo: 'images/driver2.jpeg',
        email: 'sara.malik@university.edu',
        phone: '+92-300-2222222'
      },
      car: { model: 'Honda City', color: 'Blue', plate: 'ABC-5678' },
      pickup: 'CS Dept',
      destination: 'Hostel-A',
      date: '2025-11-28',
      time: '20:00',
      type: 'hostel',
      seatsAvailable: 2,
      totalFare: 400,
      riders: 1
    },
    {
      id: 'r3',
      driver: {
        name: 'Bilal Ahmed',
        photo: 'images/driver3.jpeg',
        email: 'bilal.ahmed@university.edu',
        phone: '+92-300-3333333'
      },
      car: { model: 'Suzuki Swift', color: 'Red', plate: 'XYZ-9999' },
      pickup: 'Library',
      destination: 'Bus Station',
      date: '2025-11-28',
      time: '19:30',
      type: 'station',
      seatsAvailable: 1,
      totalFare: 600,
      riders: 1
    }
  ];

  // LocalStorage keys
  const LS_RIDES = 'cc_rides';
  const LS_SELECTED = 'cc_selected_ride';

  // Seed rides once
  function ensureSeed() {
    if (!localStorage.getItem(LS_RIDES)) {
      localStorage.setItem(LS_RIDES, JSON.stringify(ridesSeed));
    }
  }

  // Accessors
  function getRides() {
    ensureSeed();
    try { return JSON.parse(localStorage.getItem(LS_RIDES)) || []; }
    catch { return []; }
  }
  function setRides(list) {
    localStorage.setItem(LS_RIDES, JSON.stringify(list));
  }
  function getSelectedRide() {
    try { return JSON.parse(localStorage.getItem(LS_SELECTED)); }
    catch { return null; }
  }
  function setSelectedRide(ride) {
    localStorage.setItem(LS_SELECTED, JSON.stringify(ride));
  }

  // Filtering logic
  function filterRides(filters = {}) {
    const list = getRides();
    return list.filter(r => {
      if (filters.pickup && !r.pickup.toLowerCase().includes(filters.pickup.toLowerCase())) return false;
      if (filters.destination && !r.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
      if (filters.date && r.date !== filters.date) return false;
      if (filters.time && r.time !== filters.time) return false;
      if (filters.type && r.type !== filters.type) return false;
      return true;
    });
  }

  // Rides page: render cards
  function renderRides(filters = {}) {
    const grid = document.getElementById('ridesGrid');
    const empty = document.getElementById('noResults');
    if (!grid) return; // not on rides.html

    const data = filterRides(filters);
    grid.innerHTML = '';

    if (data.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    data.forEach(r => {
      const farePerRider = Math.round(r.totalFare / Math.max(r.riders, 1));
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <img src="${r.driver.photo}" alt="${r.driver.name}" class="avatar">
          <div>
            <h3 class="card-title">${r.driver.name}</h3>
            <div class="card-meta">${r.car.model} • ${r.car.color} • ${r.car.plate}</div>
          </div>
          <span class="badge" title="Ride type">
            ${r.type === 'home' ? 'Going Home' : r.type === 'station' ? 'Bus Station' : 'Hostel'}
          </span>
        </div>
        <div class="card-body">
          <div class="card-meta">Pickup: <strong>${r.pickup}</strong></div>
          <div class="card-meta">Destination: <strong>${r.destination}</strong></div>
          <div class="card-meta">Departure: <strong>${r.date} ${r.time}</strong></div>
          <div class="card-meta">Seats available: <strong>${r.seatsAvailable}</strong></div>
          <div class="card-meta">Fare per rider: <strong>PKR ${farePerRider}</strong></div>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary" data-id="${r.id}" data-action="details">View Details</button>
          <button class="btn" data-id="${r.id}" data-action="select">Select Ride</button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Actions: view/select
    grid.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const ride = getRides().find(x => x.id === id);
        if (!ride) return;

        setSelectedRide(ride);
        window.location.href = 'details.html';
      });
    });
  }

  // Details page: confirm seats join
  function joinSelectedRide(seatsRequested = 1) {
    const selected = getSelectedRide();
    if (!selected) return null;

    // Capacity = driver (1) + seatsAvailable
    const totalCapacity = selected.seatsAvailable + 1;
    const newRiderCount = Math.min(selected.riders + seatsRequested, totalCapacity);
    selected.riders = newRiderCount;

    // Persist changes
    setSelectedRide(selected);
    const list = getRides().map(r => (r.id === selected.id ? selected : r));
    setRides(list);

    return selected;
  }

  // Expose APIs
  window.CampusCarpool = {
    renderRides,
    getSelectedRide,
    joinSelectedRide
  };
})();
