const helper = require('../helpers/adminHelper');

const showLoginPageAdmin = (req, res) => {
  res.render('loginPage');
};
async function getAdminDashBoard(req, res) {
  helper.authenticateAdmin(req.body)
    .then((adminId) => {
      req.session.adminId = adminId;
      res.redirect('/admin/DashboardPage');
    })
    .catch((error) => {
      console.error('Authentication failed:', error.message);
      res.render('loginPage', { error });
    });
}
async function loginOtp(req, res) {
  const { otp } = req.body;
  const { email } = req.session;
  helper.loginOtpHelper(otp, email)
    .then((adminId) => {
      req.session.adminId = adminId;
      res.redirect('/admin/DashboardPage');
    })
    .catch((error) => {
      if (error.message === 'Admin not found') {
        res.status(404).redirect('/admin/login');
      } else {
        res.status(400).send(error.message);
      }
    });
}
const showAdminDashboard = async (req, res) => {
  helper.getDataForAdminDashboard()
    .then((data) => {
      res.render('admin/index', data);
    })
    .catch((error) => {
      console.error('Error rendering admin dashboard:', error.message);
    });
};
async function showAdminCarPage(req, res) {
  helper.showAdminCarPageHelper()
    .then(({
      car, counts, user, locations,
    }) => {
      res.render('admin/adminCarPage', {
        data: car,
        count: counts,
        user,
        locations,
      });
    })
    .catch((error) => {
      res.status(500).send('Internal Server Error');
      console.error('Error fetching data for admin car page:', error);
    });
}
const logout = (req, res) => {
  if (req.session.adminId) {
    req.session.destroy((error) => {
      if (error) {
        res.status(401).json('email error');
      } else {
        res.status(200).redirect('/admin/login');
      }
    });
  }
};

