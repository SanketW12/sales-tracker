// import {
//   collection,
//   addDoc,
//   query,
//   where,
//   getDocs,
//   orderBy,
//   Timestamp,
// } from "firebase/firestore";
// import { db } from "../firebase/config";
// import { SalesRecord } from "../types/sales";

// const COLLECTION_NAME = "daily_sales";

// // Sample data for demonstration
// const generateSampleData = (): Omit<SalesRecord, "id" | "createdAt">[] => {
//   const data = [];
//   const today = new Date();

//   // Generate data for last 30 days
//   for (let i = 0; i < 30; i++) {
//     const date = new Date(today);
//     date.setDate(date.getDate() - i);

//     // Generate random sales amounts with some realistic patterns
//     const baseCash = Math.floor(Math.random() * 15000) + 5000; // 5k to 20k
//     const baseOnline = Math.floor(Math.random() * 12000) + 3000; // 3k to 15k

//     // Weekend boost (Saturday = 6, Sunday = 0)
//     const dayOfWeek = date.getDay();
//     const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;

//     const cashAmount = Math.floor(baseCash * weekendMultiplier);
//     const onlineAmount = Math.floor(baseOnline * weekendMultiplier);

//     const notes =
//       Math.random() > 0.7
//         ? [
//             "Good day with high footfall",
//             "Festival season boost",
//             "New product launch",
//             "Promotional discount day",
//             "Regular business day",
//             "Slow day due to weather",
//           ][Math.floor(Math.random() * 6)]
//         : null;

//     data.push({
//       date: date.toISOString().split("T")[0],
//       cashAmount,
//       onlineAmount,
//       notes,
//     });
//   }

//   return data.reverse(); // Oldest first
// };

// export const salesService = {
//   // Initialize sample data (call this once to populate the database)
//   async initializeSampleData(): Promise<void> {
//     try {
//       const sampleData = generateSampleData();

//       for (const record of sampleData) {
//         // Check if record already exists
//         const existing = await this.getSalesRecordByDate(record.date);
//         if (!existing) {
//           await addDoc(collection(db, COLLECTION_NAME), {
//             ...record,
//             createdAt: Timestamp.now(),
//           });
//         }
//       }

//       console.log("Sample data initialized successfully");
//     } catch (error) {
//       console.error("Error initializing sample data:", error);
//     }
//   },

//   // Add a new sales record
//   async addSalesRecord(
//     record: Omit<SalesRecord, "id" | "createdAt">
//   ): Promise<string> {
//     try {
//       // Check if record already exists for this date
//       const existingRecord = await this.getSalesRecordByDate(record.date);
//       if (existingRecord) {
//         throw new Error("Sales record already exists for this date");
//       }

//       const docRef = await addDoc(collection(db, COLLECTION_NAME), {
//         ...record,
//         createdAt: Timestamp.now(),
//       });

//       return docRef.id;
//     } catch (error) {
//       console.error("Error adding sales record:", error);
//       throw error;
//     }
//   },

//   // Get sales record by date
//   async getSalesRecordByDate(date: string): Promise<SalesRecord | null> {
//     try {
//       const q = query(
//         collection(db, COLLECTION_NAME),
//         where("date", "==", date)
//       );

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const doc = querySnapshot.docs[0];
//         return {
//           id: doc.id,
//           ...doc.data(),
//           createdAt: doc.data().createdAt.toDate(),
//         } as SalesRecord;
//       }

//       return null;
//     } catch (error) {
//       console.error("Error getting sales record by date:", error);
//       throw error;
//     }
//   },

//   // Get sales records for a date range
//   async getSalesRecords(
//     startDate: string,
//     endDate: string
//   ): Promise<SalesRecord[]> {
//     try {
//       const q = query(
//         collection(db, COLLECTION_NAME),
//         where("date", ">=", startDate),
//         where("date", "<=", endDate),
//         orderBy("date", "desc")
//       );

//       const querySnapshot = await getDocs(q);

//       return querySnapshot.docs.map(
//         (doc) =>
//           ({
//             id: doc.id,
//             ...doc.data(),
//             createdAt: doc.data().createdAt.toDate(),
//           } as SalesRecord)
//       );
//     } catch (error) {
//       console.error("Error getting sales records:", error);
//       throw error;
//     }
//   },

//   // Get all sales records
//   async getAllSalesRecords(): Promise<SalesRecord[]> {
//     try {
//       const q = query(collection(db, COLLECTION_NAME), orderBy("date", "desc"));

//       const querySnapshot = await getDocs(q);

//       return querySnapshot.docs.map(
//         (doc) =>
//           ({
//             id: doc.id,
//             ...doc.data(),
//             createdAt: doc.data().createdAt.toDate(),
//           } as SalesRecord)
//       );
//     } catch (error) {
//       console.error("Error getting all sales records:", error);
//       throw error;
//     }
//   },
// };
