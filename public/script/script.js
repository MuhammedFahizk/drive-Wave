/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable arrow-parens */
/* eslint-disable no-underscore-dangle */
/* eslint-disable comma-dangle */
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach((item) => {
  const li = item.parentElement;

  item.addEventListener('click', () => {
    allSideMenu.forEach((i) => {
      i.parentElement.classList.remove('active');
    });
    li.classList.add('active');
  });
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', () => {
  sidebar.classList.toggle('hide');
});
const searchButton = document.querySelector(
  '#content nav form .form-input button'
);
const searchButtonIcon = document.querySelector(
  '#content nav form .form-input button .bx'
);
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', (e) => {
  if (window.innerWidth < 576) {
    e.preventDefault();
    searchForm.classList.toggle('show');
    if (searchForm.classList.contains('show')) {
      searchButtonIcon.classList.replace('bx-search', 'bx-x');
    } else {
      searchButtonIcon.classList.replace('bx-x', 'bx-search');
    }
  }
});

if (window.innerWidth < 768) {
  sidebar.classList.add('hide');
} else if (window.innerWidth > 576) {
  searchButtonIcon.classList.replace('bx-x', 'bx-search');
  searchForm.classList.remove('show');
}

window.addEventListener('resize', () => {
  if (this.innerWidth > 576) {
    searchButtonIcon.classList.replace('bx-x', 'bx-search');
    searchForm.classList.remove('show');
  }
});
const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', () => {
  if (this.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});

function handleRowClick(row) {
  const carId = row.getAttribute('data-carId'); // Make sure it matches your HTML attribute name

  axios.get(`/admin/getCarDetails?carId=${encodeURIComponent(carId)}`)
    .then(response => {
      const data = response.data;
      document.getElementById('exampleModalLabel').innerText = data.carId;
      document.querySelector('#viewCars .modal-body').innerHTML = `
      
  <div class="row g-0">
    <div class="col-md-4">
      <img src="${data.carImage}" class="img-fluid rounded-start  col-12 mt-4 " style="height:325px;object-fit: cover; width: 100%; " alt="Car Image">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${data.carName}</h5>
       <ul class="list-group list-group-flush">
                    <li class="list-group-item">Model: ${data.carModal}</li>
                    <li class="list-group-item">Transmission Type: ${data.TransmitionType}</li>
                    <li class="list-group-item">Year: ${data.year}</li>
                    <li class="list-group-item">Category: ${data.carCategory}</li>
                    <li class="list-group-item">Day Rent: ${data.dayRent}</li>
                    <li class="list-group-item">Location: ${data.location}</li>
                    <li class="list-group-item">Brand Name: ${data.brandName}</li>
                    <li class="list-group-item">License Plate Number: ${data.licensePlateNumber}</li>
                    <li class="list-group-item">Color: ${data.color}</li>
                </ul> 
  <div class="card-footer d-flex justify-content-center">
                    <form action="/admin/CarPage/deleteCar" method='get' id="deleteForm">
                        <input type="hidden" name="deleteCarId" value="${data._id}">
                        <button type="submit" class="btn btn-danger me-4 mt-4" ">Delete</button>
                    </form>
                    <button type="button" class="btn btn-primary  mt-4" data-bs-toggle="modal" data-bs-target="#editModal" data-carEId="${data._id}" onclick="handleEditClick(this)">Edit</button>
                </div>
    </div>
    </div>
  </div>`;
    })
    .catch(error => console.error('Error:', error));
}

function handleRowClickVendor(row) {
  const vendorId = row.getAttribute('data-vendorId'); // Make sure it matches your HTML attribute name
  axios.get(`/admin/getVendorDetails?vendorId=${encodeURIComponent(vendorId)}`)
    .then(response => {
      const data = response.data;
      document.getElementById('exampleModalLabel').innerText = data.vendorId;
      document.querySelector('#viewVendor .modal-body').innerHTML = `
 <div class="row g-0">
   
    <div class="col-md-12">
      <div class="card-body">
        <h5 class="card-title">${data.name}</h5>
       <ul class="list-group list-group-flush">
                    <li class="list-group-item">Email: ${data.email}</li>
                    <li class="list-group-item">ShopName: ${data.shopName}</li>
                    <li class="list-group-item">Phone: ${data.phone}</li>
                    <li class="list-group-item">Account Number: ${data.accountNumber}</li>
                    <li class="list-group-item">Bank Name: ${data.bankName}</li>
                </ul> 
  <div class="card-footer d-flex justify-content-center">
                    <form action="#"method='get' class="deleteForm">
                        <input type="hidden" name="deleteVendorId" value="${data._id}">
                        <button type="submit" class="btn btn-danger me-4 mt-4 deleteButtonVender">Delete</button>                    </form>
                </div>
    </div>
    </div>
  </div>`;
      document.addEventListener('click', (event) => {
        if (event.target.classList.contains('deleteButtonVender')) {
          event.preventDefault(); // Prevent form submission

          const deleteVenderId = event.target.closest('.deleteForm').querySelector('[name="deleteVendorId"]').value;

          // eslint-disable-next-line no-alert, no-restricted-globals
          if (confirm('Are you sure you want to delete this user?')) {
            axios.get(`/admin/deleteVender?deleteVenderId=${encodeURIComponent(deleteVenderId)}`)
              .then(responses => {
                // Handle successful deletion (if needed)
                console.log(responses.data);
                window.location.href = '/admin/vendor';
                // Optionally, you can remove the user from the UI here
              })
              .catch(error => console.error('Error deleting user:', error));
          }
        }
      })
        .catch(error => console.error('Error:', error));
    });
}

