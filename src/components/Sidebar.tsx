// src/components/Sidebar.tsx
import React, { useState, useMemo } from 'react';
import { Menu, Button } from 'antd';
import {
    DashboardOutlined,
    TableOutlined,
    UserOutlined,
    MacCommandOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const allMenuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/penilaian', icon: <TableOutlined />, label: 'Penilaian' },
    { key: '/manajemen-user', icon: <UserOutlined />, label: 'Manajemen User' },
    { key: '/about', icon: <MacCommandOutlined />, label: 'About' },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    // Ambil role langsung dari localStorage
    const role = localStorage.getItem('userRole') || 'pegawai';

    // Tentukan menu yang boleh dilihat tiap role
    const allowedKeysByRole: Record<string, string[]> = {
        pegawai: ['/', '/penilaian', '/about'],
        atasan: ['/', '/penilaian', '/about'],
        admin: allMenuItems.map(item => item.key),
    };

    // Filter menu sesuai role
    const menuItems = useMemo(
        () =>
            allMenuItems
                .filter(item => allowedKeysByRole[role]?.includes(item.key))
                .map(item => ({
                    ...item,
                    onClick: () => navigate(item.key),
                })),
        [role, navigate]
    );

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div
            style={{
                width: collapsed ? 80 : 200,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#001529',
                transition: 'width 0.2s',
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: '24px 0',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                        width: collapsed ? 40 : 40,
                        height: 40,
                        objectFit: 'cover',
                        objectPosition: 'left center',
                        transition: 'width 0.2s',
                    }}
                />
            </div>

            {/* Menu */}
            <Menu
                theme="dark"
                mode="inline"
                inlineCollapsed={collapsed}
                selectedKeys={[location.pathname]}
                style={{ flex: 1, paddingTop: 12 }}
                items={menuItems}
            />

            {/* Logout */}
            <div
                style={{
                    marginTop: 'auto',
                    padding: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <Button
                    type="primary"
                    icon={<LogoutOutlined />}
                    danger
                    block
                    onClick={handleLogout}
                >
                    {!collapsed && 'Logout'}
                </Button>
            </div>
        </div>
    );
}

export default Sidebar;
