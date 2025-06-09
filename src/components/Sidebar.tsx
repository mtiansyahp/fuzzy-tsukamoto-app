import React from 'react';
import { Menu, Button } from 'antd';
import {
    DashboardOutlined,
    TableOutlined,
    UserOutlined,
    MacCommandOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/penilaian',
            icon: <TableOutlined />,
            label: 'Penilaian',
        },
        {
            key: '/manajemen-user',
            icon: <UserOutlined />,
            label: 'Manajemen User',
        },
        {
            key: '/about',
            icon: <MacCommandOutlined />,
            label: 'About',
        },
    ];

    const handleLogout = () => {
        // Bersihkan token jika pakai auth
        // localStorage.removeItem('token');
        navigate('/'); // atau redirect ke /login
    };

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#001529',
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
                    src="/logo192.png"
                    alt="Logo"
                    style={{
                        width: 48,
                        height: 48,
                        objectFit: 'contain',
                    }}
                />
            </div>

            {/* Menu */}
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                style={{ flex: 1, paddingTop: 12 }}
                items={menuItems.map((item) => ({
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    onClick: () => navigate(item.key),
                }))}
            />

            {/* Logout Button */}
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button
                    type="primary"
                    icon={<LogoutOutlined />}
                    danger
                    block
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}

export default Sidebar;
