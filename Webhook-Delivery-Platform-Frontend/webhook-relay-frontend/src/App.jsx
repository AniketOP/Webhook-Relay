import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Deliveries from './pages/Deliveries';
import Subscribers from './pages/Subscribers';
import Events from './pages/Events';
import CircuitBreakers from './pages/CircuitBreakers';
import Settings from './pages/Settings';

const pageVariants = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                element={<PageWrapper><Overview /></PageWrapper>} />
          <Route path="/deliveries"      element={<PageWrapper><Deliveries /></PageWrapper>} />
          <Route path="/subscribers"     element={<PageWrapper><Subscribers /></PageWrapper>} />
          <Route path="/events"          element={<PageWrapper><Events /></PageWrapper>} />
          <Route path="/circuit-breakers" element={<PageWrapper><CircuitBreakers /></PageWrapper>} />
          <Route path="/settings"        element={<PageWrapper><Settings /></PageWrapper>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
