/* eslint-disable linebreak-style */
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
      <img src="${data.carImage}" class="img-fluid rounded-start  col-12 mt-4 " style="height:325px; alt="Car Image">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${data.carName}</h5>
       <ul class="list-group list-group-flush">
                    <li class="list-group-item">Model: ${data.carModal}</li>
                    <li class="list-group-item">Transmission Type: ${data.TransmitionType}</li>
                    <li class="list-group-item">Year: ${data.year}</li>
                    <li class="list-group-item">Category: ${data.charCategory}</li>
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
                    <button type="button" class="btn btn-primary  mt-4" data-bs-toggle="modal" data-bs-target="#editCar" data-carEId="${data._id}" onclick="handleEditClick(this)">Edit</button>
                </div>
    </div>
    </div>
  </div>`;
    })
    .catch(error => console.error('Error:', error));
}
