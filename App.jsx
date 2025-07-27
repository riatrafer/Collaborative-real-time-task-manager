import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    serverTimestamp
} from 'firebase/firestore';

// --- Helper Functions & Configuration ---

// These global variables are expected to be provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Icon Components ---

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2 h-5 w-5 hover:text-red-500 transition-colors duration-200"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-circle h-6 w-6 text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const CircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-circle h-6 w-6 text-gray-400"><circle cx="12" cy="12" r="10"></circle></svg>
);

const Loader = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
);

// --- Main App Component ---

export default function App() {
    // --- State Management ---
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const inputRef = useRef(null);
    
    // Path for public data collection
    const tasksCollectionPath = `artifacts/${appId}/public/data/tasks`;

    // --- Firebase Initialization and Authentication ---
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            setDb(firestore);
            setAuth(authInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    // If no user, try custom token, then fall back to anonymous sign-in
                    try {
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(authInstance, __initial_auth_token);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (authError) {
                        console.error("Authentication failed:", authError);
                        setError("Could not connect to the authentication service.");
                    }
                }
                setIsAuthReady(true);
            });
            
            return () => unsubscribe();

        } catch (e) {
            console.error("Firebase initialization error:", e);
            setError("Failed to initialize the application. Please check the configuration.");
            setIsLoading(false);
        }
    }, []);

    // --- Real-time Data Fetching ---
    useEffect(() => {
        // Ensure db is initialized and user is authenticated before setting up the listener
        if (!isAuthReady || !db) {
            return;
        }

        setIsLoading(true);
        const q = query(collection(db, tasksCollectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tasksData = [];
            querySnapshot.forEach((doc) => {
                tasksData.push({ id: doc.id, ...doc.data() });
            });
            // Sort tasks: incomplete first, then by creation date descending
            tasksData.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.seconds - a.createdAt.seconds;
                }
                return 0;
            });
            setTasks(tasksData);
            setIsLoading(false);
        }, (err) => {
            console.error("Snapshot error:", err);
            setError("Failed to load tasks. Please check your connection or permissions.");
            setIsLoading(false);
        });

        // Cleanup function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();

    }, [db, isAuthReady]); // Rerun effect if db or auth readiness changes

    // --- CRUD Functions ---
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTask.trim() === '' || !db || !userId) return;

        try {
            await addDoc(collection(db, tasksCollectionPath), {
                text: newTask.trim(),
                completed: false,
                createdAt: serverTimestamp(),
                createdBy: userId
            });
            setNewTask('');
        } catch (err) {
            console.error("Error adding task:", err);
            setError("Failed to add the task.");
        }
    };

    const handleToggleTask = async (task) => {
        if (!db) return;
        const taskRef = doc(db, tasksCollectionPath, task.id);
        try {
            await updateDoc(taskRef, {
                completed: !task.completed
            });
        } catch (err) {
            console.error("Error updating task:", err);
            setError("Failed to update the task.");
        }
    };

    const handleDeleteTask = async (id) => {
        if (!db) return;
        const taskRef = doc(db, tasksCollectionPath, id);
        try {
            await deleteDoc(taskRef);
        } catch (err) {
            console.error("Error deleting task:", err);
            setError("Failed to delete the task.");
        }
    };

    // --- Render Logic ---
    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
                <header className="bg-gray-800 text-white p-6 rounded-t-xl">
                    <h1 className="text-2xl sm:text-3xl font-bold">Collaborative Task Manager</h1>
                    <p className="text-sm text-gray-300 mt-1">Changes are updated in real-time for all users.</p>
                </header>

                <div className="p-6">
                    <form onSubmit={handleAddTask} className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task..."
                            className="flex-grow p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            disabled={isLoading || !isAuthReady}
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={!newTask.trim() || isLoading || !isAuthReady}
                        >
                            Add
                        </button>
                    </form>

                    {error && <div className="bg-red-100 text-red-700 p-3 mt-4 rounded-lg">{error}</div>}

                    <div className="mt-6">
                        {isLoading ? (
                            <Loader />
                        ) : tasks.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <p className="font-semibold">No tasks yet!</p>
                                <p>Add a task above to get started.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {tasks.map(task => (
                                    <li
                                        key={task.id}
                                        className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                                            task.completed ? 'bg-gray-200 text-gray-500 line-through' : 'bg-white shadow-sm hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleToggleTask(task)}>
                                            {task.completed ? <CheckCircleIcon /> : <CircleIcon />}
                                            <span className="flex-grow">{task.text}</span>
                                        </div>
                                        <button onClick={() => handleDeleteTask(task.id)} aria-label="Delete task">
                                            <TrashIcon />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                
                <footer className="bg-gray-50 text-center p-4 rounded-b-xl border-t">
                    <p className="text-xs text-gray-500">Your Session ID (for collaboration):</p>
                    <p className="text-xs text-gray-600 font-mono break-all select-all">{userId || 'Connecting...'}</p>
                </footer>
            </div>
        </div>
    );
}