function handleRowClickVendorNotification(button) {
  const vendorId = button.getAttribute('data-vendorId'); // Make sure it matches your HTML attribute name
  axios.get(`/admin/getVendorDetails?vendorId=${encodeURIComponent(vendorId)}`)
    .then(response => {
      const data = response.data;
      document.querySelector('#viewVendorDetails .modal-body').innerHTML = `
      <div class="col-md-12">
        <div class="card-body">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Email:
              <span class="text-info">${data.email}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Age:
              <span class="text-info">${data.age}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Shop Name:
              <span class="text-info">${data.shopName}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Phone:
              <span class="text-info">${data.phone}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Account Number:
              <span class="text-info">${data.accountNumber}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Bank Name:
              <span class="text-info">${data.bankName}</span>
            </li>
          </ul>
        </div>
      </div>`;
    })
    .catch(error => console.error('Error:', error));
}

function handleRowClickUser(row) {
  const userId = row.getAttribute('data-userId');
  console.log(userId);
  axios.get(`/admin/getUserDetails?UserId=${encodeURIComponent(userId)}`)
    .then(response => {
      const data = response.data;
      console.log(response);

      document.getElementById('exampleModalLabel').innerText = data.userId;

      // Build address HTML
      const addressHTML = data.address.map(addr => `
        <li class="list-group-item">
          Address: <br>  House Name :${addr.houseName}<br>Place: ${addr.place}<br>Zip Code: ${addr.zip}
        </li>
      `).join('');

      document.querySelector('#viewUsers .modal-body').innerHTML = `
        <div class="row g-0 p-2">
        
          <div class="col-md-12 ">
            <div class="card-body">
              <h5 class="card-title">${data.name}</h5>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">Email: ${data.email}</li>
                <li class="list-group-item">Age: ${data.age}</li>
                <li class="list-group-item">Phone: ${data.phone}</li>
                <li class="list-group-item">License Number: ${data.licenseNumber}</li>
                ${addressHTML}
                <li class="list-group-item">Join Date: ${data.createdAt}</li>
                <li class="list-group-item">Update Date: ${data.updatedAt}</li>
              </ul> 
              <div class="card-footer d-flex justify-content-center">
              <form action="#" class="deleteForm">
              <input type="hidden" name="deleteUserId" value="${data._id}">
              <button type="submit" class="btn btn-danger me-4 mt-4 deleteButton">Delete</button>
              </form>
              </div>
            </div>
          </div>
        </div>`;
      document.addEventListener('click', (event) => {
        if (event.target.classList.contains('deleteButton')) {
          event.preventDefault(); // Prevent form submission

          const deleteUserId = event.target.closest('.deleteForm').querySelector('[name="deleteUserId"]').value;

          // eslint-disable-next-line no-alert, no-restricted-globals
          if (confirm('Are you sure you want to delete this user?')) {
            axios.get(`/admin/deleteUser?deleteUserId=${encodeURIComponent(deleteUserId)}`)
              .then(responses => {
                // Handle successful deletion (if needed)
                console.log(responses.data);
                window.location.href = '/admin/users';
                // Optionally, you can remove the user from the UI here
              })
              .catch(error => console.error('Error deleting user:', error));
          }
        }
      });
    })
    .catch(error => console.error('Error:', error));
}

