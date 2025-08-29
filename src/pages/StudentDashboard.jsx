import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDoc, doc, query, where, getDocs } from "firebase/firestore";

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState({});
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }
        const student = userDoc.data();
        setStudentInfo(student);

        // Fetch only attendance records relevant to the current student
        const q = query(collection(db, "attendance"), where("studentRoll", "==", student.rollNo));
        const attendanceSnap = await getDocs(q);
        
        let present = 0;
        let absent = 0;

        attendanceSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === "present") present++;
          else if (data.status === "absent") absent++;
        });

        setPresentCount(present);
        setAbsentCount(absent);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const total = presentCount + absentCount;
  const percentage = total === 0 ? 0 : Math.round((presentCount / total) * 100);

  return (
    <Dashboard>
      <div className="p-6 space-y-6">
        {/* Top Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Name Box */}
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow p-4 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">👤 Name</h2>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{studentInfo.name || "N/A"}</p>
          </div>
          {/* Roll No Box */}
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow p-4 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:bg-purple-50 dark:hover:bg-purple-900">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">🆔 Roll No</h2>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{studentInfo.rollNo || "N/A"}</p>
          </div>
          {/* Semester Box */}
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow p-4 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:bg-green-50 dark:hover:bg-green-900">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">📚 Semester</h2>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{studentInfo.semester || "N/A"}</p>
          </div>
        </div>
        {/* Attendance Summary */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow p-6 border-l-4 border-green-500 dark:border-green-400 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:bg-green-50 dark:hover:bg-green-900">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">📊 Attendance Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <p className="text-gray-700 dark:text-gray-300">✅ Present: <span className="font-bold text-green-600 dark:text-green-400">{presentCount}</span></p>
            <p className="text-gray-700 dark:text-gray-300">❌ Absent: <span className="font-bold text-red-500 dark:text-red-400">{absentCount}</span></p>
            <p className="text-gray-700 dark:text-gray-300">📅 Total: <span className="font-bold">{total}</span></p>
            <p className="text-gray-700 dark:text-gray-300">📈 Percentage: <span className={`font-bold ${percentage >= 75 ? "text-green-600 dark:text-green-400" : "text-yellow-500 dark:text-yellow-400"}`}>{percentage}%</span></p>
          </div>
        </div>
        {/* Assignments Section */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow p-6 border-l-4 border-yellow-400 dark:border-yellow-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:bg-yellow-50 dark:hover:bg-yellow-900">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">📝 Assignments & Homework</h2>
          <p className="text-gray-600 dark:text-gray-300">View and submit assignments from your teachers.</p>
          <div className="flex justify-end mt-4">
            <a href="/student-Assignments" className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:underline">View All &rarr;</a>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}