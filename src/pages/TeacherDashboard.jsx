import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export default function TeacherDashboard() {
  const [stats, setStats] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [remindersData, setRemindersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();

        // 1. Fetch counts for stats cards
        const studentQuery = query(collection(db, "users"), where("role", "==", "student"));
        const studentsSnapshot = await getDocs(studentQuery);
        const studentCount = studentsSnapshot.size;

        const assignmentsSnapshot = await getDocs(collection(db, "assignments"));
        const assignmentCount = assignmentsSnapshot.size;

        const notesSnapshot = await getDocs(collection(db, "classNotes"));
        const notesCount = notesSnapshot.size;

        const remindersSnapshot = await getDocs(collection(db, "reminders"));
        const remindersCount = remindersSnapshot.size;

        // 2. Fetch latest attendance record
        const attendanceQuery = query(
          collection(db, "attendance"),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);

        const recentAttendance = [];
        attendanceSnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();
          if (data.records) {
            data.records.forEach((record) => {
              recentAttendance.push({
                name: record.studentName,
                rollNo: record.rollNo,
                status: record.status,
                time: createdAt?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                date: `${String(createdAt?.getDate()).padStart(2, "0")}/${String(
                  createdAt?.getMonth() + 1
                ).padStart(2, "0")}/${createdAt?.getFullYear()}`,
              });
            });
          }
        });

        // 3. Fetch latest reminders
        const remindersQuery = query(
          collection(db, "reminders"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const remindersSnapshot2 = await getDocs(remindersQuery);
        const recentReminders = remindersSnapshot2.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));

        // 4. Update state with dynamic data
        setStats([
          { title: "Number of Students", value: studentCount, icon: "👥", link: "/Manage-Students" },
          { title: "Assignments Posted", value: assignmentCount, icon: "📝", link: "/Manage-Assignments" },
          { title: "Notes Uploaded", value: notesCount, icon: "📚", link: "/Manage-UploadNotes" },
          { title: "Reminders Sent", value: remindersCount, icon: "📢", link: "/SendReminder" },
        ]);
        setAttendanceData(recentAttendance);
        setRemindersData(recentReminders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Dashboard>
      <div className="p-6">
        {/* 🔝 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-3xl">{stat.icon}</span>
                  <h3 className="text-2xl font-bold mt-2 dark:text-white">
                    {loading ? "..." : stat.value}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{stat.title}</p>
                </div>
                <Link to={stat.link} className="text-purple-500 hover:text-purple-700 font-semibold text-sm">
                  View All &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 📋 Most Recent Attendance Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
              🕒 Most Recent Attendance
            </h2>
            {attendanceData.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No attendance records available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b dark:border-slate-700">
                      <th className="pb-3 dark:text-white">Name</th>
                      <th className="pb-3 dark:text-white">Roll No.</th>
                      <th className="pb-3 dark:text-white">Status</th>
                      <th className="pb-3 dark:text-white">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((student, index) => (
                      <tr
                        key={index}
                        className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <td className="py-3 dark:text-white">{student.name}</td>
                        <td className="py-3 dark:text-white font-mono">
                          {String(student.rollNo).padStart(4, "0")}
                        </td>
                        <td className="py-3">
                          <span
                            className={
                              student.status === "present"
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {student.status === "present" ? "✅ Present" : "❌ Absent"}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{student.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 📢 Recent Reminders Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
              📢 Recent Reminders
            </h2>
            {remindersData.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No reminders sent yet.
              </div>
            ) : (
              <ul className="space-y-4">
                {remindersData.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg shadow-sm"
                  >
                    <p className="text-gray-800 dark:text-white">{reminder.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {reminder.createdAt?.toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Dashboard>
  );
}