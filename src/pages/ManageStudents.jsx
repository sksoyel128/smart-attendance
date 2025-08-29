import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Percent, CalendarDays, Thermometer, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from './Dashboard';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ totalDays: 0, presentRatio: 0, absentRatio: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    imageURL: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allStudents = usersSnapshot.docs
          .filter(doc => doc.data().role === 'student')
          .map(doc => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            phone: doc.data().phone,
            address: doc.data().address,
            imageURL: doc.data().imageURL,
          }));

        const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
        const allAttendance = attendanceSnapshot.docs.map(doc => doc.data());

        const processedStudents = allStudents.map(student => {
          let present = 0, absent = 0, total = 0;

          allAttendance.forEach(attendanceDoc => {
            attendanceDoc.records?.forEach(record => {
              if (record.studentId === student.id) {
                total++;
                if (record.status === 'present' || record.status === 'late') present++;
                if (record.status === 'absent') absent++;
              }
            });
          });

          return { ...student, present, absent, total };
        });

        const totalDays = [...new Set(allAttendance.map(doc => doc.date))].length;
        const totalPresent = processedStudents.reduce((sum, s) => sum + s.present, 0);
        const totalAbsent = processedStudents.reduce((sum, s) => sum + s.absent, 0);
        const totalRecords = totalPresent + totalAbsent;

        setStats({
          totalDays,
          presentRatio: totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0,
          absentRatio: totalRecords > 0 ? (totalAbsent / totalRecords) * 100 : 0,
        });

        setStudents(processedStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showAddStudentForm]);

  const handleAddStudentClick = () => setShowAddStudentForm(true);

  const handleCloseAddStudentForm = () => {
    setShowAddStudentForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      imageURL: '',
      password: '',
    });
    setShowPassword(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        imageURL: formData.imageURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s',
        role: 'student', // ✅ Default role
        createdAt: new Date(),
      });

      handleCloseAddStudentForm();
      alert('Student added successfully!');
    } catch (error) {
      console.error("Error adding student:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{stats.presentRatio.toFixed(1)}%</h3>
                  <p className="opacity-90">Attendance Ratio</p>
                </div>
                <Percent size={40} className="opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{stats.absentRatio.toFixed(1)}%</h3>
                  <p className="opacity-90">Absent Ratio</p>
                </div>
                <Thermometer size={40} className="opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{stats.totalDays}</h3>
                  <p className="opacity-90">Total Days</p>
                </div>
                <CalendarDays size={40} className="opacity-80" />
              </div>
            </div>
          </div>

          {/* Add Student Button */}
          <button
            onClick={handleAddStudentClick}
            className="mb-6 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Student
          </button>

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-slate-700">
              <h2 className="text-xl font-semibold dark:text-white">Student Attendance Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Student Name</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Present</th>
                    <th className="px-6 py-3 text-left">Absent</th>
                    <th className="px-6 py-3 text-left">Total Days</th>
                    <th className="px-6 py-3 text-left">Attendance %</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-3">{student.name}</td>
                      <td className="px-6 py-3">{student.phone}</td>
                      <td className="px-6 py-3">{student.present}</td>
                      <td className="px-6 py-3">{student.absent}</td>
                      <td className="px-6 py-3">{student.total}</td>
                      <td className="px-6 py-3">
                        {((student.present / student.total) * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-3">
                        {student.present / student.total >= 0.75 ? 'Satisfactory' : 'Unsatisfactory'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Student Modal */}
          {showAddStudentForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md w-full p-6 relative">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Student</h2>
                {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  <Input type="email" label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  <Input type="tel" label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  <Input label="Image URL" value={formData.imageURL} onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })} />
                  
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={handleCloseAddStudentForm} className="px-4 py-2 rounded bg-gray-300 dark:bg-slate-600 text-black dark:text-white">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const Input = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm font-medium dark:text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={label !== "Image URL"}
      className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
    />
  </div>
);

export default ManageStudents;
