/* eslint-disable import/order */
const { admin } = require('../models/users');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/users');
const adminService = require('../service/adminService');
const { sendAdminOtp, generateOtp, sendmailVendor } = require('../service/nodeMailer');
const { Car } = require('../models/car');
const cloudinary = require('../service/cloudnery');

const emailOtp = {};

function authenticateAdmin(data) {
  return new Promise((resolve, reject) => {
    admin.findOne({ role: 'Admin', email: data.email })
      .then((Admin) => {
        if (Admin && bcrypt.compareSync(data.password, Admin.password)) {
          const adminId = uuidv4();
          resolve(adminId); // Resolve with adminId if authentication succeeds
        } else {
          reject(new Error('Invalid email or password'));
        }
      })
      .catch((error) => {
        reject(new Error('Server error occurred', error));
      });
  });
}

function loginOtpHelper(otp, email) {
  return new Promise((resolve, reject) => {
    if (emailOtp[email] && emailOtp[email] === otp) {
      admin.findOne({ email })
        .then((Admin) => {
          if (Admin) {
            delete emailOtp[email];
            const adminId = uuidv4();
            resolve(adminId); // Resolve with adminId if login is successful
          } else {
            reject(new Error('Admin not found')); // Reject if admin not found
          }
        })
        .catch((error) => {
          reject(new Error('Server Error: ', error.message)); // Reject if an error occurs
        });
    } else {
      reject(new Error('Invalid OTP')); // Reject if OTP is invalid
    }
  });
}
async function getDataForAdminDashboard() {
  try {
    const customersPromise = await User.find({ role: 'user' }).countDocuments();
    const dailyRentsPromise = adminService.dailyRents();
    const dailyRentalAmountPromise = adminService.dailyRentalAmount();
    const dailyRentalPendingPromise = adminService.dailyRentalAmountPending();
    const confirmAmount = await adminService.confirmAmount();

    const pendingAmount = await adminService.pendingAmount();
    const AdminPromise = admin.findOne({ role: 'Admin' });

    const [
      customers,
      dailyRents,
      dailyRentalAmount,
      dailyRentalPending,
      Admin,
    ] = await Promise.all([
      customersPromise,
      dailyRentsPromise,
      dailyRentalAmountPromise,
      dailyRentalPendingPromise,
      AdminPromise,
    ]);

    const locations = Admin.locations.map((locationParts) => locationParts.replace(/\s+/g, '-'));

    return {
      dailyRents,
      dailyRentalAmount,
      dailyRentalPending,
      confirmAmount,
      pendingAmount,
      customers,
      banner: Admin.banner,
      locations,
    };
  } catch (error) {
    throw new Error('Error fetching data for admin dashboard: ', error.message);
  }
}

async function deleteCarHelper(deleteId) {
  try {
    if (!deleteId) {
      throw new Error('Car ID not provided');
    }

    const car = await Car.findById(deleteId);
    const publicIdToDelete = car.imageId;

    if (!publicIdToDelete) {
      throw new Error('Image ID not found for the car');
    }

    return cloudinary.deleteImage(publicIdToDelete)
      .then(() => {
        Car.findByIdAndDelete(deleteId)
          .then((result) => {
            if (!result) {
              throw new Error('Car not found');
            }
            return result;
          });
      })
      .catch((error) => {
        throw new Error('Error deleting car: ', error.message);
      });
  } catch (error) {
    throw new Error('Error deleting car: ', error.message);
  }
}

