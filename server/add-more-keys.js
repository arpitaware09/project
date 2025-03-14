require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    addMoreKeys();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function addMoreKeys() {
  try {
    // Add more keys to AimSlient exe
    const aimSlient = await Product.findOne({ name: 'AimSlient exe' });
    if (aimSlient) {
      aimSlient.availableKeys.push({ key: 'AXIS-sdjkh-1111' });
      aimSlient.availableKeys.push({ key: 'AXIS-sdjkh-2222' });
      aimSlient.availableKeys.push({ key: 'AXIS-sdjkh-3333' });
      await aimSlient.save();
      console.log('Added more keys to AimSlient exe');
    }

    // Add more keys to AimKill
    const aimKill = await Product.findOne({ name: 'AimKill' });
    if (aimKill) {
      aimKill.availableKeys.push({ key: 'AIMK-5678-ABCD' });
      aimKill.availableKeys.push({ key: 'AIMK-5678-EFGH' });
      aimKill.availableKeys.push({ key: 'AIMK-5678-IJKL' });
      await aimKill.save();
      console.log('Added more keys to AimKill');
    }

    // Add more keys to Internal ESP
    const internalESP = await Product.findOne({ name: 'Internal ESP' });
    if (internalESP) {
      internalESP.availableKeys.push({ key: 'AXIS-sdjkh-4444' });
      internalESP.availableKeys.push({ key: 'AXIS-sdjkh-5555' });
      internalESP.availableKeys.push({ key: 'AXIS-sdjkh-6666' });
      await internalESP.save();
      console.log('Added more keys to Internal ESP');
    }

    // Add more keys to Bypass Emulator
    const bypassEmulator = await Product.findOne({ name: 'Bypass Emulator 32-bit,64-bit' });
    if (bypassEmulator) {
      bypassEmulator.availableKeys.push({ key: 'AXIS-sdjkh-7777' });
      bypassEmulator.availableKeys.push({ key: 'AXIS-sdjkh-8888' });
      bypassEmulator.availableKeys.push({ key: 'AXIS-sdjkh-9999' });
      await bypassEmulator.save();
      console.log('Added more keys to Bypass Emulator');
    }

    console.log('All keys added successfully!');
  } catch (error) {
    console.error('Error adding more keys:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 