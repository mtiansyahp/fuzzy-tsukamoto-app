// src/pages/Login.tsx
import React from 'react';
import { Row, Col, Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const API_URL = 'http://localhost:3002';  // ← panggil port 3002

export function Login() {
    const navigate = useNavigate();

    const onFinish = async (values: { email: string; password: string }) => {
        const { email, password } = values;

        try {
            // 1) Cek di /pegawai
            const pegResp = await axios.get(
                `${API_URL}/pegawai`,
                { params: { email, password } }
            );

            if (pegResp.data.length > 0) {
                const user = pegResp.data[0];
                localStorage.setItem('userId', user.id);
                localStorage.setItem('userRole', user.role);
                message.success(`Login berhasil sebagai ${user.role}`);
                return navigate(user.role === 'atasan'
                    ? '/atasan/dashboard'
                    : '/pegawai/dashboard'
                );
            }

            // 2) Cek di /admin
            const adminResp = await axios.get(
                `${API_URL}/admin`,
                { params: { email, password } }
            );

            if (adminResp.data.length > 0) {
                const admin = adminResp.data[0];
                localStorage.setItem('userId', admin.id);
                localStorage.setItem('userRole', admin.role);
                message.success('Login berhasil sebagai admin');
                return navigate('/admin/dashboard');
            }

            // 3) Gagal login
            message.error('Email atau password salah');
        } catch (err) {
            console.error(err);
            message.error('Gagal terhubung ke server');
        }
    };

    return (
        <Row style={{ minHeight: '100vh' }}>
            <Col xs={0} md={12} style={{ backgroundColor: '#e0e0e0' }} />
            <Col
                xs={24} md={12}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0 24px',
                }}
            >
                <div style={{ width: '100%', maxWidth: 360 }}>
                    <Title level={4} style={{
                        textAlign: 'center',
                        marginBottom: 32,
                        fontWeight: 500
                    }}>
                        LOGIN PAGE
                    </Title>
                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: 'Mohon masukkan email' }]}
                        >
                            <Input
                                placeholder="Email"
                                size="large"
                                style={{ borderRadius: 4, background: '#fafafa' }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Mohon masukkan password' }]}
                        >
                            <Input.Password
                                placeholder="Password"
                                size="large"
                                style={{ borderRadius: 4, background: '#fafafa' }}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                style={{ borderRadius: 4 }}
                            >
                                LOGIN
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Col>
        </Row>
    );
}