function handleEditClick(button) {
  const carId = button.getAttribute('data-carEId');
  fetch(`/admin/getCarDetails?carId=${encodeURIComponent(carId)}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('editCarModalLabel').innerText = `Edit ${data.carName} `;
      // Update the form fields with the fetched data
      document.querySelector('#editModal [name="carName"]').value = data.carName;
      document.querySelector('#editModal [name="carCategory"]').value = data.carCategory;
      document.querySelector('#editModal [name="year"]').value = data.year;
      document.querySelector('#editModal [name="dayRent"]').value = data.dayRent;
      document.querySelector('#editModal [name="seats"]').value = data.seats;
      document.querySelector('#editModal [name="luggage"]').value = data.luggage;
      document.querySelector('#editModal [name="brandName"]').value = data.brandName;
      document.querySelector('#editModal [name="carModal"]').value = data.carModal;
      document.querySelector('#editModal [name="licensePlateNumber"]').value = data.licensePlateNumber;
      document.querySelector('#editModal [name="carImage"]').value = ''; // You may not want to populate the file input
      document.querySelector('#editModal [name="color"]').value = data.color;
      document.querySelector('#editModal [name="location"]').value = data.location;
      document.querySelector('#editModal [name="fuelType"]').value = data.fuelType;
      document.querySelector('#editModal [name="TransmitionType"]').value = data.TransmitionType;
      document.querySelector('#editModal [name="milage"]').value = data.milage;
      const datePart = data.insurenceDate.substring(0, 10);
      document.querySelector('#editModal [name="insurenceDate"]').value = datePart;
      document.querySelector('#editModal [name="features"]').value = data.features;
      document.querySelector('#editModal [name="description"]').value = data.description;
      document.querySelector('#editModal [name="editCarId"]').value = data._id;

      const editModal = new bootstrap.Modal(document.getElementById('editModal'));
      editModal.show();
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('searchByCarName').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const search = document.getElementById('searchByCarName').value;
    const category = document.getElementById('category').value;

    // Construct the URL and navigate to it

    window.location.href = `/searchByCarName?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`;
  }
});
function handleRowClickVendorCar(row) {
  const carId = row.getAttribute('data-carId'); // Make sure it matches your HTML attribute name

  axios.get(`/Vendor/getCarDetails?carId=${encodeURIComponent(carId)}`)
    .then(response => {
      const data = response.data;
      document.getElementById('exampleModalLabel').innerText = data.carId;
      document.querySelector('#viewCarsVendor .modal-body').innerHTML = `
      
  <div class="row g-0">
    <div class="col-md-4">
      <img src="${data.carImage}" class="img-fluid rounded-start  col-12 mt-4 " style="height:325px;object-fit: cover; width: 100%; " alt="Car Image">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${data.carName}</h5>
       <ul class="list-group list-group-flush">
                    <li class="list-group-item">Model: ${data.carModal}</li>
                    <li class="list-group-item">Transmission Type: ${data.TransmitionType}</li>
                    <li class="list-group-item">Year: ${data.year}</li>
                    <li class="list-group-item">Category: ${data.carCategory}</li>
                    <li class="list-group-item">Day Rent: ${data.dayRent}</li>
                    <li class="list-group-item">Location: ${data.location}</li>
                    <li class="list-group-item">Brand Name: ${data.brandName}</li>
                    <li class="list-group-item">License Plate Number: ${data.licensePlateNumber}</li>
                    <li class="list-group-item">Color: ${data.color}</li>
                </ul> 
  <div class="card-footer d-flex justify-content-center">
                    <form action="/vendor/CarPage/deleteCar" method='get' id="deleteForm">
                        <input type="hidden" name="deleteCarId" value="${data._id}">
                        <button type="submit" class="btn btn-danger me-4 mt-4" ">Delete</button>
                    </form>
                    <button type="button" class="btn btn-primary  mt-4" data-bs-toggle="modal" data-bs-target="#editModal" data-carEId="${data._id}" onclick="handleEditClickVendor(this)">Edit</button>
                </div>
    </div>
    </div>
  </div>`;
    })
    .catch(error => console.error('Error:', error));
}
function handleEditClickVendor(button) {
  const carId = button.getAttribute('data-carEId');
  fetch(`/vendor/getCarDetails?carId=${encodeURIComponent(carId)}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('editCarModalLabel').innerText = `Edit ${data.carName} `;
      // Update the form fields with the fetched data
      document.querySelector('#editModal [name="carName"]').value = data.carName;
      document.querySelector('#editModal [name="carCategory"]').value = data.carCategory;
      document.querySelector('#editModal [name="year"]').value = data.year;
      document.querySelector('#editModal [name="dayRent"]').value = data.dayRent;
      document.querySelector('#editModal [name="seats"]').value = data.seats;
      document.querySelector('#editModal [name="luggage"]').value = data.luggage;
      document.querySelector('#editModal [name="brandName"]').value = data.brandName;
      document.querySelector('#editModal [name="carModal"]').value = data.carModal;
      document.querySelector('#editModal [name="licensePlateNumber"]').value = data.licensePlateNumber;
      document.querySelector('#editModal [name="carImage"]').value = ''; // You may not want to populate the file input
      document.querySelector('#editModal [name="location"]').value = data.location;
      document.querySelector('#editModal [name="color"]').value = data.color;
      document.querySelector('#editModal [name="fuelType"]').value = data.fuelType;
      document.querySelector('#editModal [name="TransmitionType"]').value = data.TransmitionType;
      document.querySelector('#editModal [name="milage"]').value = data.milage;
      const datePart = data.insurenceDate.substring(0, 10);
      document.querySelector('#editModal [name="insurenceDate"]').value = datePart;
      document.querySelector('#editModal [name="features"]').value = data.features;
      document.querySelector('#editModal [name="description"]').value = data.description;
      document.querySelector('#editModal [name="editCarId"]').value = data._id;

      const editModal = new bootstrap.Modal(document.getElementById('editModal'));
      editModal.show();
    })
    .catch(error => console.error('Error:', error));
}
