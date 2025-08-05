import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import AddHabitPage from './pages/AddHabitPage';
import { Toaster } from "@/components/ui/sonner";
import { SessionContextProvider } from './components/SessionContextProvider';
import Login from './pages/Login';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/add-habit" element={<AddHabitPage />} />
          {/* <Route path="/habit/:id" element={<HabitDetailsPage />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Routes>
        <Toaster />
        <footer className="text-center p-4 text-gray-600 dark:text-gray-400 text-sm">
          <p>Free app by Max Abardo.</p>
          <p>
            Donate on{' '}
            <a
              href="https://ko-fi.com/maxabardo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Ko-fi
            </a>
            .
          </p>
        </footer>
      </Router>
    </SessionContextProvider>
  );
}

export default App;