function otpGenerateHelper(email) {
  return new Promise((resolve, reject) => {
    const otp = generateOtp();
    emailOtp[email] = otp;
    sendAdminOtp(email, otp)
      .then(() => {
        console.error(otp, email);
        resolve({ otp, email });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function getCarData() {
  try {
    const car = await Car.find();
    return car;
  } catch (error) {
    throw new Error('Error fetching car data: ', error.message);
  }
}

function getAdminUserData() {
  return admin.findOne({ role: 'Admin' });
}

function getCountOfCars() {
  return Car.countDocuments();
}

function formatLocations(user) {
  return user.locations.map((locationParts) => locationParts.replace(/\s+/g, '-'));
}

async function showAdminCarPageHelper() {
  try {
    const car = await getCarData();
    const user = await getAdminUserData();
    const locations = formatLocations(user);
    const counts = await getCountOfCars();
    return {
      car,
      counts,
      user,
      locations,
    };
  } catch (error) {
    throw new Error('Error fetching data for admin car page: ', error.message);
  }
}

async function addCarAdminHelper(carData, newPath) {
  return new Promise((resolve, reject) => {
    const {
      carName,
      carCategory,
      year,
      brand,
      dayRent,
      seats,
      luggage,
      brandName,
      carModal,
      licensePlateNumber,
      color,
      location,
      fuelType,
      TransmitionType,
      milage,
      insurenceDate,
      features,
      description,
    } = carData;

    const locationWithSpaces = location.replace(/-/g, ' ');

    if (newPath) {
      const newCar = new Car({
        carName,
        carCategory,
        year,
        brand,
        dayRent,
        brandName,
        carModal,
        licensePlateNumber,
        color,
        location: locationWithSpaces,
        fuelType,
        TransmitionType,
        milage,
        luggage,
        seats,
        insurenceDate,
        features,
        description,
        imageId: newPath.id,
        carImage: newPath.url,
      });

      newCar.save()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(new Error('Error saving car data: ', error.message));
        });
    } else {
      reject(new Error('No file uploaded'));
    }
  });
}
async function carDetails(id) {
  return new Promise((resolve, reject) => {
    Car.findById(id)
      .then((car) => {
        resolve(car);
      }).catch(() => {
        reject();
      });
  });
}

async function updateCarHelper(editCarId, updateValues, req) {
  try {
    if (!editCarId) {
      throw new Error('Could not get car Id');
    }

    if (updateValues.location !== undefined) {
      // eslint-disable-next-line no-param-reassign
      updateValues.location = updateValues.location.replace(/-/g, ' ');
    }

    let updatedCar = await Car.findByIdAndUpdate(
      editCarId,
      { $set: updateValues },
      { new: true },
    );

    if (!updatedCar) {
      throw new Error('Car not found');
    }

    if (req.file) {
      const car = await Car.findById(editCarId);

      if (!car) {
        throw new Error('Car not found');
      }

      const publicIdToDelete = car.imageId;

      if (publicIdToDelete) {
        await cloudinary.deleteImage(publicIdToDelete);
      }

      updatedCar.carImage = req.newPath.url;
      updatedCar.imageId = req.newPath.id;
      updatedCar = await updatedCar.save(); // Save the updated car
    }

    return updatedCar;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function findCarCategoriesHelper(category) {
  try {
    if (!category) {
      throw new Error('Category parameter is missing');
    }

    const cars = await Car.find({ carCategory: category });
    const carsCount = cars.length;
    if (carsCount === 0) {
      console.warn('No cars found for the provided category');
      // Optionally handle the case where no cars are found
    }

    return {
      data: cars,
      count: carsCount,
      category,
    };
  } catch (error) {
    throw new Error('Server Error: ', error.message);
  }
}
function getVendorsWithDisabledAccess() {
  return admin.aggregate([
    {
      $match: {
        role: 'Vendor',
        vendorAccessEnabled: false,
      },
    },
  ]).exec();
}

function getAdminNotifications() {
  return admin.findOne({ role: 'Admin' }).populate({
    path: 'notifications.userId',
    select: 'name email phone',
  }).exec();
}

function getVendorNotifications() {
  return admin.findOne({ role: 'Admin' }).populate({
    path: 'notifications.vendorId',
    select: 'name email phone',
  }).exec();
}

let NotificationCount = 0;
function viewNotificationPageHelper() {
  return Promise.all(
    [getVendorsWithDisabledAccess(), getAdminNotifications(), getVendorNotifications()],
  )
    .then(([vendors, adminDoc, vendorDoc]) => {
      const count = vendors.length;
      NotificationCount = count;
      return {
        data: vendors,
        count,
        NotificationCount,
        adminDoc,
        vendorDoc,
      };
    })
    .catch((error) => {
      throw new Error('Error fetching notification page data: ', error.message);
    });
}

function sendDisableEmail(email, name) {
  return new Promise((resolve, reject) => {
    const message = `${name}, sorry, admin has not accepted your vendor application.`;
    const subject = 'Disable';
    sendmailVendor(email, message, subject, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function disableVendorHelper(id) {
  try {
    if (!id) {
      throw new Error('ID not provided');
    }

    const vendor = await admin.findById(id);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const { email, name } = vendor;

    await sendDisableEmail(email, name);

    const result = await admin.deleteOne({ _id: id });
    if (!result) {
      throw new Error('Vendor deletion error');
    }

    return result;
  } catch (error) {
    throw new Error('Error disabling vendor: ', error.message);
  }
}

function sendEnableEmail(email, name) {
  return new Promise((resolve, reject) => {
    const message = `${name} Welcome To Drive Wave Admin. You can allow your vendor account <a href="http://localhost:5000/vendor/login">Login</a>`;
    const subject = 'Enable';
    sendmailVendor(email, message, subject, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function enableVendorHelper(id) {
  try {
    if (!id) {
      throw new Error('Vendor ID not provided');
    }

    const vendor = await admin.findById(id);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const { email, name } = vendor;

    await admin.updateOne({ _id: id }, { vendorAccessEnabled: true });

    await sendEnableEmail(email, name);
  } catch (error) {
    throw new Error('Error enabling vendor: ', error.message);
  }
}

async function getBookingsData() {
  try {
    const userWithBookings = await User.find({}).populate('bookedCar.car');
    let allBookings = userWithBookings.flatMap((user) => user.bookedCar.map((booking) => {
      const { pickupDate, returnDate } = booking;
      const totalDays = Math
        .ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24));
      return {
        user,
        userId: user._id,
        userName: user.name,
        bookingDetails: {
          bookingDate: booking.bookingDate.toLocaleDateString(),
          pickupDate: new Date(pickupDate).toLocaleDateString(),
          returnDate: new Date(returnDate).toLocaleDateString(),
          totalDays,
          totalPrice: booking.totalPrice,
          status: booking.status,
          carStatus: booking.carStatus,
          _id: booking._id,
        },
        car: booking.car,
      };
    }));
    allBookings = allBookings.filter((booking) => !booking.car.ownerId);
    return allBookings;
  } catch (error) {
    throw new Error('Error fetching bookings data: ', error.message);
  }
}

function countConfirmedBookings(bookings) {
  return bookings.filter((booking) => booking.bookingDetails.status === 'Confirmed').length;
}

function countPendingBookings(bookings) {
  return bookings.filter((booking) => booking.bookingDetails.status === 'pending').length;
}

async function BookingPageHelper() {
  try {
    const allBookings = await getBookingsData();
    const bookingsCount = allBookings.length;
    const confirmedBookingsCount = countConfirmedBookings(allBookings);
    const pendingBookingsCount = countPendingBookings(allBookings);
    return {
      allBookings,
      bookingsCount,
      pendingBookingsCount,
      confirmedBookingsCount,
    };
  } catch (error) {
    throw new Error('Error processing booking data: ', error.message);
  }
}
async function getPaymentData() {
  try {
    const customers = await adminService.customers();
    const dailyRents = await adminService.dailyRents();
    const dailyRentalAmount = await adminService.dailyRentalAmount();
    const dailyRentalPending = await adminService.dailyRentalAmountPending();

    const conformedAmount = dailyRentalAmount
      .reduce((total, current) => total + current.totalRentalAmount, 0);
    const pendingAmount = dailyRentalPending
      .reduce((total, current) => total + current.totalRentalAmount, 0);
    const customersCount = customers.length;

    return {
      customers,
      dailyRents,
      dailyRentalAmount,
      dailyRentalPending,
      conformedAmount,
      pendingAmount,
      customersCount,
    };
  } catch (error) {
    throw new Error('Error fetching payment data: ', error.message);
  }
}

async function paymentHelper() {
  try {
    const paymentData = await getPaymentData();
    return paymentData;
  } catch (error) {
    throw new Error('Error processing payment data: ', error.message);
  }
}

async function updateUserBooking(user, bookingId) {
  try {
    const bookingToUpdate = user.bookedCar.find((booking) => booking._id.toString() === bookingId);
    if (bookingToUpdate) {
      const status = bookingToUpdate.carStatus;
      if (status === 'PickedDate') {
        bookingToUpdate.carStatus = 'pickedCar';
      }
      if (status === 'ReturnDate') {
        bookingToUpdate.carStatus = 'returnCar';
      }
      await user.save();
    }
  } catch (error) {
    throw new Error('Error changing car status: ', error.message);
  }
}

async function changCarStatusHelper(reqBodyId) {
  try {
    const users = await User.find({}).populate('bookedCar.car');
    users.forEach(async (user) => {
      await updateUserBooking(user, reqBodyId);
    });
    return 'ok';
  } catch (error) {
    throw new Error('Error changing car status: ', error.message);
  }
}

function servicePageHelper() {
  return new Promise((resolve, reject) => {
    admin.findOne({ role: 'Admin' })
      .then((Admin) => {
        resolve(Admin.service);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function addServiceHelper(bodyData, image, imageId) {
  return new Promise((resolve, reject) => {
    const { ServiceName, charge, description } = bodyData;
    admin.findOne({ role: 'Admin' })
      .then((Admin) => {
        if (imageId) {
          const newService = {
            ServiceName,
            charge,
            image,
            imageId,
            description,
          };
          Admin.service.push(newService);
          Admin.save();
          resolve(Admin.service);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}
async function editServiceHelper(req) {
  try {
    const {
      ServiceName, charge, description, id,
    } = req.body;

    // Fetch the admin document and find the index of the service to update
    const adminDoc = await admin.findOne({ role: 'Admin' });

    // Find the index of the service to update
    const serviceIndex = adminDoc.service.findIndex((service) => service._id.toString() === id);

    // Check if the service index is found
    if (serviceIndex === -1) {
      throw new Error('Service not found');
    }

    // Construct the update object
    const updateObject = {
      $set: {
        [`service.${serviceIndex}.ServiceName`]: ServiceName,
        [`service.${serviceIndex}.charge`]: charge,
        [`service.${serviceIndex}.description`]: description,
      },
    };

    // If a new file is uploaded, update image-related fields
    if (req.file) {
      // Delete the old image from Cloudinary
      const publicIdToDelete = adminDoc.service[serviceIndex].imageId;
      if (publicIdToDelete) {
        await cloudinary.deleteImage(publicIdToDelete);
      }
      // Update image and imageId fields
      updateObject.$set[`service.${serviceIndex}.image`] = req.newPath.url;
      updateObject.$set[`service.${serviceIndex}.imageId`] = req.newPath.id;
    }

    // Update the service in the database
    const result = await admin.updateOne({ role: 'Admin' }, updateObject);

    // Check if the service was updated successfully
    if (result.nModified === 0) {
      throw new Error('Service not found or not updated');
    }

    // Return the updated admin document
    const updatedAdmin = await admin.findOne({ role: 'Admin' });
    return updatedAdmin;
  } catch (error) {
    throw new Error(`Error updating service: ${error.message}`);
  }
}

function deleteServiceHelper(id) {
  return new Promise((resolve, reject) => {
    admin.findOne({ role: 'Admin', 'service._id': id })
      .then((foundAdmin) => {
        if (!foundAdmin) {
          throw new Error('Admin or service not found');
        }

        // Filter out the service with the given id
        const updatedServices = foundAdmin.service
          .filter((service) => service._id.toString() !== id);

        // Update the admin document with the filtered services
        return admin.findOneAndUpdate(
          { _id: foundAdmin._id },
          { service: updatedServices },
          { new: true }, // To return the updated document
        );
      })
      .then((savedAdmin) => {
        // Extract the services from the savedAdmin document
        const { service } = savedAdmin;
        resolve(service);
      })
      .catch((error) => {
        reject(new Error('Error deleting service: ', error.message));
      });
  });
}

function getBannerHelper(bannerId) {
  return new Promise((resolve, reject) => {
    admin.findOne({ role: 'Admin' })
      .then((Admin) => {
        if (!Admin) {
          throw new Error('Admin not found');
        }
        const banner = Admin.banner.find((banners) => banners._id.toString() === bannerId);
        if (!banner) {
          throw new Error('Banner not found');
        }
        resolve(banner);
      })
      .catch((error) => {
        reject(new Error('Error fetching banner: ', error.message));
      });
  });
}

function addBannerHelper(req) {
  return new Promise((resolve, reject) => {
    const { ...data } = req.body;
    admin.findOne({ role: 'Admin' })
      .then((Admin) => {
        if (!Admin) {
          throw new Error('Admin not found');
        }
        if (req.file && req.file.path) {
          const newService = {
            heading: data.heading,
            subHeading: data.subHeading,
            bannerImage: req.newPath.url,
            imageId: req.newPath.id,
          };
          Admin.banner.push(newService);
          return Admin.save();
        }
        throw new Error('No file uploaded');
      })
      .then(() => {
        resolve('ok');
      })
      .catch((error) => {
        reject(new Error('Error adding banner: ', error.message));
      });
  });
}
function deleteBannerHelper(bannerId) {
  return new Promise((resolve, reject) => {
    admin.findOne({ role: 'Admin' })
      .then((foundAdmin) => {
        if (!foundAdmin) {
          throw new Error('Admin not found');
        }

        let imageId = '';
        foundAdmin.banner.forEach((banner) => {
          if (banner._id.toString() === bannerId) {
            imageId = banner.imageId;
          }
        });

        return cloudinary.deleteImage(imageId);
      })
      .then((result) => {
        console.error('Image deleted:', result);
        return admin.findOneAndUpdate(
          { role: 'Admin' },
          { $pull: { banner: { _id: bannerId } } },
          { new: true },
        );
      })
      .then(() => {
        resolve('success');
      })
      .catch((error) => {
        reject(new Error('Error deleting banner: ', error.message));
      });
  });
}
function vendorPageHelper() {
  return new Promise((resolve, reject) => {
    const count = admin.find({ role: 'Vendor', deletedAt: null }).countDocuments();

    admin.find({ role: 'Vendor', deletedAt: null })
      .then((vendors) => {
        resolve(vendors, count);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function vendorDetailsHelper(id) {
  return new Promise((resolve, reject) => {
    admin.findById(id)
      .then((vendors) => {
        resolve(vendors);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function deleteVendorHelper(deleteVendorId) {
  try {
    const vendor = await admin.findByIdAndUpdate(deleteVendorId, { deletedAt: new Date() });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const notification = {
      venderId: vendor._id,
      message: `Vendor ${vendor.name} has been deleted.`,
      sender: 'System',
      createdAt: new Date(),
    };

    vendor.notifications.push(notification);
    await vendor.save();

    return 'Vendor deleted successfully';
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Internal server error');
  }
}
function getUserData() {
  return new Promise((resolve, reject) => {
    User.find({ role: 'user', deletedAt: null })
      .then((user) => {
        User.countDocuments({ role: 'user', deletedAt: null })
          .then((count) => {
            resolve({ data: user, count });
          });
      })
      .catch((error) => {
        reject(new Error('Error fetching user data: ', error.message));
      });
  });
}
function getUserDetails(UserId) {
  return new Promise((resolve, reject) => {
    User.findById(UserId)
      .then((user) => {
        if (user) {
          resolve(user);
        } else {
          reject(new Error('User not found'));
        }
      })
      .catch((error) => {
        reject(new Error('Error fetching user details: ', error.message));
      });
  });
}
function deleteUserHelper(deleteUserId) {
  return User.findByIdAndUpdate(deleteUserId, { deletedAt: new Date() })
    .then((user) => {
      if (!user) {
        throw new Error('User not found');
      }
      return 'status : ok';
    })
    .catch((error) => {
      throw new Error(`Error deleting user: ${error.message}`);
    });
}

async function checkPickUp() {
  try {
    const users = await User.find({}).populate('bookedCar.car');
    users.forEach((user) => {
      user.bookedCar.forEach(async (booking) => {
        const currentTime = new Date();
        const targetTimeDate = new Date(booking.pickupDate);
        const returnTargetTimeDate = new Date(booking.returnDate);

        if (booking.carStatus === 'Booked' && targetTimeDate <= currentTime) {
          // eslint-disable-next-line no-param-reassign
          booking.carStatus = 'PickedDate';
          try {
            await user.save();
          } catch (error) {
            console.error('Error updating booking:', error);
          }
        }
        if (booking.carStatus === 'PickedDate' && returnTargetTimeDate <= currentTime) {
          // eslint-disable-next-line no-param-reassign
          booking.carStatus = 'ReturnDate';
          try {
            await user.save();
          } catch (error) {
            console.error('Error updating booking:', error);
          }
        }
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
async function cleanupSoftDeletedData() {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Remove soft-deleted users older than one month
    await User.deleteMany({ deletedAt: { $lt: oneMonthAgo } });

    // Remove soft-deleted vendors older than one month
    await admin.deleteMany({ deletedAt: { $lt: oneMonthAgo } });

    console.error('Soft-deleted data older than one month cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up soft-deleted data:', error);
  }
}
function deleteCancelUserHelper(id, userId, venderId, notificationId) {
  return new Promise((resolve, reject) => {
    if (venderId) {
      admin.findOneAndUpdate(
        { _id: venderId },
        { $unset: { deletedAt: '' }, $pull: { notifications: { _id: notificationId } } },
        { new: true },
      )
        .then((venderDoc) => {
          if (!venderDoc) {
            reject(new Error('Vendor not found'));
          } else {
            resolve('/admin/Notification');
          }
        })
        .catch((error) => reject(error));
    } else {
      User.findOneAndUpdate(
        { _id: userId },
        { $unset: { deletedAt: '' } },
        { new: true },
      )
        .then((userDoc) => {
          if (!userDoc) {
            reject(new Error('User not found'));
          }
          return admin.findOneAndUpdate(
            { role: 'Admin' },
            { $pull: { notifications: { _id: id } } },
            { new: true },
          );
        })
        .then((updatedAdminDoc) => {
          if (!updatedAdminDoc) {
            reject(new Error('Admin not found'));
          } else {
            resolve('/admin/Notification');
          }
        })
        .catch((error) => reject(error));
    }
  });
}

function deleteUserDataHelper(id) {
  return new Promise((resolve, reject) => {
    admin.findOneAndUpdate(
      { role: 'Admin' },
      { $pull: { notifications: { _id: id } } },
      { new: true },
    )
      .then((adminDoc) => {
        if (!adminDoc) {
          reject(new Error('Admin not found'));
        }
        resolve('/admin/Notification'); // Return the redirect URL upon successful deletion
      })
      .catch((error) => {
        reject(error);
      });
  });
}
async function addLocationsHelper(newLocation) {
  try {
    const updatedAdmin = await admin.findOneAndUpdate(
      { role: 'Admin' },
      { $addToSet: { locations: newLocation } },
      { new: true },
    );
    return updatedAdmin;
  } catch (error) {
    throw new Error(`Error adding location to admin: ${error.message}`);
  }
}
async function removeLocationHelper(location) {
  try {
    const updatedOwner = await admin.findOneAndUpdate(
      { role: 'Admin' },
      { $pull: { locations: location } },
      { new: true },
    );

    return updatedOwner;
  } catch (error) {
    throw new Error(`Error Removing location to owner: ${error.message}`);
  }
}
module.exports = {
  authenticateAdmin,
  getDataForAdminDashboard,
  loginOtpHelper,
  otpGenerateHelper,
  showAdminCarPageHelper,
  addCarAdminHelper,
  carDetails,
  deleteCarHelper,
  updateCarHelper,
  findCarCategoriesHelper,
  viewNotificationPageHelper,
  disableVendorHelper,
  enableVendorHelper,
  BookingPageHelper,
  paymentHelper,
  changCarStatusHelper,
  servicePageHelper,
  addServiceHelper,
  editServiceHelper,
  deleteServiceHelper,
  getBannerHelper,
  addBannerHelper,
  deleteBannerHelper,
  vendorPageHelper,
  vendorDetailsHelper,
  deleteVendorHelper,
  getUserData,
  getUserDetails,
  deleteUserHelper,
  checkPickUp,
  cleanupSoftDeletedData,
  deleteCancelUserHelper,
  deleteUserDataHelper,
  addLocationsHelper,
  removeLocationHelper,
};
