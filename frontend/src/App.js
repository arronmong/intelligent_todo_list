import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithPopup, 
    GithubAuthProvider, 
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    setLogLevel
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug');


// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Authentication ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSignIn = async () => {
        const provider = new GithubAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with GitHub:", error);
            setError("Failed to sign in. Please try again.");
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setTasks([]); // Clear tasks on sign out
        } catch (error) {
            console.error("Error signing out:", error);
            setError("Failed to sign out.");
        }
    };

    // --- Firestore Real-time Data Fetching ---
    useEffect(() => {
        if (!user) {
            setTasks([]);
            return;
        }

        const tasksCollection = collection(db, 'tasks');
        const q = query(tasksCollection, where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userTasks = [];
            querySnapshot.forEach((doc) => {
                userTasks.push({ id: doc.id, ...doc.data() });
            });
            // Sort tasks by creation time, newest first
            userTasks.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            setTasks(userTasks);
        }, (err) => {
            console.error("Error fetching tasks:", err);
            setError("Could not fetch tasks.");
        });

        return () => unsubscribe();
    }, [user]);

    // --- Task Management ---
    // Add tasks
    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim() || !user) return;

        let category = 'General'; // Default category

        try {
            // Call the Flask backend to get the category
            const response = await fetch('https://intelligent-todo-api.onrender.com/categorize-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newTask }),
            });

            if (response.ok) {
                const result = await response.json();
                category = result.category;
            } else {
                console.warn("Could not fetch category from backend, using default.");
            }
        } catch (error) {
            console.error("Error calling categorization API:", error);
            // Don't block the user, just use the default category
            setError("Could not connect to the categorization service. Using default category.");
        }

        const taskData = {
            text: newTask,
            completed: false,
            userId: user.uid,
            createdAt: new Date(),
            category: category // Use the category from the backend
        };
        
        try {
            await addDoc(collection(db, 'tasks'), taskData);
            setNewTask('');
            // Clear the error message if task is added successfully
            setError(null); 
        } catch (error) {
            console.error("Error adding task to Firestore:", error);
            setError("Failed to add task.");
        }
    };
    //Update Task Category (Manually done by user)
    const updateTaskCategory = async (taskId, newCategory) => {
        const taskRef = doc(db, 'tasks', taskId);
        try {
            await updateDoc(taskRef, {
                category: newCategory,
                isUserCorrected: true // Flag this as a high-quality training example
            });
        } catch (error) {
            console.error("Error updating task category:", error);
            setError("Failed to update category.");
        }
    };
    // Assign Task Category
    const getCategoryFromText = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('meeting') || lowerText.includes('report') || lowerText.includes('email')) {
            return 'Work';
        }
        if (lowerText.includes('buy') || lowerText.includes('groceries') || lowerText.includes('gym')) {
            return 'Personal';
        }
        if (lowerText.includes('urgent') || lowerText.includes('asap')) {
            return 'Urgent';
        }
        return 'General';
    };


    const toggleComplete = async (task) => {
        const taskRef = doc(db, 'tasks', task.id);
        try {
            await updateDoc(taskRef, {
                completed: !task.completed
            });
        } catch (error) {
            console.error("Error updating task:", error);
            setError("Failed to update task.");
        }
    };
//delete tasks
    const deleteTask = async (taskId) => {
        const taskRef = doc(db, 'tasks', taskId);
        try {
            await deleteDoc(taskRef);
        } catch (error) {
            console.error("Error deleting task:", error);
            setError("Failed to delete task.");
        }
    };

    // --- UI Rendering ---
    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <header className="flex justify-between items-center py-4 mb-6 border-b border-gray-700">
                    <h1 className="text-4xl font-bold text-cyan-400">Intelligent To-Do</h1>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-300 hidden sm:block">{user.displayName || user.email}</span>
                            <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleSignIn} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            Sign In with GitHub
                        </button>
                    )}
                </header>

                {error && <div className="bg-red-500 text-white p-3 rounded-lg mb-4">{error}</div>}

                {user ? (
                    <main>
                        <form onSubmit={addTask} className="flex mb-6 gap-2">
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="Add a new task..."
                                className="flex-grow bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition duration-300"
                            />
                            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                                Add
                            </button>
                        </form>
                        
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={deleteTask} />
                            ))}
                        </div>
                    </main>
                ) : (
                    <div className="text-center bg-gray-800 p-8 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
                        <p className="text-gray-400">Please sign in with your GitHub account to manage your to-do list.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- TaskItem Component ---
const TaskItem = ({ task, onToggle, onDelete, onCategoryChange }) => {
    
    // The list of categories users can choose from.
    const categories = ['Work', 'Personal', 'Urgent', 'Finance', 'Learning', 'General'];

    const getCategoryPill = (category) => {
        const styles = {
            'Work': 'bg-blue-500 text-blue-100',
            'Personal': 'bg-green-500 text-green-100',
            'Urgent': 'bg-yellow-500 text-yellow-100',
            'Finance': 'bg-purple-500 text-purple-100',
            'Learning': 'bg-indigo-500 text-indigo-100',
            'General': 'bg-gray-500 text-gray-100'
        };
        return styles[category] || styles['General'];
    }
    
    return (
        <div className={`flex items-center justify-between p-4 rounded-lg transition duration-300 ${task.completed ? 'bg-gray-800' : 'bg-gray-700'}`}>
            <div className="flex items-center gap-4 flex-grow">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task)}
                    className="h-6 w-6 rounded text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-500 shrink-0"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.text}
                </span>
            </div>
            <div className="flex items-center gap-3">
                {/* Category dropdown */}
                <select 
                    value={task.category} 
                    onChange={(e) => onCategoryChange(task.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-none outline-none appearance-none cursor-pointer ${getCategoryPill(task.category)}`}
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-gray-700 text-white">
                            {cat}
                        </option>
                    ))}
                </select>

                <button onClick={() => onDelete(task.id)} className="text-gray-500 hover:text-red-500 transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <div className="space-y-4">
    {tasks.map(task => (
        <TaskItem 
            key={task.id} 
            task={task} 
            onToggle={toggleComplete} 
            onDelete={deleteTask}
            onCategoryChange={updateTaskCategory} // Add this line
        />
    ))}
</div>
        </div>
    )
}