import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../config/firebase';
import Dashboard from './Dashboard';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const db = getFirestore();
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        const studentsData = [];

        const rawStudents = snapshot.docs
          .filter(docSnap => docSnap.data().role === 'student')
          .map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));

        // ✅ Sort by registration time (oldest to newest)
        rawStudents.sort((a, b) =>
          (a.createdAt?.toDate?.() ?? new Date(0)) - (b.createdAt?.toDate?.() ?? new Date(0))
        );

        let rollCounter = 1;

        for (const student of rawStudents) {
          const newRoll = String(rollCounter).padStart(4, '0');
          const userRef = doc(db, 'users', student.id);

          await setDoc(userRef, { rollNo: newRoll }, { merge: true });

          studentsData.push({
            id: student.id,
            name: student.name,
            rollNo: newRoll,
            email: student.email
          });

          rollCounter++;
        }

        setStudents(studentsData);
        initializeAttendance(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    checkIfAttendanceExists();
  }, [date]);

  const checkIfAttendanceExists = async () => {
    const db = getFirestore();
    const attendanceRef = collection(db, 'attendance');
    const q = query(attendanceRef, where('date', '==', date), where('teacherId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    setIsSubmitted(!snapshot.empty);
  };

  const initializeAttendance = (students) => {
    const initialAttendance = {};
    students.forEach(student => {
      initialAttendance[student.id] = {
        status: 'present',
        rollNo: student.rollNo
      };
    });
    setAttendance(initialAttendance);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const submitAttendance = async () => {
    try {
      const db = getFirestore();
      const attendanceRef = doc(collection(db, 'attendance'));

      const attendanceRecords = Object.entries(attendance).map(([studentId, data]) => ({
        studentId,
        ...data,
        studentName: students.find(s => s.id === studentId)?.name || 'Unknown',
        studentEmail: students.find(s => s.id === studentId)?.email || ''
      }));

      await setDoc(attendanceRef, {
        date,
        records: attendanceRecords,
        teacherId: auth.currentUser.uid,
        createdAt: Timestamp.now()
      });

      alert('✅ Attendance submitted successfully!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('❌ Failed to submit attendance');
    }
  };

  return (
    <Dashboard>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">🎯 Student Attendance Management</h1>

        <div className="mb-4 flex items-center gap-4">
          <label className="block text-gray-700 dark:text-gray-300">
            📅 Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="ml-2 p-2 border rounded dark:bg-slate-800"
              min={today}
              max={today}
              disabled
            />
          </label>
          <button
            onClick={submitAttendance}
            disabled={isSubmitted}
            className={`px-6 py-2 rounded transition-colors ${
              isSubmitted
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            💾 {isSubmitted ? 'Already Submitted' : 'Save Attendance'}
          </button>
        </div>

        {loading ? (
          <div className="text-center">⏳ Loading students...</div>
        ) : students.length === 0 ? (
          <div className="text-center">📭 No students found</div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b dark:border-slate-700">
                  <th className="pb-3 dark:text-white">🎯 Roll No.</th>
                  <th className="pb-3 dark:text-white">👤 Student Name</th>
                  <th className="pb-3 dark:text-white">📧 Email</th>
                  <th className="pb-3 dark:text-white">✅ Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr
                    key={student.id}
                    className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <td className="py-3 dark:text-white font-mono">{student.rollNo}</td>
                    <td className="py-3 dark:text-white">{student.name}</td>
                    <td className="py-3 dark:text-white">{student.email}</td>
                    <td className="py-3">
                      <select
                        value={attendance[student.id]?.status || 'present'}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        className="p-2 rounded border dark:bg-slate-700"
                        disabled={isSubmitted}
                      >
                        <option value="present">✅ Present</option>
                        <option value="absent">❌ Absent</option>
                        <option value="late">⌚ Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default Attendance;
