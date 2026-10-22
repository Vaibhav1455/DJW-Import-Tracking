# DJW Import Tracking

Internal dashboard for import cargo lots, sales bookings, and live available-to-sell stock.

## Stock formula

`Available-to-sell MT = Total initial inward MT − Total committed MT − Total lifted MT`

- **Committed** = quantity booked on sales with status `Order Confirmed` or `Loaded at CFS`
- **Lifted** = actual loaded weight (or booked qty if weighment is missing) on sales with status `Lifted`
- Creating or confirming a booking immediately reduces available-to-sell and increases committed
- Overbooking a lot is blocked

## Invoice formula

`Final invoice amount = Agreed rate (INR/MT) × Actual loaded weight MT`

If loaded weight is not yet entered, booked quantity is used as a live estimate.

## Run locally

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). SQLite file: `prisma/dev.db`.
