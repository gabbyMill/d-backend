import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { seed } from "./dbService";
import amenityRouter from "./routes/amenities";
import cors from "cors";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});
app.get("/seed", (req: Request, res: Response) => {
    seed();
    res.status(201).json({});
});

app.use("/amenities", amenityRouter);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
//   // Cancel a booking
//   app.delete('/api/bookings/:id', (req: Request, res: Response) => {
//     const db = readDb();
//     const bookingId = req.params.id;

//     // Find the booking
//     const booking = db.bookings[bookingId];

//     if (!booking) {
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     // Find the amenity and update the time slot
//     const amenity = db.amenities[booking.amenityId];

//     if (amenity) {
//       const timeSlotIndex = amenity.timeSlots.findIndex(slot => slot.id === booking.timeSlotId);

//       if (timeSlotIndex !== -1) {
//         amenity.timeSlots[timeSlotIndex].isBooked = false;
//       }
//     }

//     // Remove the booking
//     delete db.bookings[bookingId];

//     // Save the changes
//     writeDb(db);

//     res.status(200).json({ message: 'Booking cancelled successfully' });
//   });
