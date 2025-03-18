import fs from "fs";
import path from "path";

// Data model types
export interface User {
    id: string;
    name: string;
    email: string;
    apartmentNumber: string;
}

export interface TimeSlot {
    id: string;
    startTime: string; // ISO date string
    endTime: string; // ISO date string
    bookedBy: string | null; // User ID or null if not booked
}
// export interface TimeSlot {
//     id: string;
//     startTime: string; // ISO date string
//     endTime: string; // ISO date string
//     isBooked: boolean;
// }

export interface Amenity {
    id: string;
    name: string;
    description: string;
    location: string;
    maxDurationHours: number;
    timeSlots: TimeSlot[];
}

export interface Booking {
    id: string;
    userId: string;
    amenityId: string;
    timeSlotId: string;
    createdAt: string; // ISO date string
    additionalInfo?: string;
}

export interface Database {
    users: { [id: string]: User };
    amenities: { [id: string]: Amenity };
    bookings: { [id: string]: Booking };
}

export const emptyDb: Database = {
    users: {},
    amenities: {},
    bookings: {},
};

// Set the path for the database file
const DB_PATH = path.join(__dirname, "../data/db.json");

// Ensure the data directory exists
export const ensureDbDirectory = (): void => {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

export const readDb = (): Database => {
    ensureDbDirectory();
    try {
        const data = fs.readFileSync(DB_PATH, "utf8");
        return JSON.parse(data) as Database;
    } catch (error) {
        // If file doesn't exist or is invalid, return an empty database
        return emptyDb;
    }
};

export const readKey = <T>(key: keyof Database): T => {
    const db = readDb();
    return db[key] as unknown as T;
};

export const writeDb = (db: Database): void => {
    ensureDbDirectory();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

/**
 * Updates a specific key in the database
 * @param key The database key to update
 * @param value The new value for the key
 */
export const writeKey = <T>(key: keyof Database, value: T): void => {
    const db = readDb();
    db[key] = value as any;
    writeDb(db);
};

// Generate a simple set of time slots for the next few days
export const generateTimeSlots = (
    slotDurationHours: number = 1
): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start at midnight

    // Schedule settings
    const startingHours = [9, 13, 17]; // 9 AM, 1 PM, 5 PM
    const daysToSchedule = 3; // Today + 2 more days

    // Generate slots for the next few days
    for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
        // Create date for current day in loop
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);

        // For each starting hour on this day
        for (const hourOfDay of startingHours) {
            // Set up start time
            const startTime = new Date(currentDate);
            startTime.setHours(hourOfDay, 0, 0, 0);

            // Calculate end time based on duration
            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + slotDurationHours);

            // Format as readable day name for ID
            const dayName = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
                startTime.getDay()
            ];

            // Create the slot
            slots.push({
                id: `slot_${dayName}_${hourOfDay}h`,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                bookedBy: null,
            });
        }
    }

    return slots;
};
// Seed the database with initial data
export const seedDb = (): void => {
    const today = new Date();

    // Create some users
    const users: { [id: string]: User } = {
        "1": {
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            apartmentNumber: "101",
        },
        "2": {
            id: "2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            apartmentNumber: "202",
        },
        "3": {
            id: "3",
            name: "Robert Johnson",
            email: "robert.johnson@example.com",
            apartmentNumber: "303",
        },
        "4": {
            id: "4",
            name: "Lisa Chen",
            email: "lisa.chen@example.com",
            apartmentNumber: "404",
        },
    };

    // Create amenities with time slots
    const amenities: { [id: string]: Amenity } = {
        "1": {
            id: "1",
            name: "Swimming Pool",
            description: "Olympic-sized swimming pool with lounge area",
            location: "Ground Floor",
            maxDurationHours: 2,
            timeSlots: generateTimeSlots(2),
        },
        "2": {
            id: "2",
            name: "Fitness Center",
            description:
                "Fully equipped gym with cardio and weight training equipment",
            location: "Second Floor",
            maxDurationHours: 1,
            timeSlots: generateTimeSlots(1),
        },
        "3": {
            id: "3",
            name: "Conference Room",
            description: "Meeting room with presentation equipment",
            location: "Third Floor",
            maxDurationHours: 3,
            timeSlots: generateTimeSlots(3),
        },
        "4": {
            id: "4",
            name: "Rooftop Lounge",
            description: "Outdoor lounge area with BBQ equipment",
            location: "Rooftop",
            maxDurationHours: 4,
            timeSlots: generateTimeSlots(4),
        },
    };
    // Create some initial bookings
    const bookings: { [id: string]: Booking } = {};

    // Book a few slots to demonstrate
    const poolSlot = amenities["1"].timeSlots[1]; // Booking the 1 PM slot
    if (poolSlot) {
        poolSlot.bookedBy = "1";
        bookings["1"] = {
            id: "1",
            userId: "1",
            amenityId: "1",
            timeSlotId: poolSlot.id,
            createdAt: new Date().toISOString(),
            additionalInfo: "Swimming party with family",
        };
    }

    const gymSlot = amenities["2"].timeSlots[2]; // Booking the 5 PM slot
    if (gymSlot) {
        poolSlot.bookedBy = "2";
        bookings["2"] = {
            id: "2",
            userId: "2",
            amenityId: "2",
            timeSlotId: gymSlot.id,
            createdAt: new Date().toISOString(),
            additionalInfo: "Personal training session",
        };
    }

    // Write the seeded data to the database file
    const db: Database = { users, amenities, bookings };
    writeDb(db);
    console.log("Database has been seeded with initial data");
};

// Clear the database
export const clearDb = (): void => {
    writeDb(emptyDb);
    console.log("Database has been cleared");
};

// If this script is run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case "seed":
            seedDb();
            break;
        case "clear":
            clearDb();
            break;
        default:
            console.log("Usage: node db.js [seed|clear]");
    }
}
