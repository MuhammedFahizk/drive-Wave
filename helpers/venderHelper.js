const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongoose').Types;
const { User } = require('../models/users');
const { admin } = require('../models/owners');
const { Car } = require('../models/car');
const cloudinary = require('../service/cloudnery');
const { sendAdminOtp, generateOtp } = require('../service/nodeMailer');
const vendorService = require('../service/vendorService');

const emailOtp = {};
async function authenticateVendor(email, password) {
  try {
    const vendor = await admin.findOne({ role: 'Vendor', email, password });

    if (!vendor) {
      return { success: false, error: 'Enter Valid Email And Password' };
    }

    if (!vendor.vendorAccessEnabled) {
      return { success: false, error: 'Admin does not have permission to enable the vendor' };
    }

    return { success: true, vendorId: uuidv4(), ownerId: vendor._id };
  } catch (error) {
    throw new Error(`Error authenticating vendor: ${error.message}`);
  }
}
async function getUserData(ownerId) {
  try {
    const usersWithBookings = await User.aggregate([
      {
        $unwind: '$bookedCar',
      },
      {
        $lookup: {
          from: 'cars',
          localField: 'bookedCar.car',
          foreignField: '_id',
          as: 'carDetails',
        },
      },
      {
        $unwind: '$carDetails', // Deconstruct carDetails array
      },
      {
        $match: {
          'carDetails.ownerId': new ObjectId(ownerId),
        },
      },
      {
        $project: {
          // Project all fields from the user document
          user: '$$ROOT',
          carDetails: '$carDetails',
          bookingDetails: '$bookedCar',
        },
      },
    ]);

    return usersWithBookings;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Internal server error');
  }
}
async function getDataForAdminDashboard(ownerId) {
  try {
    const customersPromise = (await getUserData(ownerId)).length;
    const dailyRentsPromise = vendorService.dailyRents();
    const dailyRentalAmountPromise = vendorService.dailyRentalAmounts(ownerId);
    const dailyRentalPendingPromise = vendorService.dailyRentalAmountPending(ownerId);
    const confirmAmount = await vendorService.confirmAmount(ownerId);
    const pendingAmount = await vendorService.pendingAmount(ownerId);
    const VenderPromise = admin.findById(ownerId);
    const [
      customers,
      dailyRents,
      dailyRentalAmount,
      dailyRentalPending,
      vendor,
    ] = await Promise.all([
      customersPromise,
      dailyRentsPromise,
      dailyRentalAmountPromise,
      dailyRentalPendingPromise,
      VenderPromise,
    ]);
    const locations = vendor.locations.map((locationParts) => locationParts.replace(/\s+/g, '-'));
    return {
      dailyRents,
      dailyRentalAmount,
      dailyRentalPending,
      confirmAmount,
      pendingAmount,
      customers,
      locations,
    };
  } catch (error) {
    throw new Error('Error fetching data for Vender dashboard: ', error);
  }
}
function generateAndSendOtp(email) {
  return new Promise((resolve, reject) => {
    const otp = generateOtp();
    emailOtp[email] = otp;
    sendAdminOtp(email, otp)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function validateOtp(otp, email) {
  return new Promise((resolve, reject) => {
    if (emailOtp[email] && emailOtp[email] === otp) {
      const vendor = admin.find({ email });
      if (vendor) {
        delete emailOtp[email];
        resolve(vendor);
      } else {
        reject(new Error('Vendor not found'));
      }
    } else {
      reject(new Error('Invalid OTP'));
    }
  });
}
async function createVendor(userData) {
  try {
    const { email } = userData;
    const existingVendor = await admin.findOne({ email });
    if (existingVendor) {
      throw new Error('Email address is already in use');
    }
    // eslint-disable-next-line new-cap
    const newVendor = new admin(userData);
    newVendor.role = 'Vendor';
    newVendor.vendorAccessEnabled = false;
    await newVendor.save();
  } catch (error) {
    throw new Error(`Error creating Vendor: ${error.message}`);
  }
}
async function getVendorCars(ownerId) {
  try {
    const cars = await Car.find({ ownerId });
    const vendor = await admin.findById(ownerId);
    const locations = vendor.locations.map((locationParts) => locationParts.replace(/\s+/g, '-'));
    const count = await Car.countDocuments({ ownerId });

    return {
      cars, count, vendor, locations,
    };
  } catch (error) {
    throw new Error(`Error fetching vendor cars: ${error.message}`);
  }
}
async function createCar(carData, ownerId, imagePath) {
  try {
    const {
      carName, carCategory, year, brand, dayRent, brandName, carModal,
      licensePlateNumber, color, location, fuelType, TransmitionType,
      milage, luggage, seats, insurenceDate, features, description,
    } = carData;

    const spaceLocation = location.replace(/-/g, ' ');

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
      location: spaceLocation,
      fuelType,
      TransmitionType,
      milage,
      luggage,
      seats,
      insurenceDate,
      features,
      description,
      ownerId,
      carImage: imagePath,
    });

    await newCar.save();
    return newCar;
  } catch (error) {
    throw new Error(`Error creating car: ${error.message}`);
  }
}
async function updateCarById(editCarId, updateValues) {
  try {
    if (!editCarId) {
      throw new Error('Could not get car Id');
    }
    if (updateValues.location !== undefined) {
      // eslint-disable-next-line no-param-reassign
      updateValues.location = updateValues.location.replace(/-/g, ' ');
    }

    const updatedCar = await Car.findByIdAndUpdate(
      editCarId,
      { $set: updateValues },
      { new: true },
    );

    if (!updatedCar) {
      throw new Error('Car not found');
    }

    return updatedCar;
  } catch (error) {
    throw new Error(`Server Error: ${error.message}`);
  }
}
async function getCarById(carId) {
  try {
    const carDetails = await Car.findById(carId);
    return carDetails;
  } catch (error) {
    throw new Error(`Error fetching car details: ${error.message}`);
  }
}
async function deleteCarHelper(deleteId) {
  try {
    if (!deleteId) {
      throw new Error('Missing deleteCarId parameter');
    }

    const car = await Car.findById(deleteId);
    if (!car) {
      throw new Error('Car not found');
    }
    const publicIdToDelete = car.imageId;

    await Car.findByIdAndDelete(deleteId);
    await cloudinary.deleteImage(publicIdToDelete);

    return { success: true, message: 'Car deleted successfully' };
  } catch (error) {
    console.error('Error deleting car:', error);
    throw new Error('Server Error');
  }
}
function notificationPageHelper(ownerId) {
  return new Promise((resolve, reject) => {
    const vendor = admin.findById(ownerId).populate('notifications');
    if (!vendor) {
      reject();
    }
    resolve(vendor);
  });
}

async function venderRecoveryMessageHelper(data, ownerId) {
  try {
    // Find the admin with the role 'Admin'
    const adminDoc = await admin.findOne({ role: 'Admin' });

    if (!adminDoc) {
      throw new Error('Admin not found');
    }

    // Update the notifications field of the admin document
    adminDoc.notifications.push({
      venderId: ownerId,
      message: data.message,
      sender: data.sender,
      notificationsId: data._id,
      createdAt: new Date(),
    });

    // Save the updated admin document
    await adminDoc.save();

    return { success: true, message: 'Recovery message sent successfully' };
  } catch (error) {
    console.error('Error sending recovery message:', error);
    throw new Error('An error occurred while processing the recovery message');
  }
}
async function getBookingPageData(ownerId) {
  try {
    const pipeline = [
      {
        $unwind: '$bookedCar', // Flatten the bookedCar array
      },
      {
        $lookup: {
          from: 'cars', // Name of the Car collection
          localField: 'bookedCar.car',
          foreignField: '_id',
          as: 'carDetails',
        },
      },
      {
        $match: {
          $or: [
            { 'carDetails.ownerId': ownerId },
            { 'bookedCar.car': null }, // Add condition to handle null car references
          ],
        },
      },
      {
        $project: {
          userId: '$_id',
          userName: '$name',
          bookingDetails: {
            bookingDate: { $dateToString: { format: '%Y-%m-%d', date: '$bookedCar.bookingDate', timezone: 'UTC' } },
            pickupDate: { $dateToString: { format: '%Y-%m-%d', date: '$bookedCar.pickupDate', timezone: 'UTC' } },
            returnDate: { $dateToString: { format: '%Y-%m-%d', date: '$bookedCar.returnDate', timezone: 'UTC' } },
            totalDays: {
              $ceil: {
                $divide: [
                  { $subtract: ['$bookedCar.returnDate', '$bookedCar.pickupDate'] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
            totalPrice: '$bookedCar.totalPrice',
            status: '$bookedCar.status',
            _id: '$bookedCar._id',
            carStatus: '$bookedCar.carStatus',
          },
          car: '$bookedCar.car',
        },
      },
    ];

    const allBookings = await User.aggregate(pipeline);

    const bookingsCount = allBookings.length;
    const confirmedBookingsCount = allBookings.filter((booking) => booking.bookingDetails.status === 'Confirmed').length;
    const pendingBookingsCount = allBookings.filter((booking) => booking.bookingDetails.status === 'Pending').length;

    return {
      allBookings,
      bookingsCount,
      pendingBookingsCount,
      confirmedBookingsCount,
    };
  } catch (error) {
    console.error('Error fetching booking page data:', error);
    throw new Error('Internal server error');
  }
}
async function updateCarStatus(bookingId) {
  const users = await User.find({}).populate('bookedCar.car');

  await Promise.all(users.map(async (user) => {
    await Promise.all(user.bookedCar.map(async (booking) => {
      if (booking._id.toString() === bookingId) {
        const { status } = booking;

        if (status === 'Not Picked') {
          // eslint-disable-next-line no-param-reassign
          booking.status = 'In Progress';
        } else if (status === 'Overdue') {
          // eslint-disable-next-line no-param-reassign
          booking.status = 'Completed';
        }

        await user.save();
      }
    }));
  }));
}

async function getServiceData(ownerId) {
  try {
    const updatedAdmin = await admin.findById(ownerId);
    const { service } = updatedAdmin;
    return service;
  } catch (error) {
    console.error('Error fetching service data:', error);
    throw new Error('Internal server error');
  }
}
async function addServiceData(serviceName, charge, description, image, imageId, ownerId) {
  try {
    const vendor = await admin.findById(ownerId);

    if (!vendor) {
      throw new Error('Admin not found');
    }

    const newService = {
      serviceName,
      charge,
      image,
      imageId,
      description,
    };

    vendor.service.push(newService);
    await vendor.save();

    return vendor.service;
  } catch (error) {
    console.error('Error adding service:', error);
    throw new Error('Internal server error');
  }
}
async function editServiceData(serviceName, charge, description, id, file, ownerId) {
  try {
    const vendor = await admin.findById(ownerId);
    const serviceIndex = vendor.service.findIndex((service) => service._id.toString() === id);

    if (serviceIndex === -1) {
      throw new Error('Service not found');
    }

    const updateObject = {
      $set: {
        [`service.${serviceIndex}.serviceName`]: serviceName,
        [`service.${serviceIndex}.charge`]: charge,
        [`service.${serviceIndex}.description`]: description,
      },
    };

    if (file) {
      const publicIdToDelete = vendor.service[serviceIndex].imageId;
      if (publicIdToDelete) {
        await cloudinary.deleteImage(publicIdToDelete);
      }
      updateObject.$set[`service.${serviceIndex}.image`] = file.url;
      updateObject.$set[`service.${serviceIndex}.imageId`] = file.id;
    }

    const result = await admin.updateOne({ _id: ownerId }, updateObject);

    if (result.nModified === 0) {
      throw new Error('Service not found or not updated');
    }

    const updatedAdmin = await admin.findById(ownerId);
    const { service } = updatedAdmin;
    return service;
  } catch (error) {
    console.error('Error editing service:', error);
    throw new Error('Internal server error');
  }
}
async function deleteServiceData(id, ownerId) {
  try {
    const foundVendor = await admin.findOne({ _id: ownerId });

    if (!foundVendor) {
      throw new Error('Vendor or service not found');
    }

    // Delete the image associated with the service from Cloudinary
    const serviceToDelete = foundVendor.service.find((service) => service._id.toString() === id);
    if (serviceToDelete && serviceToDelete.imageId) {
      await cloudinary.deleteImage(serviceToDelete.imageId);
    }

    // Remove the service from the admin's service array
    foundVendor.service = foundVendor.service.filter((service) => service._id.toString() !== id);

    // Save the updated admin document
    await foundVendor.save();

    return foundVendor.service;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw new Error('Internal server error');
  }
}

async function getCustomers(ownerId) {
  try {
    return await vendorService.customers(ownerId);
  } catch (error) {
    throw new Error(`Error fetching customers: ${error.message}`);
  }
}
function getDailyRents() {
  return vendorService.dailyRents();
}

// Helper function to calculate total rental amount
async function getTotalRentalAmount(ownerId) {
  try {
    const dailyRentalAmount = await vendorService.dailyRentalAmounts(ownerId);
    const conformedAmount = dailyRentalAmount
      .reduce((total, current) => total + current.totalRentalAmount, 0);
    return { conformedAmount, dailyRentalAmount };
  } catch (error) {
    throw new Error(`Error calculating total rental amount: ${error.message}`);
  }
}

// Helper function to calculate total pending amount
async function getTotalPendingAmount(ownerId) {
  try {
    const dailyRentalPending = await vendorService.dailyRentalAmountPending(ownerId);
    const pendingAmount = dailyRentalPending
      .reduce((total, current) => total + current.totalRentalAmount, 0);
    return { pendingAmount, dailyRentalPending };
  } catch (error) {
    throw new Error(`Error calculating total Pending amount: ${error.message}`);
  }
}

// Helper function to render payment page data
async function renderPaymentPage(ownerId) {
  try {
    const customers = await getCustomers(ownerId);
    const dailyRents = getDailyRents();
    const { conformedAmount } = await getTotalRentalAmount(ownerId);
    const { dailyRentalAmount } = await getTotalRentalAmount(ownerId);
    const { pendingAmount } = await getTotalPendingAmount(ownerId);
    const { dailyRentalPending } = await getTotalPendingAmount(ownerId);

    const customersCount = customers.length;

    return {
      customers,
      dailyRents,
      conformedAmount,
      dailyRentalAmount,
      customersCount,
      dailyRentalPending,
      pendingAmount,
    };
  } catch (error) {
    throw new Error(`Error rendering payment page: ${error.message}`);
  }
}
async function addLocationsHelper(ownerId, newLocation) {
  try {
    const updatedOwner = await admin.findByIdAndUpdate(ownerId, {
      $addToSet: { locations: newLocation },
    }, { new: true });

    return updatedOwner;
  } catch (error) {
    throw new Error(`Error adding location to owner: ${error.message}`);
  }
}
async function removeLocationHelper(location, ownerId) {
  try {
    const updatedOwner = await admin.findByIdAndUpdate(
      ownerId,
      { $pull: { locations: location } },
      { new: true },
    );

    return updatedOwner;
  } catch (error) {
    throw new Error(`Error Removing location to owner: ${error.message}`);
  }
}
module.exports = {
  authenticateVendor,
  getDataForAdminDashboard,
  generateAndSendOtp,
  validateOtp,
  createVendor,
  getVendorCars,
  createCar,
  updateCarById,
  getCarById,
  deleteCarHelper,
  notificationPageHelper,
  venderRecoveryMessageHelper,
  getBookingPageData,
  updateCarStatus,
  getServiceData,
  addServiceData,
  editServiceData,
  deleteServiceData,
  getUserData,
  renderPaymentPage,
  addLocationsHelper,
  removeLocationHelper,
};
