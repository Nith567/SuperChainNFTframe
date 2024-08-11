const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Key=require('./models/keys.js')
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const multer = require('multer');
const fs = require('fs');
const mime = require('mime-types');
const axios=require('axios');

require('dotenv').config();
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});


app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}));




const connect = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017");
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log(error);
  }
};

app.get('/api/test', (req,res) => {
  mongoose.connect("mongodb://localhost:27017");
  res.json('test osdfk');
});
app.get('/test', (req,res) => {
  mongoose.connect("mongodb://localhost:27017");
  res.json('test ok');
});


app.post('/api/register', async (req, res) => {
  mongoose.connect("mongodb://localhost:27017");
  const { address } = req.body;

  try {
    // Check if a user with the same address already exists
    if (await User.findOne({ address })) {
      return res.status(400).json({ error: 'User with this address already exists' });
    }

    // Create a new user document with the provided address
    const userDoc = await User.create({
      address,
    });

    res.json(userDoc);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/ship', async (req, res) => {
  mongoose.connect("mongodb://localhost:27017"); // Consider moving this to a global configuration or connection middleware

  try {
    const {
      apiKey,
      collectionAddress,
      chainId,
      imageUrl,
      walletAddress,
      price
    } = req.body;

    // Check if the wallet address of the worldcoinID is verified
    const existingUser = await Key.findOne({ walletAddress });

    if (!existingUser || !existingUser.verified) {
      return res.status(403).json({ message: 'Wallet is not verified. Submission denied.' });
    }

    const newUser = new Key({
      apiKey,
      collectionAddress,
      chainId,
      imageUrl,
      walletAddress,
      price
    });

    await newUser.save();
    console.log("New user:", newUser);

    res.status(200).json({ _id: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/api/ship/:id', async (req, res) => {
  try {
    await mongoose.connect("mongodb://localhost:27017");

    const key = await Key.findById(req.params.id);

    // Check if key exists
    if (!key) {
      return res.status(404).send('Key not found');
    }

    // Sending the key details as response
    res.status(200).json(key);
  } catch (err) {
    // Sending error response
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.post('/api/verify-wallet', async (req, res) => {
  const { walletAddress } = req.body;

  try {
    const keyEntry = await KeyModel.findOne({ walletAddress });
    if (!keyEntry) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    keyEntry.verified = true; // Set the wallet as verified
    await keyEntry.save();

    return res.status(200).json({ message: 'Wallet verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying wallet', error });
  }
});

