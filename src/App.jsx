import React, { useState, useRef, useEffect } from 'react';
import { 
    UploadCloud, BookOpen, ShieldCheck, 
    MessageSquare, Send, FileText, 
    User, GraduationCap, Loader2,
    LogOut, Lock, Settings, Database, Plus, Users, Layout, Tag, Eye,
    Trash2, Edit, X, Library, Building
} from 'lucide-react';

// --- CLOUD DATABASE SETUP (FIREBASE) ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// --- CONFIGURATION ---
// 1. GEMINI API KEY (From your .env file)
const apiKey = "AIzaSyBqzF6bL4fJFggsqggSK5bwnboNkMqe49Y"; 
const MODEL_NAME = "gemini-1.5-flash";

// 2. FIREBASE CONFIG (Paste your config from Step 1 here)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2sHdmebplDG9ghPyk8xCOYhSGUL-ix4I",
  authDomain: "rianlearning-3edf2.firebaseapp.com",
  projectId: "rianlearning-3edf2",
  storageBucket: "rianlearning-3edf2.firebasestorage.app",
  messagingSenderId: "834602838822",
  appId: "1:834602838822:web:5fc2c41ee2c2f6ed7f2fe7",
  measurementId: "G-SF1B2J0YTQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Database
// const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// --- COGNITIVE API HELPER ---
const callCognitiveEngine = async (userPrompt, systemInstruction = "") => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
    };

    if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const delays = [1000, 2000, 4000, 8000, 16000];
    
    for (let i = 0; i < delays.length; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        } catch (error) {
            if (i === delays.length - 1) {
                return "Error: The Cognitive Engine is currently unreachable. Please try again later.";
            }
            await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
    }
};

// --- DEFAULT DATABASE STRUCTURE ---
const DEFAULT_DB = {
    schema: {
        courses: ['MCA First Year', 'B.Tech CS', 'B.Sc IT'],
        sections: ['A', 'B'],
        subjects: ['Cognitive Computing', 'Data Structures', 'Artificial Intelligence']
    },
    users: [
        { id: '1', username: 'dev', password: '123', role: 'developer', name: 'System Admin' },
        { 
            id: '2', username: 'teacher', password: '123', role: 'teacher', name: 'Professor Smith', 
            assignments: [
                { course: 'MCA First Year', section: 'A', subject: 'Cognitive Computing' },
                { course: 'MCA First Year', section: 'B', subject: 'Cognitive Computing' }
            ] 
        },
        { 
            id: '3', username: 'student', password: '123', role: 'student', name: 'Alex Johnson', 
            enrollment: { course: 'MCA First Year', section: 'A' } 
        }
    ],
    documents: []
};

