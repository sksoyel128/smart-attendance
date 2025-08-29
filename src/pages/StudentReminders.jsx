import React, { useEffect, useState } from 'react';
import DashboardLayout from './Dashboard';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import Swal from 'sweetalert2';

const StudentReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reminders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReminders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setReminders(fetchedReminders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reminders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReminderClick = (reminder) => {
    Swal.fire({
      title: 'Reminder from Teacher',
      text: reminder.message,
      icon: 'info',
      confirmButtonText: 'Got it!',
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-6 flex items-center gap-2">
          ⏰ Reminders for Students
        </h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <p className="text-gray-500 text-center">No reminders at the moment.</p>
        ) : (
          <ul className="space-y-6 max-w-3xl mx-auto">
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                onClick={() => handleReminderClick(reminder)}
                className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <p className="text-lg text-gray-800">{reminder.message}</p>
                <p className="text-sm text-red-500 mt-1">{reminder.createdAt?.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentReminders;