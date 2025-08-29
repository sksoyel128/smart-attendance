import React, { useEffect, useState } from "react"; 
import Dashboard from "./Dashboard";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { format, subDays } from "date-fns";

const NUM_WEEKS = 30;
const DAYS_PER_WEEK = 7;
const NUM_DAYS = NUM_WEEKS * DAYS_PER_WEEK;

const generateEmptyData = () => {
  const today = new Date();
  return Array.from({ length: NUM_DAYS }).map((_, i) => ({
    date: format(subDays(today, NUM_DAYS - i - 1), "yyyy-MM-dd"),
    status: "none",
  }));
};

const getColor = (status) => {
  switch (status.toLowerCase()) {
    case "present":
      return "bg-[#4CAF50] hover:bg-[#81C784] text-white border-2 border-green-600 shadow-md";
    case "absent":
      return "bg-[#EF5350] hover:bg-[#E57373] text-white border-2 border-red-600 shadow-md";
    default:
      return "bg-gray-300 dark:bg-gray-700 hover:opacity-80 border border-gray-500 shadow-sm";
  }
};

export default function Attendance_Student() {
  const [attendanceData, setAttendanceData] = useState(generateEmptyData());
  const [stats, setStats] = useState({ present: 0, absent: 0, streak: 0 });
  const [monthLabels, setMonthLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();

        const userDoc = await getDocs(collection(db, "users"));
        const student = userDoc.docs.find(doc => doc.id === user.uid)?.data();
        if (!student) return;

        const attendanceSnap = await getDocs(collection(db, "attendance"));
        const updatedData = generateEmptyData();
        let counts = { present: 0, absent: 0 };

        attendanceSnap.forEach(doc => {
          const { date, records = [] } = doc.data();
          const formattedDate = format(new Date(date), "yyyy-MM-dd");

          records.forEach(record => {
            if (record.rollNo?.toString() === student.rollNo?.toString()) {
              const dateIndex = updatedData.findIndex(d => d.date === formattedDate);
              if (dateIndex !== -1) {
                const status = record.status.toLowerCase();
                updatedData[dateIndex].status = status;
                if (status === "present") counts.present++;
                else if (status === "absent") counts.absent++;
              }
            }
          });
        });

        setAttendanceData(updatedData);
        setStats(prev => ({ ...prev, ...counts }));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  useEffect(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    attendanceData.forEach(day => {
      currentStreak = day.status === "present" ? currentStreak + 1 : 0;
      maxStreak = Math.max(maxStreak, currentStreak);
    });
    setStats(prev => ({ ...prev, streak: maxStreak }));
  }, [attendanceData]);

  useEffect(() => {
    const labels = [];
    let lastMonth = null;
    attendanceData.forEach((day, index) => {
      if (index % 7 === 0) {
        const date = new Date(day.date);
        const month = format(date, "MMM");
        if (month !== lastMonth) {
          labels.push({
            weekIndex: Math.floor(index / 7),
            label: format(date, "MMM yyyy"),
          });
          lastMonth = month;
        }
      }
    });
    setMonthLabels(labels);
  }, [attendanceData]);

  return (
    <Dashboard>
      <div className="p-6 text-gray-900 dark:text-white max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="stats-card bg-gradient-to-br from-green-100 to-green-200 dark:from-green-700 dark:to-green-800">
            <h3>✅ Present Days</h3>
            <p className="text-green-800 dark:text-green-200">{stats.present}</p>
          </div>
          <div className="stats-card bg-gradient-to-br from-red-100 to-red-200 dark:from-red-700 dark:to-red-800">
            <h3>❌ Absent Days</h3>
            <p className="text-red-800 dark:text-red-200">{stats.absent}</p>
          </div>
          <div className="stats-card bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-700 dark:to-blue-800">
            <h3>🔥 Current Streak</h3>
            <p className="text-blue-800 dark:text-blue-200">{stats.streak}</p>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="relative">
            <div className="flex gap-4 mb-2 ml-9">
              {monthLabels.map(({ label }) => (
                <div key={label} className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {label}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              {attendanceData.map((day, index) => (
                <div
                  key={day.date}
                  className={`w-7 h-7 rounded-md transition-all duration-200 cursor-pointer ${getColor(day.status)}`}
                  title={`${day.date}: ${day.status.charAt(0).toUpperCase() + day.status.slice(1)}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#4CAF50]" />
            <span className="text-gray-700 dark:text-green-300 font-medium">✅ Present</span>
            </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#EF5350]" />
            <span className="dark:text-gray-400">❌ Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-gray-300 dark:bg-gray-700" />
            <span className="dark:text-gray-400">📄 No Data</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-card {
          flex: 1 1 160px;
          padding: 1rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s ease-in-out, background 0.3s;
        }
        .stats-card:hover {
          transform: translateY(-4px);
        }
        .stats-card h3 {
          font-size: 0.875rem;
          color: #6B7280;
          margin-bottom: 0.5rem;
        }
        .stats-card p {
          font-size: 1.75rem;
          font-weight: 700;
        }
      `}</style>
    </Dashboard>
  );
}