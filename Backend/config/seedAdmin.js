const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Service = require('../models/Service');

const seedAdminAndServices = async () => {
    try {
        // 1. Migrate any legacy roles to SuperAdmin
        await User.updateMany(
            { role: { $in: ['CooperativeAdmin', 'FederationAdmin'] } },
            { role: 'SuperAdmin' }
        );

        // 2. Ensure base services exist
        let allServices = await Service.find();
        if (allServices.length === 0) {
            const defaultServices = [
                { name: 'Electrician', category: 'Electrical', basePrice: 350, description: 'Wiring, fixtures, appliances, and high-voltage repairs' },
                { name: 'Plumber', category: 'Plumbing', basePrice: 300, description: 'Leak repairs, pipe installations, drainage, and bathroom fittings' },
                { name: 'Carpenter', category: 'Carpentry', basePrice: 350, description: 'Furniture making, woodwork repair, doors, and window fitting' },
                { name: 'House Cleaner', category: 'Cleaning', basePrice: 250, description: 'Deep home cleaning, sanitation, and kitchen/bathroom sanitization' },
                { name: 'Painter', category: 'Painting', basePrice: 300, description: 'Interior/exterior wall painting, waterproofing, and touch-ups' },
                { name: 'AC & Appliance Tech', category: 'Appliances', basePrice: 450, description: 'AC servicing, gas refilling, refrigerator, and washing machine repair' },
                { name: 'Driver & Transport', category: 'Transport', basePrice: 300, description: 'Personal chauffeur, parcel delivery, and commercial driving' },
                { name: 'Elder Caregiver', category: 'Caregiving', basePrice: 280, description: 'Compassionate in-home senior assistance, medication reminders, and mobility support' }
            ];
            allServices = await Service.insertMany(defaultServices);
            console.log('✅ Seeded default cooperative services');
        }

        // 3. Ensure default SuperAdmin account exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@coopseva.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            admin = await User.create({
                name: 'CoopSeva SuperAdmin',
                email: adminEmail,
                phone: '9999999999',
                password: hashedPassword,
                role: 'SuperAdmin',
                isVerified: true
            });
            console.log(`✅ Default SuperAdmin created: ${adminEmail} / ${adminPassword}`);
        } else if (admin.role !== 'SuperAdmin') {
            admin.role = 'SuperAdmin';
            await admin.save();
        }

        // 4. Ensure verified dummy worker exists
        const workerEmail = 'worker@coopseva.com';
        const workerPassword = 'worker123';
        let workerUser = await User.findOne({ email: workerEmail });

        const salt = await bcrypt.genSalt(10);
        const hashedWorkerPassword = await bcrypt.hash(workerPassword, salt);

        if (!workerUser) {
            workerUser = await User.create({
                name: 'Rajesh Kumar (Verified Pro)',
                email: workerEmail,
                phone: '9876543210',
                password: hashedWorkerPassword,
                role: 'Worker',
                isVerified: true,
                address: {
                    street: '12 Connaught Place',
                    city: 'New Delhi',
                    state: 'Delhi',
                    zipCode: '110001',
                    country: 'India'
                },
                location: {
                    type: 'Point',
                    coordinates: [77.2167, 28.6328]
                }
            });
            console.log(`✅ Verified Worker User created: ${workerEmail} / ${workerPassword}`);
        } else {
            workerUser.password = hashedWorkerPassword;
            workerUser.role = 'Worker';
            workerUser.isVerified = true;
            if (!workerUser.location || workerUser.location.coordinates[0] === 0) {
                workerUser.location = { type: 'Point', coordinates: [77.2167, 28.6328] };
            }
            await workerUser.save();
        }

        // Get sample skills (e.g. Electrician & Plumber)
        const electricianService = allServices.find(s => s.name.includes('Electrician')) || allServices[0];
        const plumberService = allServices.find(s => s.name.includes('Plumber')) || allServices[1];
        const assignedSkills = [electricianService._id, plumberService._id].filter(Boolean);

        let workerProfile = await Worker.findOne({ user: workerUser._id });
        if (!workerProfile) {
            workerProfile = await Worker.create({
                user: workerUser._id,
                skills: assignedSkills,
                experienceYears: 6,
                hourlyRate: 350,
                serviceRadiusKm: 25,
                verificationStatus: 'Approved',
                isVerified: true,
                kycDocuments: [{
                    documentType: 'Trade Certificate & National ID',
                    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
                    isVerified: true
                }],
                availability: {
                    isOnline: true,
                    workingHours: { start: '08:00', end: '20:00' }
                },
                currentLocation: {
                    type: 'Point',
                    coordinates: [77.2167, 28.6328]
                },
                jobsCompleted: 48,
                rating: {
                    averageScore: 4.9,
                    totalReviews: 36
                }
            });
            console.log(`✅ Verified Worker Profile initialized & set to ONLINE`);
        } else {
            workerProfile.skills = assignedSkills;
            workerProfile.verificationStatus = 'Approved';
            workerProfile.isVerified = true;
            workerProfile.availability = { isOnline: true, workingHours: { start: '08:00', end: '20:00' } };
            if (!workerProfile.kycDocuments || workerProfile.kycDocuments.length === 0) {
                workerProfile.kycDocuments = [{
                    documentType: 'Trade Certificate & National ID',
                    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
                    isVerified: true
                }];
            }
            workerProfile.currentLocation = { type: 'Point', coordinates: [77.2167, 28.6328] };
            await workerProfile.save();
            console.log(`✅ Verified Worker Profile updated & active`);
        }

        // 5. Ensure sample Customer account exists for easy end-to-end testing
        const customerEmail = 'customer@coopseva.com';
        const customerPassword = 'customer123';
        let customerUser = await User.findOne({ email: customerEmail });

        const hashedCustPassword = await bcrypt.hash(customerPassword, salt);
        if (!customerUser) {
            customerUser = await User.create({
                name: 'Priya Sharma',
                email: customerEmail,
                phone: '9123456780',
                password: hashedCustPassword,
                role: 'Customer',
                isVerified: true,
                address: {
                    street: 'Flat 402, Block B, Connaught Place',
                    city: 'New Delhi',
                    state: 'Delhi',
                    zipCode: '110001',
                    country: 'India'
                },
                location: {
                    type: 'Point',
                    coordinates: [77.2167, 28.6328]
                }
            });
            console.log(`✅ Sample Customer created: ${customerEmail} / ${customerPassword}`);
        } else {
            customerUser.password = hashedCustPassword;
            customerUser.role = 'Customer';
            customerUser.isVerified = true;
            if (!customerUser.location || customerUser.location.coordinates[0] === 0) {
                customerUser.location = { type: 'Point', coordinates: [77.2167, 28.6328] };
            }
            await customerUser.save();
        }

    } catch (error) {
        console.error('Error seeding admin, worker, and services:', error);
    }
};

module.exports = seedAdminAndServices;
