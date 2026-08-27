const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Worker = require('./models/Worker');
const Cooperative = require('./models/Cooperative');
const Booking = require('./models/Booking');
const Service = require('./models/Service');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding');
    } catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();
    
    try {
        console.log('Clearing old data...');
        await User.deleteMany({});
        await Worker.deleteMany({});
        await Cooperative.deleteMany({});
        await Booking.deleteMany({});
        await Service.deleteMany({});
        
        console.log('Creating Admin User...');
        const adminPass = await bcrypt.hash('admin123', 10);
        const adminUser = await User.create({
            name: 'CoopSeva Admin',
            email: 'admin@coopseva.com',
            phone: '9999999999',
            password: adminPass,
            role: 'CooperativeAdmin',
            isVerified: true
        });

        console.log('Creating Cooperative...');
        const coop = await Cooperative.create({
            name: 'Delhi Labour Cooperative Society',
            registrationNumber: 'DL-COOP-2026',
            adminId: adminUser._id,
            address: { city: 'New Delhi', state: 'Delhi' }
        });

        console.log('Creating Services...');
        const services = await Service.insertMany([
            { name: 'Plumbing', category: 'Maintenance', basePrice: 300 },
            { name: 'Electrical', category: 'Maintenance', basePrice: 400 },
            { name: 'Carpentry', category: 'Construction', basePrice: 500 }
        ]);

        console.log('Creating Workers & Users...');
        const workerPass = await bcrypt.hash('worker123', 10);
        const workersToCreate = [];
        const bookingsToCreate = [];

        // Center around Delhi (Lat: 28.6139, Lng: 77.2090)
        for (let i = 1; i <= 15; i++) {
            const user = await User.create({
                name: `Verified Worker ${i}`,
                email: `worker${i}@coopseva.com`,
                phone: `888888880${i}`,
                password: workerPass,
                role: 'Worker',
                isVerified: true,
                address: { city: 'New Delhi', state: 'Delhi' }
            });

            // Random coordinates near Delhi
            const lat = 28.6139 + (Math.random() - 0.5) * 0.1;
            const lng = 77.2090 + (Math.random() - 0.5) * 0.1;

            const worker = await Worker.create({
                user: user._id,
                cooperative: coop._id,
                skills: [services[i % services.length]._id],
                hourlyRate: 300 + (Math.random() * 200),
                isVerified: true,
                verificationStatus: 'Approved',
                availability: { isOnline: true },
                currentLocation: { type: 'Point', coordinates: [lng, lat] }, // MongoDB is [lng, lat]
                rating: { averageScore: 4.5 + (Math.random() * 0.5), totalReviews: Math.floor(Math.random() * 50) + 10 }
            });

            // Create some completed bookings for stats
            for (let b = 0; b < 5; b++) {
                const finalPrice = Math.floor(Math.random() * 1000) + 500;
                bookingsToCreate.push({
                    customer: adminUser._id, // Just using admin as a dummy customer
                    worker: worker._id,
                    service: services[i % services.length]._id,
                    status: 'Completed',
                    scheduledDate: new Date(),
                    priceEstimate: finalPrice,
                    finalPrice: finalPrice,
                    financialBreakdown: {
                        workerEarnings: finalPrice * 0.85,
                        cooperativeShare: finalPrice * 0.10,
                        welfareShare: finalPrice * 0.05
                    },
                    location: { type: 'Point', coordinates: [lng, lat] }
                });
            }
        }

        console.log('Creating Bookings...');
        await Booking.insertMany(bookingsToCreate);

        console.log('Seeding Complete! 🎉');
        console.log('Login with: admin@coopseva.com / admin123');
        console.log('Or worker1@coopseva.com / worker123');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
