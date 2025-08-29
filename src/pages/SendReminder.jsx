import React, { useState, useEffect } from 'react';
import DashboardLayout from './Dashboard';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import Swal from 'sweetalert2';

const SendReminder = () => {
  const [message, setMessage] = useState('');
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchReminders = async () => {
    try {
      const q = query(collection(db, 'reminders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const remindersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReminders(remindersList);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      Swal.fire('Error', 'Failed to load reminders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSendReminder = async () => {
    if (message.trim() === '') {
      Swal.fire('Error', 'Please enter a reminder message.', 'error');
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'reminders'), {
        message: message,
        createdAt: serverTimestamp(),
      });
      Swal.fire('Success', 'Reminder sent successfully!', 'success');
      setMessage('');
      fetchReminders(); // Refresh the list of reminders
    } catch (error) {
      console.error("Error sending reminder:", error);
      Swal.fire('Error', 'Failed to send reminder. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, 'reminders', id));
          Swal.fire('Deleted!', 'The reminder has been deleted.', 'success');
          fetchReminders();
        } catch (error) {
          console.error("Error deleting reminder:", error);
          Swal.fire('Error', 'Failed to delete reminder.', 'error');
        }
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          📢 Send Reminder
        </h1>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg max-w-xl mx-auto mb-8">
          <textarea
            className="w-full p-4 text-gray-800 text-lg border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
            rows={6}
            placeholder="Type your reminder message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={handleSendReminder}
            disabled={sending}
            className="mt-4 w-full py-3 text-lg font-semibold bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 hover:shadow-xl transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Reminder 📤'}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg max-w-xl mx-auto">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Current Reminders</h2>
          {loading ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading reminders...</div>
          ) : reminders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No reminders sent yet.</p>
          ) : (
            <ul className="space-y-4">
              {reminders.map((reminder) => (
                <li key={reminder.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex justify-between items-center transition-all hover:bg-gray-50 dark:hover:bg-slate-700">
                  <div>
                    <p className="text-lg text-gray-800 dark:text-white">{reminder.message}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {reminder.createdAt?.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SendReminder;