async function addCarAdmin(req, res) {
  helper.addCarAdminHelper(req.body, req.newPath)
    .then(() => {
      res.status(201).redirect('/admin/CarPage');
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
}
async function getCar(req, res) {
  try {
    const { carId } = req.query;
    helper.carDetails(carId)
      .then((carDetails) => {
        res.status(200).json(carDetails);
      })
      .catch((error) => {
        console.error(error);
        res.status(400).json('car Not Found');
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const deleteCar = async (req, res) => {
  helper.deleteCarHelper(req.query.deleteCarId)
    .then(() => {
      res.status(200).redirect('/admin/carPage');
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};
function OtpPage(req, res) {
  res.status(200).render('loginOtpPage');
}
function otpGenerate(req, res) {
  const { email } = req.body;

  helper.otpGenerateHelper(email)
    .then(() => {
      req.session.email = email;
      res.status(201).render('generateOtp', { email });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
}
async function updateCar(req, res) {
  const { editCarId, ...updateValues } = req.body;
  helper.updateCarHelper(editCarId, updateValues, req)
    .then(() => {
      res.status(200).redirect('/admin/carPage');
    })
    .catch((error) => {
      res.status(400).send(error.message);
    });
}
const findCarCategories = async (req, res) => {
  const { category } = req.query;
  helper.findCarCategoriesHelper(category)
    .then((data, count) => {
      res.status(200).render('admin/adminCarPage', { data, count, category });
    })
    .catch((error) => {
      res.status(500).send('Server Error: ', error.message);
    });
};

const viewNotificationPage = async (req, res) => {
  helper.viewNotificationPageHelper()
    .then(({
      data, count, NotificationCount, adminDoc, vendorDoc,
    }) => {
      res.status(200).render('admin/notification', {
        data,
        count,
        NotificationCount,
        adminDoc,
        vendorDoc,
      });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
};

const disableVendor = async (req, res) => {
  helper.disableVendorHelper(req.query.id)
    .then(() => {
      res.status(200).redirect('/admin/notification');
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
};

const enableVendor = async (req, res) => {
  helper.enableVendorHelper(req.query.id)
    .then(() => {
      res.status(200).redirect('/admin/notification');
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
};

const BookingPage = async (req, res) => {
  helper.BookingPageHelper()
    .then(({
      allBookings, bookingsCount, pendingBookingsCount, confirmedBookingsCount,
    }) => {
      res.status(200).render('admin/bookingPage', {
        allBookings,
        bookingsCount,
        pendingBookingsCount,
        confirmedBookingsCount,
      });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
};

const payment = async (req, res) => {
  helper.paymentHelper()
    .then((paymentData) => {
      res.status(200).render('admin/payment', paymentData);
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send('Internal server error');
    });
};

const changCarStatus = async (req, res) => {
  helper.changCarStatusHelper(req.body.id)
    .then(() => {
      res.status(200).json('ok');
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
};

const servicePage = async (req, res) => {
  helper.servicePageHelper()
    .then((service) => {
      res.status(200).render('admin/service', { service });
    })
    .catch((error) => {
      res.status(500).json('Internal Server Error', error);
    });
};

const addService = async (req, res) => {
  helper.addServiceHelper(req.body, req.newPath.url, req.newPath.id)
    .then((service) => {
      res.status(200).render('admin/service', { service });
    })
    .catch((error) => {
      res.status(500).json('Internal Server Error', error);
    });
};
const editService = async (req, res) => {
  try {
    const updatedAdmin = await helper.editServiceHelper(req);
    return res.status(200).render('admin/service', { service: updatedAdmin.service });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteService = async (req, res) => {
  helper.deleteServiceHelper(req.params.id)
    .then((service) => {
      res.status(200).render('admin/service', { service });
    })
    .catch(() => {
      res.status(500).json({ error: 'Internal server error' });
    });
};

const getBanner = async (req, res) => {
  helper.getBannerHelper(req.params.bannerId)
    .then((banner) => {
      res.status(200).json(banner);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

const addBanner = async (req, res) => {
  helper.addBannerHelper(req)
    .then(() => {
      res.status(200).json('ok');
    })
    .catch((error) => {
      res.status(500).json('error:', error);
    });
};

const deleteBanner = async (req, res) => {
  const { bannerId } = req.params;
  console.error(bannerId);
  try {
    const result = await helper.deleteBannerHelper(bannerId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
const addLocations = async (req, res) => {
  const { location } = req.body;
  helper.addLocationsHelper(location)
    .then(() => {
      res.status(201).json('ok');
    });
};
const removeLocation = async (req, res) => {
  const { location } = req.body;
  helper.removeLocationHelper(location)
    .then(() => {
      res.status(200).json('ok');
    });
};
// // vendor page
async function vendorPage(req, res) {
  helper.vendorPageHelper()
    .then((vendors, NotificationCount, count) => {
      res.status(200).render('admin/adminVendorPage', { data: vendors, NotificationCount, count });
    })
    .catch((error) => {
      res.status(500).json('server error', error);
    });
}

async function vendorDetails(req, res) {
  helper.vendorDetailsHelper(req.query.vendorId)
    .then((vendors) => {
      res.status(200).json(vendors);
    })
    .catch((error) => {
      res.status(500).json('Internal server error', error);
    });
}
async function deleteVendor(req, res) {
  const { deleteVenderId } = req.query;
  try {
    const result = await helper.deleteVendorHelper(deleteVenderId);
    res.status(200).json({ message: result });
  } catch (error) {
    console.error('Error deleting vendor:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// // user page ,
async function userPage(req, res) {
  try {
    helper.getUserData()
      .then(({ data, count }) => {
        res.status(200).render('admin/adminUserPage', { data, count });
      })
      .catch((error) => {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function userDetails(req, res) {
  try {
    const { UserId } = req.query;
    helper.getUserDetails(UserId)
      .then((user) => {
        res.status(200).json(user);
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUser(req, res) {
  const { deleteUserId } = req.query;
  try {
    const result = await helper.deleteUserHelper(deleteUserId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
const deleteUserData = async (req, res) => {
  try {
    const { id } = req.query;
    const redirectUrl = await helper.deleteUserDataHelper(id);
    return res.status(200).redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCancelUser = async (req, res) => {
  try {
    const {
      id, userId, venderId, notificationId,
    } = req.query;

    helper.deleteCancelUserHelper(id, userId, venderId, notificationId)
      .then((redirectUrl) => {
        res.status(200).redirect(redirectUrl);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

setInterval(helper.cleanupSoftDeletedData, 24 * 60 * 60 * 1000);
setInterval(helper.checkPickUp, 60 * 10);
module.exports = {
  showLoginPageAdmin,
  loginOtp,
  getAdminDashBoard,
  showAdminDashboard,
  showAdminCarPage,
  logout,
  addCarAdmin,
  getCar,
  deleteCar,
  OtpPage,
  otpGenerate,
  updateCar,
  findCarCategories,
  viewNotificationPage,
  disableVendor,
  enableVendor,
  BookingPage,
  payment,
  changCarStatus,
  servicePage,
  addService,
  editService,
  deleteService,
  addBanner,
  getBanner,
  deleteBanner,
  addLocations,
  removeLocation,
  // vendor
  vendorPage,
  vendorDetails,
  deleteVendor,
  //   // user
  userPage,
  userDetails,
  deleteUser,
  deleteUserData,
  deleteCancelUser,
};