// --- LOGIN SCREEN COMPONENT ---
function LoginScreen({ onLogin, db }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const foundUser = db.users.find(u => u.username === username && u.password === password);
        
        if (foundUser) {
            onLogin(foundUser);
        } else {
            setError('Invalid credentials. Please check your username and password.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-indigo-900/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 w-full max-w-lg animate-in slide-in-from-bottom-4 duration-500 relative z-10 shadow-2xl">
                <div className="flex flex-col items-center mb-8 sm:mb-10">
                    <div className="mb-6 bg-blue-50 p-4 rounded-full border border-blue-100">
                        <Building className="w-10 h-10 sm:w-12 sm:h-12 text-blue-800" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight pb-2 text-center">RIANLearning</h1>
                    <div className="w-12 h-0.5 bg-blue-700 my-3"></div>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium tracking-widest uppercase text-center">Cloud University Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border-l-4 border-red-600 text-center font-medium shadow-sm">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold tracking-wider uppercase text-slate-600">University ID</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-sm sm:text-base placeholder-slate-400 shadow-sm"
                            placeholder="Enter your ID"
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold tracking-wider uppercase text-slate-600">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-sm sm:text-base placeholder-slate-400 shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-800 hover:bg-blue-900 border border-blue-900 text-white font-bold tracking-wide uppercase py-4 rounded-lg transition-colors flex items-center justify-center mt-6 shadow-md text-xs sm:text-sm"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        Secure Login
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
    const [db, setDbState] = useState(DEFAULT_DB);
    const [user, setUser] = useState(null); 
    const [isDbLoading, setIsDbLoading] = useState(true);
    
    // Connect to Firebase Cloud Database on App Load
    useEffect(() => {
        // Point to our specific cloud document
        const docRef = doc(firestore, 'rian_cloud', 'main_database');

        // onSnapshot automatically listens for live changes from other devices!
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setDbState(docSnap.data());
            } else {
                // If it's a brand new database, push the default schema to the cloud
                setDoc(docRef, DEFAULT_DB);
                setDbState(DEFAULT_DB);
            }
            setIsDbLoading(false);
        }, (error) => {
            console.error("Firebase Connection Error:", error);
            alert("Could not connect to Cloud Server. Check your Firebase Config.");
            setIsDbLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Custom setDb function that updates UI immediately AND saves to Cloud
    const setDb = async (newDbOrUpdater) => {
        let newState = typeof newDbOrUpdater === 'function' ? newDbOrUpdater(db) : newDbOrUpdater;
        
        // 1. Update UI instantly
        setDbState(newState); 
        
        // 2. Sync changes to the cloud
        try {
            await setDoc(doc(firestore, 'rian_cloud', 'main_database'), newState);
        } catch (error) {
            console.error("Error syncing to cloud:", error);
            alert("Warning: Failed to sync changes to the cloud.");
        }
    };

    if (isDbLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-800 animate-spin mb-4" />
                <h2 className="text-xl font-serif font-bold text-slate-900">Connecting to Cloud Server...</h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">Establishing secure connection</p>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen onLogin={setUser} db={db} />;
    }

    const getRoleIcon = () => {
        if (user.role === 'developer') return <Settings className="w-5 h-5 mr-3 text-blue-300" />;
        if (user.role === 'teacher') return <BookOpen className="w-5 h-5 mr-3 text-blue-300" />;
        return <GraduationCap className="w-5 h-5 mr-3 text-blue-300" />;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col w-full overflow-x-hidden">
            {/* Header / Navigation */}
            <header className="bg-blue-950 text-white shadow-md border-b-4 border-blue-700 w-full sticky top-0 z-50">
                <div className="w-full px-4 sm:px-8 lg:px-12 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                    <div className="flex items-center space-x-4">
                        <Building className="w-8 h-8 text-blue-200" strokeWidth={1.5} />
                        <div className="flex flex-col">
                            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white leading-none">RIANLearning</h1>
                            <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold mt-1">Cloud Portal • Live</p>
                        </div>
                    </div>
                    
                    {/* User Profile & Logout */}
                    <div className="flex items-center space-x-3 sm:space-x-4 bg-blue-900/50 px-4 py-2.5 rounded-lg border border-blue-800 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center text-white">
                            {getRoleIcon()}
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm leading-tight text-white">{user.name}</span>
                                <span className="text-[10px] uppercase tracking-widest text-blue-300 leading-tight font-bold mt-0.5">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-blue-800 mx-2"></div>
                        <button 
                            onClick={() => setUser(null)}
                            className="flex items-center text-blue-300 hover:text-white transition-colors p-2 rounded-md hover:bg-blue-800"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 flex-1 flex flex-col">
                {user.role === 'developer' && <DeveloperPortal db={db} setDb={setDb} />}
                {user.role === 'teacher' && <TeacherPortal db={db} setDb={setDb} user={user} />}
                {user.role === 'student' && <StudentPortal db={db} user={user} />}
            </main>
        </div>
    );
}

// --- PDF PROCESSING HELPER ---
const loadPdfJs = async () => {
    if (window.pdfjsLib) return window.pdfjsLib;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.body.appendChild(script);
    
    return new Promise((resolve, reject) => {
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(window.pdfjsLib);
        };
        script.onerror = () => reject(new Error("Failed to load PDF.js"));
    });
};

const MAX_INGESTION_CHARS = 50000; 

const extractTextFromPdf = async (file) => {
    const pdfjs = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
        
        if (fullText.length > MAX_INGESTION_CHARS) {
            fullText = fullText.substring(0, MAX_INGESTION_CHARS) + "\n\n[SYSTEM NOTICE: Document truncated due to massive size.]";
            break; 
        }
    }
    return fullText;
};

// --- DEVELOPER PORTAL COMPONENT ---
function DeveloperPortal({ db, setDb }) {
    const [editingUserId, setEditingUserId] = useState(null);
    const [role, setRole] = useState('student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    
    const [course, setCourse] = useState(db.schema.courses[0] || '');
    const [section, setSection] = useState(db.schema.sections[0] || '');
    const [subject, setSubject] = useState(db.schema.subjects[0] || '');

    const [newCourse, setNewCourse] = useState('');
    const [newSection, setNewSection] = useState('');
    const [newSubject, setNewSubject] = useState('');

    const handleSaveUser = (e) => {
        e.preventDefault();
        if (!username || !password || !name) return alert("Fill all user details.");

        const userData = { id: editingUserId || Date.now().toString(), username, password, role, name };
        
        if (role === 'student') {
            userData.enrollment = { course, section };
        } else if (role === 'teacher') {
            userData.assignments = [{ course, section, subject }];
        }

        if (editingUserId) {
            setDb(prev => ({ ...prev, users: prev.users.map(u => u.id === editingUserId ? userData : u) }));
            alert("Account updated in cloud!");
        } else {
            setDb(prev => ({ ...prev, users: [...prev.users, userData] }));
            alert(`${role.charAt(0).toUpperCase() + role.slice(1)} account created in cloud!`);
        }
        cancelEdit();
    };

    const editUser = (u) => {
        setEditingUserId(u.id);
        setRole(u.role);
        setUsername(u.username);
        setPassword(u.password);
        setName(u.name);
        
        if (u.role === 'student' && u.enrollment) {
            setCourse(u.enrollment.course);
            setSection(u.enrollment.section);
        } else if (u.role === 'teacher' && u.assignments && u.assignments.length > 0) {
            setCourse(u.assignments[0].course);
            setSection(u.assignments[0].section);
            setSubject(u.assignments[0].subject);
        }
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setUsername(''); setPassword(''); setName(''); setRole('student');
    };

    const handleDeleteUser = (id) => {
        if (id === '1') return alert("Action Denied: Cannot delete the primary Developer account.");
        if (window.confirm("Are you sure you want to delete this user profile permanently from the cloud?")) {
            setDb(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
        }
    };

    const handleAddSchema = (type, val, resetFn) => {
        const cleanVal = val.trim();
        if (!cleanVal) return;
        
        const exists = db.schema[type].some(item => item.toLowerCase() === cleanVal.toLowerCase());
        if (exists) return alert(`"${cleanVal}" already exists in ${type}.`);

        const newSchema = { ...db.schema, [type]: [...db.schema[type], cleanVal] };
        setDb({ ...db, schema: newSchema });
        resetFn('');
    };

    const handleDeleteSchema = (type, val) => {
        if (window.confirm(`Delete ${val} from ${type} in the cloud?`)) {
            setDb(prev => ({
                ...prev,
                schema: { ...prev.schema, [type]: prev.schema[type].filter(item => item !== val) }
            }));
        }
    };

    const handleFactoryReset = () => {
        if (window.confirm("WARNING: This will permanently delete all cloud users, documents, and schema entries. Reset to factory defaults?")) {
            setDb(DEFAULT_DB);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 w-full animate-in fade-in duration-500">
            {/* Schema Management */}
            <div className="space-y-6">
                <div className="bg-white p-5 sm:p-8 rounded-xl border border-slate-200 w-full shadow-sm">
                    <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                        <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-800 mr-3" />
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 pb-1 tracking-wide">Curriculum Structure</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <input type="text" value={newCourse} onChange={e => setNewCourse(e.target.value)} placeholder="New Course (e.g., MCA 2nd Year)" className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                            <button onClick={() => handleAddSchema('courses', newCourse, setNewCourse)} className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center uppercase tracking-wider text-xs shadow-sm"><Plus className="w-4 h-4 sm:mr-1.5"/><span className="sm:hidden ml-1">Add</span></button>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <input type="text" value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="New Section (e.g., C)" className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                            <button onClick={() => handleAddSchema('sections', newSection, setNewSection)} className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center uppercase tracking-wider text-xs shadow-sm"><Plus className="w-4 h-4 sm:mr-1.5"/><span className="sm:hidden ml-1">Add</span></button>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="New Subject (e.g., Machine Learning)" className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                            <button onClick={() => handleAddSchema('subjects', newSubject, setNewSubject)} className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center uppercase tracking-wider text-xs shadow-sm"><Plus className="w-4 h-4 sm:mr-1.5"/><span className="sm:hidden ml-1">Add</span></button>
                        </div>
                    </div>

                    <div className="mt-8 p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-800 mb-4 text-xs sm:text-sm uppercase tracking-widest border-b border-slate-200 pb-2">Active Cloud Schema:</p>
                        {['courses', 'sections', 'subjects'].map(type => (
                            <div key={type} className="mb-5 last:mb-0">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">{type}</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {db.schema[type].map(item => (
                                        <span key={item} className="inline-flex items-center bg-white border border-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 shadow-sm">
                                            {item}
                                            <button onClick={() => handleDeleteSchema(type, item)} className="ml-2.5 text-slate-400 hover:text-red-600 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                    {db.schema[type].length === 0 && <span className="text-xs text-slate-500 italic font-serif">None defined</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <button 
                            onClick={handleFactoryReset}
                            className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-bold uppercase tracking-wider py-3.5 rounded-lg transition-colors text-xs shadow-sm"
                        >
                            Factory Reset Cloud Database
                        </button>
                    </div>
                </div>
            </div>

            {/* User Provisioning */}
            <div className="bg-white p-5 sm:p-8 rounded-xl border border-slate-200 w-full shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-800 mr-3" />
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 pb-1 tracking-wide">
                            {editingUserId ? 'Edit Profile' : 'Campus Provisioning'}
                        </h2>
                    </div>
                    {editingUserId && (
                        <button onClick={cancelEdit} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 border border-slate-300 px-3 py-1.5 rounded-md bg-white transition-colors shadow-sm">Cancel</button>
                    )}
                </div>
                
                <form onSubmit={handleSaveUser} className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Role</label>
                            <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold shadow-sm">
                                <option value="student">Student</option>
                                <option value="teacher">Professor / Teacher</option>
                                <option value="developer">Administrator</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">University ID</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
                            <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" required />
                        </div>
                    </div>

                    {role !== 'developer' && (
                        <div className="border-t border-slate-200 pt-6 mt-6">
                            <h3 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-widest">
                                {role === 'teacher' ? 'Course Assignments' : 'Course Enrollment'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Degree / Course</label>
                                    <select value={course} onChange={e => setCourse(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm">
                                        {db.schema.courses.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Section</label>
                                    <select value={section} onChange={e => setSection(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm">
                                        {db.schema.sections.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                {role === 'teacher' && (
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Teaching Subject</label>
                                        <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm">
                                            {db.schema.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button type="submit" className={`w-full text-white font-bold uppercase tracking-wider text-xs py-4 rounded-lg transition-colors mt-8 shadow-md border ${editingUserId ? 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800' : 'bg-blue-800 hover:bg-blue-900 border-blue-900'}`}>
                        {editingUserId ? 'Update Cloud Profile' : 'Register New User to Cloud'}
                    </button>
                </form>
            </div>

            {/* User Directory - Full Width */}
            <div className="xl:col-span-2 bg-white p-5 sm:p-8 rounded-xl border border-slate-200 overflow-hidden w-full shadow-sm">
                <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-800 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 pb-1 tracking-wide">Cloud Campus Directory</h2>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 w-full max-w-full shadow-sm">
                    <table className="w-full text-sm text-left min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="px-6 py-4 font-bold">Name & Details</th>
                                <th className="px-6 py-4 font-bold">Role</th>
                                <th className="px-6 py-4 font-bold">Credentials</th>
                                <th className="px-6 py-4 font-bold">Academic Mapping</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {db.users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-slate-900 text-base">{u.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-1 tracking-wider">ID: {u.id}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                                            u.role === 'developer' ? 'bg-slate-100 text-slate-700 border-slate-300' : 
                                            u.role === 'teacher' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-mono text-xs text-slate-600">
                                        <div className="mb-1"><span className="text-slate-400 mr-2 text-[10px] uppercase tracking-widest">User</span><span className="text-slate-800 font-semibold">{u.username}</span></div>
                                        <div><span className="text-slate-400 mr-2 text-[10px] uppercase tracking-widest">Pass</span>{u.password}</div>
                                    </td>
                                    <td className="px-6 py-5 text-xs font-medium text-slate-600">
                                        {u.role === 'student' && u.enrollment && (
                                            <span className="flex items-center"><GraduationCap className="w-4 h-4 mr-2 text-slate-400"/> {u.enrollment.course} • Sec {u.enrollment.section}</span>
                                        )}
                                        {u.role === 'teacher' && u.assignments && u.assignments.length > 0 && (
                                            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-blue-600"/> {u.assignments[0].subject} <br/>({u.assignments[0].course})</span>
                                        )}
                                        {u.role === 'developer' && <span className="text-slate-400 italic font-serif">System Administrator</span>}
                                    </td>
                                    <td className="px-6 py-5 text-right space-x-3">
                                        <button onClick={() => editUser(u)} className="text-slate-500 hover:text-blue-700 p-2 rounded-md transition-colors border border-transparent hover:border-blue-200 hover:bg-blue-50" title="Edit Profile">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {u.id !== '1' && (
                                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-700 p-2 rounded-md transition-colors border border-transparent hover:border-red-200 hover:bg-red-50" title="Delete Profile">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- TEACHER PORTAL COMPONENT ---
function TeacherPortal({ db, setDb, user }) {
    const fileInputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAssignmentIdx, setSelectedAssignmentIdx] = useState(0);

    if (!user.assignments || user.assignments.length === 0) {
        return (
            <div className="text-center p-8 sm:p-16 bg-white rounded-xl border border-slate-200 w-full max-w-4xl mx-auto shadow-sm">
                <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-6" strokeWidth={1.5} />
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-800 tracking-wide">No Classes Assigned</h2>
                <p className="text-slate-500 mt-3 text-sm sm:text-base font-serif italic">Please contact the University Administration to assign you to a course and subject.</p>
            </div>
        );
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        const assignment = user.assignments[selectedAssignmentIdx];
        
        try {
            let text = '';
            let dataUrl = '';
            const isPdf = file.name.toLowerCase().endsWith('.pdf');
            
            if (isPdf) {
                text = await extractTextFromPdf(file);
            } else {
                text = await readFileAsText(file);
                if (text.length > MAX_INGESTION_CHARS) {
                     text = text.substring(0, MAX_INGESTION_CHARS) + "\n\n[SYSTEM NOTICE: Document truncated due to massive size.]";
                }
            }
            
            if (file.size < 3 * 1024 * 1024) { 
                dataUrl = await readFileAsDataURL(file);
            }
            
            if (!text.trim()) {
                text = "[System Note: No readable text could be automatically extracted from this file. It may be a scanned image, an empty file, or an unsupported binary format. The original file may still be viewed in the 'Read Original' tab.]";
            }
            
            const newDoc = {
                id: Date.now().toString(),
                name: file.name,
                content: text,
                originalFile: dataUrl,
                fileType: file.type || (isPdf ? 'application/pdf' : 'text/plain'),
                uploadDate: new Date().toLocaleString(),
                teacherName: user.name,
                course: assignment.course,
                section: assignment.section,
                subject: assignment.subject
            };

            setDb(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
            
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Could not process file. Ensure it's a valid document.");
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    };

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    };

    const deleteDoc = (id) => {
        if(window.confirm("Delete this material from the cloud portal?")) {
            setDb(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));
        }
    };

    const myUploads = db.documents.filter(d => d.teacherName === user.name);

    return (
        <div className="space-y-6 sm:space-y-10 flex-col w-full animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="bg-white p-6 sm:p-12 rounded-xl border border-slate-200 w-full shadow-sm">
                <div className="flex items-center mb-8 border-b border-slate-100 pb-5">
                    <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-blue-800 mr-4" strokeWidth={1.5} />
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-wide">Upload to Cloud</h2>
                </div>
                
                <div className="mb-8 sm:mb-10 bg-slate-50 p-5 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">1. Select Target Class & Subject</label>
                    <select 
                        value={selectedAssignmentIdx}
                        onChange={(e) => setSelectedAssignmentIdx(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-4 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                    >
                        {user.assignments.map((assign, idx) => (
                            <option key={idx} value={idx}>
                                {assign.course} • Section {assign.section} — {assign.subject}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 sm:p-16 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors text-center w-full">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mb-5" strokeWidth={1.5} />
                    <p className="text-lg sm:text-2xl font-serif font-bold text-slate-800 mb-2 text-center tracking-wide">Secure File Upload</p>
                    <p className="text-xs sm:text-sm text-slate-500 mb-8 sm:mb-10 font-medium uppercase tracking-widest">Supported formats: PDF, TXT, MD</p>
                    
                    <input type="file" ref={fileInputRef} accept=".txt,.md,.pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={isProcessing}
                        className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900 text-white px-8 sm:px-12 py-4 rounded-lg font-bold uppercase tracking-widest transition-all flex items-center justify-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                        {isProcessing ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Uploading to Cloud...</> : "2. Select & Sync to Cloud"}
                    </button>
                </div>
            </div>

            {myUploads.length > 0 && (
                <div className="bg-white p-6 sm:p-10 rounded-xl border border-slate-200 w-full shadow-sm">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 pb-4 mb-6 border-b border-slate-100 tracking-wide">Live Cloud Materials</h3>
                    <div className="grid gap-4 w-full">
                        {myUploads.map(doc => (
                            <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-white border border-slate-200 hover:border-blue-200 rounded-xl shadow-sm transition-colors gap-5 sm:gap-0 w-full">
                                <div className="flex items-center flex-1 min-w-0">
                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mr-5 border border-blue-100 hidden sm:block shrink-0">
                                        <BookOpen className="w-6 h-6 text-blue-800" strokeWidth={1.5} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-900 text-base sm:text-lg truncate">{doc.name}</h4>
                                        <div className="flex items-center text-[10px] sm:text-xs font-semibold text-slate-500 mt-2 uppercase tracking-widest flex-wrap gap-y-1">
                                            <Tag className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0"/>
                                            <span className="truncate">{doc.course} • Sec {doc.section}</span> <span className="mx-3 text-slate-300">|</span> <span className="truncate">{doc.subject}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => deleteDoc(doc.id)} className="text-red-600 hover:bg-red-50 text-xs sm:text-sm font-bold px-4 py-2.5 border border-transparent hover:border-red-200 rounded-lg transition-colors flex items-center self-start sm:self-auto shrink-0 uppercase tracking-widest">
                                    <Trash2 className="w-4 h-4 mr-2" /> Revoke from Cloud
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- STUDENT PORTAL COMPONENT ---
function StudentPortal({ db, user }) {
    const [selectedDocId, setSelectedDocId] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewMode, setViewMode] = useState('chat'); 
    const chatEndRef = useRef(null);

    const availableDocs = db.documents.filter(d => 
        d.course === user.enrollment.course && d.section === user.enrollment.section
    );

    const selectedDoc = availableDocs.find(d => d.id === selectedDocId);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedDoc || isGenerating) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsGenerating(true);

        const systemPrompt = `
            You are the RIANLearning Assistant, a professional and academic cognitive tutor.
            Your ONLY source of knowledge is the following secured document text regarding the subject: ${selectedDoc.subject}. 
            Do NOT use outside knowledge. 
            If the answer is not contained in the text, you must say "I cannot answer that based on the provided secure course materials."
            Keep your tone academic, helpful, and collegiate.
            
            SECURED DOCUMENT CONTENT:
            """
            ${selectedDoc.content}
            """
        `;

        const response = await callCognitiveEngine(userMsg, systemPrompt);
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
        setIsGenerating(false);
    };

    const handleSummarize = async () => {
        if (!selectedDoc || isGenerating) return;
        setChatHistory(prev => [...prev, { role: 'user', content: "Please generate a comprehensive academic summary of this material." }]);
        setIsGenerating(true);
        const systemPrompt = "You are an educational academic assistant. Summarize the provided text in highly readable bullet points.";
        const userPrompt = `Summarize this text clearly for a university student studying ${selectedDoc.subject}: \n\n${selectedDoc.content}`;
        const response = await callCognitiveEngine(userPrompt, systemPrompt);
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
        setIsGenerating(false);
    };

    if (availableDocs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 sm:py-32 px-4 text-center animate-in fade-in bg-white rounded-xl border border-slate-200 w-full mx-auto shadow-sm">
                <div className="bg-slate-50 p-6 sm:p-10 rounded-full mb-8 border border-slate-200">
                    <Library className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 mb-4 tracking-wide">No Cloud Materials Yet</h2>
                <p className="text-slate-500 max-w-lg font-serif italic text-base sm:text-lg leading-relaxed">
                    Your professors have not synced any materials for <br className="hidden sm:block"/><strong className="text-slate-800 not-italic font-sans">{user.enrollment.course} - Section {user.enrollment.section}</strong> to the cloud yet.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full flex-1 min-h-[60vh] lg:min-h-0 animate-in fade-in duration-500">
            {/* Sidebar: Document Selection */}
            <div className="w-full lg:w-[350px] xl:w-[400px] bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden max-h-[50vh] lg:max-h-none shrink-0 shadow-sm">
                <div className="p-5 sm:p-6 border-b border-slate-200 bg-blue-950 text-white shrink-0">
                    <h3 className="font-serif font-bold flex items-center text-xl tracking-wide">
                        <BookOpen className="w-5 h-5 mr-3 text-blue-300" />
                        Cloud Curriculum
                    </h3>
                    <p className="text-[10px] font-bold text-blue-300 mt-2 uppercase tracking-widest">
                        {user.enrollment.course} • Sec {user.enrollment.section}
                    </p>
                </div>
                <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3 bg-slate-50">
                    {availableDocs.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => {
                                setSelectedDocId(doc.id);
                                setChatHistory([]);
                                setViewMode('chat');
                            }}
                            className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all ${selectedDocId === doc.id ? 'bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-500 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:shadow-sm'}`}
                        >
                            <p className="text-[9px] font-bold text-blue-800 uppercase tracking-widest mb-2 truncate">{doc.subject}</p>
                            <p className="font-bold text-sm sm:text-base leading-snug mb-3 line-clamp-2 text-slate-900">{doc.name}</p>
                            <p className="text-xs text-slate-500 font-serif italic flex items-center truncate">
                                <User className="w-3 h-3 mr-1.5 shrink-0" /> Prof. {doc.teacherName}
                            </p>
                        </button>
                    ))}
                </div>
                
                {selectedDoc && (
                    <div className="p-5 sm:p-6 border-t border-slate-200 bg-white shrink-0">
                        <button onClick={handleSummarize} disabled={isGenerating} className="w-full bg-slate-800 hover:bg-slate-900 text-white border border-slate-900 px-4 py-4 rounded-lg font-bold uppercase tracking-widest transition-all text-xs disabled:opacity-70 flex justify-center items-center shadow-md">
                            <FileText className="w-4 h-4 mr-2" /> Generate Study Notes
                        </button>
                    </div>
                )}
            </div>

            {/* Main Area: Chat Interface */}
            <div className="w-full flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden min-h-[60vh] lg:min-h-0 shadow-sm">
                {!selectedDoc ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                        <GraduationCap className="w-16 h-16 sm:w-24 sm:h-24 mb-6 sm:mb-8 opacity-20" strokeWidth={1} />
                        <p className="text-lg sm:text-2xl font-serif text-slate-500 tracking-wide">Select cloud material to begin.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-5 sm:p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between z-10 gap-4 sm:gap-0 shrink-0">
                            <div className="min-w-0">
                                <h3 className="font-serif font-bold text-slate-900 text-xl sm:text-2xl flex items-center flex-wrap gap-3 truncate tracking-wide">
                                    Cognitive Assistant 
                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-900 text-[9px] uppercase tracking-widest rounded-md font-bold border border-blue-200 shrink-0 font-sans">
                                        {selectedDoc.subject}
                                    </span>
                                </h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-2 font-mono flex items-center truncate max-w-full tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" /> CLOUD SECURE: {selectedDoc.name}
                                </p>
                            </div>
                            <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 self-start sm:self-auto shrink-0">
                                <button 
                                    onClick={() => setViewMode('chat')}
                                    className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-md transition-all flex items-center ${viewMode === 'chat' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> Tutor
                                </button>
                                <button 
                                    onClick={() => setViewMode('document')}
                                    className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-md transition-all flex items-center ${viewMode === 'document' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> Document
                                </button>
                            </div>
                        </div>

                        {viewMode === 'chat' ? (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-6 sm:space-y-8 bg-slate-50/50">
                                    {chatHistory.length === 0 ? (
                                        <div className="text-center text-slate-500 mt-8 sm:mt-20 max-w-lg mx-auto px-4">
                                            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 mb-8 shadow-sm">
                                                <Library className="w-10 h-10 sm:w-12 sm:h-12 text-blue-800 mx-auto mb-5" strokeWidth={1.5} />
                                                <p className="font-serif font-bold text-slate-900 text-lg sm:text-xl mb-3 tracking-wide">Greetings, {user.name.split(' ')[0]}</p>
                                                <p className="text-sm leading-relaxed text-slate-500 font-serif italic">The intelligent assistant has cognitively processed <br/><strong className="text-slate-800 not-italic mt-2 inline-block font-sans">{selectedDoc.name}</strong>.</p>
                                            </div>
                                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">Inquire regarding the text above</p>
                                        </div>
                                    ) : (
                                        chatHistory.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-5 sm:px-8 py-4 sm:py-5 shadow-sm ${
                                                    msg.role === 'user' ? 'bg-blue-800 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                                                }`}>
                                                    <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-medium break-words" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-900">$1</strong>') }} />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {isGenerating && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-6 py-5 shadow-sm flex items-center space-x-3">
                                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-300 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-5 sm:p-6 border-t border-slate-200 bg-white shrink-0">
                                    <form onSubmit={handleSendMessage} className="flex space-x-3 sm:space-x-4">
                                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Inquire regarding ${selectedDoc.subject}...`} disabled={isGenerating} className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-5 sm:px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400 font-medium text-sm sm:text-base text-slate-900 placeholder-slate-400 shadow-sm" />
                                        <button type="submit" disabled={!inputValue.trim() || isGenerating} className="bg-blue-800 hover:bg-blue-900 text-white border border-blue-900 px-6 sm:px-8 py-4 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0">
                                            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-hidden p-5 sm:p-8 bg-slate-100 flex flex-col">
                                {selectedDoc.originalFile ? (
                                    selectedDoc.fileType === 'application/pdf' ? (
                                        <object data={selectedDoc.originalFile} type="application/pdf" className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-sm">
                                            <div className="p-10 text-center font-medium text-slate-500 text-sm">Browser PDF viewer disabled on mobile/embedded preview.</div>
                                        </object>
                                    ) : (
                                        <div className="bg-white p-6 sm:p-10 rounded-xl border border-slate-300 whitespace-pre-wrap font-mono text-xs sm:text-sm overflow-y-auto h-full text-slate-700 leading-relaxed shadow-sm">
                                            {selectedDoc.content}
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-white p-6 sm:p-10 rounded-xl border border-slate-300 flex flex-col h-full shadow-sm">
                                        <div className="bg-amber-50 text-amber-900 p-4 sm:p-5 rounded-lg mb-5 sm:mb-8 text-xs sm:text-sm border border-amber-200 font-medium flex items-start">
                                            <span className="text-amber-500 mr-3 text-base">⚠️</span> 
                                            Original file preview unavailable (file may have been too large to safely render). Viewing the raw extracted cognitive text instead.
                                        </div>
                                        <div className="whitespace-pre-wrap font-mono text-xs sm:text-sm overflow-y-auto flex-1 bg-slate-50 p-5 sm:p-8 rounded-lg border border-slate-200 text-slate-600 leading-relaxed shadow-inner">
                                            {selectedDoc.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}