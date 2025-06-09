import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Penilaian from '../pages/Penilaian';
import ManajemenUser from '../pages/ManajemenUser'; // ✅ Tambahkan

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/penilaian" element={<Penilaian />} />
            <Route path="/manajemen-user" element={<ManajemenUser />} /> {/* ✅ Baru */}
        </Routes>
    );
};

export default AppRoutes;
