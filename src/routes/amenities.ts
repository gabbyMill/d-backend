import express, { Express, Request, Response } from "express";

import { ParsedQs } from "qs";
import { Amenity, Booking, readKey, TimeSlot, User, writeKey } from "../db";

const router = express.Router();

// Amenity routes, separate to route file
router.get("/", (req: Request, res: Response<Amenity[]>) => {
    console.log("getting all amenities");
    const amenities = readKey<Amenity[]>("amenities");
    res.json(Object.values(amenities));
    // TODO consider adding support for optional param to add
    // time slots and by default return amenities without time slots
});

router.get(
    "/:id",
    (req: Request, res: Response<Amenity | { error: string }>) => {
        console.log("getting amenity by id");
        const id = Number(req.params?.id);
        if (isNaN(id)) {
            res.status(400).json({
                error: "Amenity ID should be a valid number",
            });
        }
        const allAmenities = readKey<Amenity[]>("amenities");
        const amenity = allAmenities[id];
        if (!amenity) {
            res.status(404).json({ error: "Amenity not found" });
        }
        // Consider filtering out time slots that are already booked // TODO
        res.json(amenity);
    }
);

router.post("/:id", (req: Request, res: any) => {
    const users = readKey<User[]>("users");
    const amenities = readKey<Amenity[]>("amenities");
    const amenityId = Number(req.params?.id);
    const { userId, timeSlotId } = req.body;
    if (!userId || !amenityId || !timeSlotId) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    if (!users[userId]) {
        return res.status(404).json({ error: "User not found" });
    }
    if (!amenities[amenityId]) {
        return res.status(404).json({ error: "Amenity not found" });
    }
    const timeSlotIndex = amenities[amenityId].timeSlots.findIndex(
        (slot) => slot.id === timeSlotId
    );
    if (timeSlotIndex === -1) {
        return res.status(404).json({ error: "Time slot not found" });
    }
    // Check if the time slot is already booked
    const bookedUserId = amenities[amenityId].timeSlots[timeSlotIndex].bookedBy;
    if (bookedUserId) {
        if (bookedUserId === userId) {
            return res
                .status(404)
                .json({ error: "Time slot is already booked" });
        }
        return res
            .status(409)
            .json({ error: "Another member has already booked this slot" });
    }
    amenities[amenityId].timeSlots[timeSlotIndex].bookedBy = userId;
    writeKey("amenities", amenities);
    res.status(201).json(amenities[amenityId].timeSlots[timeSlotIndex]);
});

/*
    Bonus, if we wish to show user a list of his bookings
    const bookingId = uuidv4();
    const newBooking: Booking = {
        id: bookingId,
        userId,
        amenityId,
        timeSlotId,
        createdAt: new Date().toISOString(),
        additionalInfo,
        const bookings = readKey('bookings')
        bookings[bookingId] = newBooking;
    };
    */

// Update the time slot to booked

export default router;
