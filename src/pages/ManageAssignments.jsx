import React, { useState, useEffect } from 'react';
import DashboardLayout from './Dashboard';
import { db, storage } from '../config/firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Swal from 'sweetalert2';

const ManageAssignments = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchAssignments = async () => {
        try {
            const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const assignmentsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAssignments(assignmentsList);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            Swal.fire('Error', 'Failed to load assignments.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (title.trim() === '') {
            Swal.fire('Error', 'Assignment title is required.', 'error');
            return;
        }

        setUploading(true);
        try {
            let fileUrl = '';
            let fileName = '';

            if (file) {
                const fileRef = ref(storage, `assignments/${file.name}`);
                await uploadBytes(fileRef, file);
                fileUrl = await getDownloadURL(fileRef);
                fileName = file.name;
            }

            await addDoc(collection(db, 'assignments'), {
                title,
                description,
                fileUrl,
                fileName,
                createdAt: serverTimestamp()
            });

            Swal.fire('Success', 'Assignment posted successfully!', 'success');
            setTitle('');
            setDescription('');
            setFile(null);
            fetchAssignments();
        } catch (error) {
            console.error("Error posting assignment:", error);
            Swal.fire('Error', 'Failed to post assignment. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, fileName) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (fileName) {
                        const fileRef = ref(storage, `assignments/${fileName}`);
                        await deleteObject(fileRef);
                    }
                    await deleteDoc(doc(db, 'assignments', id));
                    Swal.fire('Deleted!', 'The assignment has been deleted.', 'success');
                    fetchAssignments();
                } catch (error) {
                    console.error("Error deleting assignment:", error);
                    Swal.fire('Error', 'Failed to delete assignment.', 'error');
                }
            }
        });
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                    📄 Manage Assignments
                </h1>

                <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto mb-8">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Assignment</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Assignment Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-700 dark:text-white"
                        />
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-700 dark:text-white"
                            rows="4"
                        ></textarea>
                        <div className="flex items-center space-x-2">
                            <label className="block text-sm font-medium dark:text-gray-300">
                                Attach File (Optional):
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                transition-colors dark:text-gray-400 dark:file:bg-slate-600 dark:file:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-3 font-semibold bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : 'Post Assignment'}
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Current Assignments</h2>
                    {loading ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading assignments...</div>
                    ) : assignments.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No assignments posted yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {assignments.map(assignment => (
                                <li key={assignment.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex justify-between items-center transition-all hover:bg-gray-50 dark:hover:bg-slate-700">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{assignment.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.description}</p>
                                        {assignment.fileUrl && (
                                            <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-1 inline-block">
                                                <span className="flex items-center">
                                                    📄 {assignment.fileName || "Download File"}
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(assignment.id, assignment.fileName)}
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

export default ManageAssignments;