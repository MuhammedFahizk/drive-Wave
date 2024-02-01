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

  axios.get(`/getCarDetails?carId=${encodeURIComponent(carId)}`)
    .then(response => {
      const data = response.data;
      document.getElementById('exampleModalLabel').innerText = data.carId;
      document.querySelector('#viewCars .modal-body').innerHTML = `
      
  <div class="row g-0">
    <div class="col-md-4">
      <img src="/${data.carImage}" class="img-fluid rounded-start  col-12 mt-4 " style="height:325px;object-fit: cover; width: 100%; " alt="Car Image">
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
                    <li class="list-group-item">Brand Name: ${data.brandName}</li>
                    <li class="list-group-item">License Plate Number: ${data.licensePlateNumber}</li>
                    <li class="list-group-item">Color: ${data.color}</li>
                </ul> 
  <div class="card-footer d-flex justify-content-center">
                    <form action="/adminCarPage/deleteCar" method='get' id="deleteForm">
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

function handleRowClickVender(row) {
  const venderId = row.getAttribute('data-venderId'); // Make sure it matches your HTML attribute name
  axios.get(`/getVenderDetails?venderId=${encodeURIComponent(venderId)}`)
    .then(response => {
      const data = response.data;
      document.getElementById('exampleModalLabel').innerText = data.venderId;
      document.querySelector('#viewVender .modal-body').innerHTML = `
 <div class="row g-0">
    <div class="col-md-4">
      <img src="/${data.carImage}" class="img-fluid rounded-start  col-12 mt-4 " style="height:325px;object-fit: cover; width: 100%; " alt="Car Image">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${data.name}</h5>
       <ul class="list-group list-group-flush">
                    <li class="list-group-item">Email: ${data.email}</li>
                    <li class="list-group-item">Age: ${data.age}</li>
                    <li class="list-group-item">ShopName: ${data.shopeName}</li>
                    <li class="list-group-item">Phone: ${data.phone}</li>
                    <li class="list-group-item">Account Number: ${data.accountNumber}</li>
                    <li class="list-group-item">Bank Name: ${data.bankName}</li>
                </ul> 
  <div class="card-footer d-flex justify-content-center">
                    <form action="/adminVender/deleteVender" method='get' id="deleteForm">
                        <input type="hidden" name="deleteVenderId" value="${data._id}">
                        <button type="submit" class="btn btn-danger me-4 mt-4" ">Delete</button>
                    </form>
                </div>
    </div>
    </div>
  </div>`;
    })
    .catch(error => console.error('Error:', error));
}

function handleEditClick(button) {
  const carId = button.getAttribute('data-carEId');
  fetch(`/getCarDetails?carId=${encodeURIComponent(carId)}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('editCarModalLabel').innerText = `Edit ${data.carName} `;
      // Update the form fields with the fetched data
      document.querySelector('#editModal [name="carName"]').value = data.carName;
      document.querySelector('#editModal [name="carCategory"]').value = data.carCategory;
      document.querySelector('#editModal [name="year"]').value = data.year;
      document.querySelector('#editModal [name="dayRent"]').value = data.dayRent;
      document.querySelector('#editModal [name="brandName"]').value = data.brandName;
      document.querySelector('#editModal [name="carModal"]').value = data.carModal;
      document.querySelector('#editModal [name="licensePlateNumber"]').value = data.licensePlateNumber;
      document.querySelector('#editModal [name="carImage"]').value = ''; // You may not want to populate the file input
      document.querySelector('#editModal [name="color"]').value = data.color;
      document.querySelector('#editModal [name="fuelType"]').value = data.fuelType;
      document.querySelector('#editModal [name="TransmitionType"]').value = data.TransmitionType;
      document.querySelector('#editModal [name="milage"]').value = data.milage;
      const datePart = data.insurenceDate.substring(0, 10);
      document.querySelector('#editModal [name="insurenceDate"]').value = datePart;
      document.querySelector('#editModal [name="feathers"]').value = data.feathers;
      document.querySelector('#editModal [name="description"]').value = data.description;
      document.querySelector('#editModal [name="editCarId"]').value = data._id;

      const editModal = new bootstrap.Modal(document.getElementById('editModal'));
      editModal.show();
    })
    .catch(error => console.error('Error:', error));
}
// document.addEventListener('DOMContentLoaded', () => {
//   const searchField = document.getElementById('searchField');
//   searchField.addEventListener('keyup', (event) => {
//     if (event.key === 'Enter') {
//       const searchTerm = searchField.value.trim();

//       if (searchTerm !== '') {
//         const apiUrl = `/adminCarPage/searchCar?query=${encodeURIComponent(searchTerm)}`;

//         axios.get(apiUrl)
//           .then((response) => {
//             console.log('API Response:', response.data);
//           })
//           .catch((error) => {
//             console.error('Error:', error.message);
//           });
//       } else {
//         console.log('Please enter a search term.');
//       }
//     }
//   });
// });
document.getElementById('searchByCarName').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const search = document.getElementById('searchByCarName').value;
    const category = document.getElementById('category').value;

    // Construct the URL and navigate to it

    window.location.href = `/searchByCarName?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`;
  }
});
