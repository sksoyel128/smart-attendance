import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import DashboardLayout from './Dashboard';
import { Eye } from 'lucide-react';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [viewSubmissionModal, setViewSubmissionModal] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    name: '',
    roll: '',
    text: ''
  });
  const [studentSubmission, setStudentSubmission] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'assignments'));
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const uid = auth.currentUser.uid;
        setUserId(uid);
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSubmissionForm((prev) => ({
            ...prev,
            name: userData.name || '',
            roll: userData.rollNo?.toString() || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching student info:', error);
      }
    };

    fetchStudentInfo();
  }, []);

  useEffect(() => {
    const fetchStudentSubmission = async () => {
      if (selectedAssignment && userId) {
        const q = query(
          collection(db, 'submissions'),
          where('assignmentId', '==', selectedAssignment.id),
          where('studentUID', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudentSubmission(data[0] || null);
      }
    };

    fetchStudentSubmission();
  }, [selectedAssignment, userId]);

  const handleSubmission = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        assignmentId: selectedAssignment.id,
        studentName: submissionForm.name,
        studentRoll: submissionForm.roll,
        submissionText: submissionForm.text,
        studentUID: userId,
        submittedAt: serverTimestamp(), // Use serverTimestamp for accuracy
      };
      await addDoc(collection(db, 'submissions'), submissionData);
      setSubmissionModalOpen(false);
      setSubmissionForm({ ...submissionForm, text: '' });
      setStudentSubmission(submissionData); // Update locally
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 relative">
        <h1 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-2">
          📚 Student Assignments
        </h1>
        {assignments.length === 0 ? (
          <div className="text-center text-gray-500">No assignments found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => setSelectedAssignment(assignment)}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <h2 className="text-xl font-semibold text-purple-800 mb-2">{assignment.title}</h2>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Teacher:</span> {assignment.teacher}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Due Date:</span>{' '}
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
        {selectedAssignment && (
          <div
            className="fixed inset-0 bg-blue-900 bg-opacity-90 z-50 flex items-center justify-center transition-all"
            onClick={() => setSelectedAssignment(null)}
          >
            <div
              className="bg-white max-w-2xl w-full mx-4 p-8 rounded-2xl shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 text-xl font-bold"
                onClick={() => setSelectedAssignment(null)}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-blue-700 mb-4">📖 {selectedAssignment.title}</h2>
              <div className="mb-6">
                <p className="text-gray-800 text-lg whitespace-pre-line">
                  {selectedAssignment.assignmentText}
                </p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-purple-700">Your Submission</h3>
                  {!studentSubmission ? (
                    <button
                      onClick={() => setSubmissionModalOpen(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      + New Submission
                    </button>
                  ) : (
                    <button
                      onClick={() => setViewSubmissionModal(true)}
                      className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                      title="View Submission"
                    >
                      <Eye size={20} />
                    </button>
                  )}
                </div>
                {!studentSubmission && (
                  <p className="text-gray-500">You haven't submitted this assignment yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {submissionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white max-w-md w-full mx-4 p-6 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-purple-700 mb-4">Submit Assignment</h3>
              <form onSubmit={handleSubmission}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Name</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full p-3 border border-purple-200 rounded-lg bg-gray-100 text-gray-600"
                      value={submissionForm.name}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Roll Number</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full p-3 border border-purple-200 rounded-lg bg-gray-100 text-gray-600"
                      value={submissionForm.roll}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Submission Text</label>
                    <textarea
                      required
                      className="w-full p-3 border border-purple-200 rounded-lg h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={submissionForm.text}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, text: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmissionModalOpen(false)}
                    className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {viewSubmissionModal && studentSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white max-w-md w-full mx-4 p-6 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-purple-700 mb-4">Your Submission</h3>
              <div className="mb-4">
                <p><strong>Name:</strong> {studentSubmission.studentName}</p>
                <p><strong>Roll No:</strong> {studentSubmission.studentRoll}</p>
                {studentSubmission.submittedAt && (
                  <p><strong>Submitted At:</strong> {new Date(studentSubmission.submittedAt.seconds * 1000).toLocaleString()}</p>
                )}
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <p className="whitespace-pre-line">{studentSubmission.submissionText}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setViewSubmissionModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;