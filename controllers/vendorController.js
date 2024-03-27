const { v4: uuidv4 } = require('uuid');
const helper = require('../helpers/venderHelper');
const cloudinary = require('../service/cloudnery');

const loginPage = (req, res) => {
  res.status(200).render('vendor/login');
};

async function showVendorDashboard(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).render('vendor/login', { error: 'Missing email or password' });
  }

  const {
    success, error, vendorId, ownerId,
  } = await helper.authenticateVendor(email, password);

  if (!success) {
    return res.status(401).render('vendor/login', { error });
  }

  req.session.vendorId = vendorId;
  req.session.ownerId = ownerId;
  return res.status(200).redirect('/vendor/dashboardPage');
}
const showDashboard = (req, res) => {
  res.status(200).render('vendor/dashboard');
};

const signUpPage = (req, res) => {
  res.status(200).render('vendor/signUp');
};

const getOtp = (req, res) => {
  res.status(200).render('vendor/otpPage');
};
async function otpGenerate(req, res) {
  try {
    const { email } = req.body;
    helper.generateAndSendOtp(email)
      .then(() => {
        req.session.email = email;
        res.status(201).render('vendor/generateOtp', { email });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
}

async function loginOtp(req, res) {
  try {
    const { otp } = req.body;
    const { email } = req.session;
    const vendor = await helper.validateOtp(otp, email);
    req.session.vendorId = uuidv4();
    req.session.ownerId = vendor._id;
    res.status(200).redirect('/vendor/dashboardPage');
  } catch (error) {
    res.status(404).redirect('admin/login');
  }
}

async function signupVendor(req, res) {
  try {
    await helper.createVendor(req.body);
    return res.status(201).redirect('/vendor/login?popup=Successfully+Submit+Your+Data+Access+after+Enable+Admin');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function vendorCarPage(req, res) {
  try {
    const { ownerId } = req.session;
    if (!ownerId) {
      throw new Error('Vendor ID not found');
    }

    const result = await helper.getVendorCars(ownerId);
    res.status(200).render('vendor/carPage', {
      data: result.cars, count: result.count, vendor: result.vendor, location: result.locations,
    });
  } catch (error) {
    throw new Error(`Error rendering vendor car page: ${error.message}`);
  }
}

async function addCarVendor(req, res) {
  try {
    const { ownerId } = req.session;
    if (!ownerId) {
      throw new Error('Owner ID not found in session');
    }

    if (!req.file || !req.file.path) {
      throw new Error('No file uploaded');
    }

    const imagePath = req.newPath.url;
    helper.createCar(req.body, ownerId, imagePath)
      .then(() => {
        res.status(201).redirect('/vendor/CarPage');
      })
      .catch(() => {
        res.status(500).json('server Error');
      });
  } catch (error) {
    throw new Error(`Error adding car: ${error.message}`);
  }
}
async function updateCar(req, res) {
  try {
    const { editCarId, ...updateValues } = req.body;
    const updatedCar = await helper.updateCarById(editCarId, updateValues, req);

    // If the updatedCar is not found, send a 404 response
    if (!updatedCar) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // If a new image is uploaded, update the car image details
    if (req.file) {
      const publicIdToDelete = updatedCar.imageId;
      // Delete the old image from Cloudinary
      if (publicIdToDelete) {
        await cloudinary.deleteImage(publicIdToDelete);
      }
      updatedCar.carImage = req.newPath.url;
      updatedCar.imageId = req.newPath.id;
    }

    // Save the updated car
    await updatedCar.save();

    // Redirect to the car page
    return res.status(200).redirect('/vendor/carPage');
  } catch (error) {
    console.error('Server Error:', error);
    // Send a 500 response for any server errors
    return res.status(500).send('Server Error');
  }
}

async function getCar(req, res) {
  try {
    const { carId } = req.query;
    const carDetails = await helper.getCarById(carId);

    // If car details are found, send them in the response
    if (carDetails) {
      res.json(carDetails);
    } else {
      // If car details are not found, send a 404 response
      res.status(404).json({ error: 'Car not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    // Send a 500 response for any server errors
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function deleteCar(req, res) {
  try {
    const deleteId = req.query.deleteCarId;
    const result = await helper.deleteCarHelper(deleteId);
    if (!result) {
      return res.status(500).json('Server Error');
    }
    return res.status(200).redirect('/vendor/carPage');
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).send(error.message);
  }
}
const vendorLogout = (req, res) => {
  if (req.session.vendorId) {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).redirect('/vendor/Dashboard');
      } else {
        res.status(200).redirect('/vendor/login');
      }
    });
  }
};

const vendorNotification = async (req, res) => {
  const { ownerId } = req.session;
  helper.notificationPageHelper(ownerId)
    .then((vendor) => {
      res.status(200).render('vendor/notification', { data: vendor.notifications });
    })
    .catch(() => {
      res.status(200).json('vendor notification Error');
    });
};
const venderRecoveryMessage = async (req, res) => {
  try {
    const { ...data } = req.body;
    const { ownerId } = req.session;
    const result = await helper.venderRecoveryMessageHelper(data, ownerId);
    if (!result) {
      return res.status(500).json('Server Error');
    }
    return res.status(201).redirect('/vendor/Notification');
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).send(error.message);
  }
};

const bookingPage = async (req, res) => {
  try {
    const { ownerId } = req.session;
    const bookingData = await helper.getBookingPageData(ownerId);
    return res.status(200).render('vendor/bookingPage', bookingData);
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
const changCarStatus = async (req, res) => {
  try {
    const { id } = req.body;
    await helper.updateCarStatus(id);
    return res.status(200).json('ok');
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

const servicePage = async (req, res) => {
  try {
    const { ownerId } = req.session;
    const service = await helper.getServiceData(ownerId);
    return res.status(200).render('vendor/service', { service });
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
const addService = async (req, res) => {
  try {
    const { serviceName, charge, description } = req.body;
    const { ownerId } = req.session;
    const { url: image, id: imageId } = req.newPath;

    const service = await helper
      .addServiceData(serviceName, charge, description, image, imageId, ownerId);
    return res.status(200).render('vendor/service', { service });
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
const editService = async (req, res) => {
  try {
    const {
      serviceName, charge, description, id,
    } = req.body;
    const { ownerId } = req.session;
    const file = req.file ? req.newPath : null;

    const service = await helper
      .editServiceData(serviceName, charge, description, id, file, ownerId);

    return res.status(200).render('vendor/service', { service });
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerId } = req.session;

    const service = await helper.deleteServiceData(id, ownerId);

    return res.status(200).render('vendor/service', { service });
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
const UserPage = async (req, res) => {
  try {
    const { ownerId } = req.session;
    const data = await helper.getUserData(ownerId);
    return res.status(200).render('vendor/User', { data });
  } catch (error) {
    console.error('Controller Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

async function payment(req, res) {
  try {
    const { ownerId } = req.session;
    const result = await helper.renderPaymentPage(ownerId);
    return res.status(200).render('vendor/payment', result);
  } catch (error) {
    throw new Error(`Error handling payment: ${error.message}`);
  }
}
module.exports = {
  loginPage,
  showVendorDashboard,
  getOtp,
  otpGenerate,
  loginOtp,
  showDashboard,
  vendorCarPage,
  addCarVendor,
  updateCar,
  getCar,
  deleteCar,
  signUpPage,
  signupVendor,
  vendorLogout,
  vendorNotification,
  venderRecoveryMessage,
  bookingPage,
  changCarStatus,
  servicePage,
  addService,
  editService,
  deleteService,
  UserPage,
  payment,
};
