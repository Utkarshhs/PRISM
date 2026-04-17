import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Layout/Navbar';
import MainPage from './pages/MainPage';
import LandingPage from './pages/LandingPage';
import useStore from './store';

export default function App() {
  const { showLanding, setShowLanding } = useStore();

  const handleEnterDashboard = () => {
    setShowLanding(false);
  };

  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LandingPage onEnter={handleEnterDashboard} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar />
          <MainPage />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
