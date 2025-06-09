import React, { useEffect, useState } from 'react';
import {
    Table,
    Typography,
    Tag,
    Card,
    Row,
    Col,
    Button,
    Space,
    Tooltip,
    Modal,
    Form,
    Input,
    Select,
    Popconfirm,
    message,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

interface Pegawai {
    id: number;
    nama: string;
    email: string;
    posisi: string;
    password?: string;
    jurusan?: string;
    pendidikan_terakhir?: string;
    umur?: number;
    nilai?: number;
    sertifikasi: number;
    b1: number;
    b2: number;
    b3: number;
    b4: number;
    b5: number;
    a1: number;
    a2: number;
    a3: number;
    a4: number;
    a5: number;
    statusAkun: 'Aktif' | 'Tidak Aktif';
    tempat_lahir?: string;
    tanggal_lahir?: string;
    no_telepon?: string;
    jabatan?: string;
}

const ManajemenUser: React.FC = () => {
    const [data, setData] = useState<Pegawai[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
    const [form] = Form.useForm();
    const [filterText, setFilterText] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3002/pegawai');
            const formatted = res.data.map((item: any) => ({
                ...item,
                statusAkun: item.sertifikasi ? 'Aktif' : 'Tidak Aktif',
            }));
            setData(formatted);
        } catch (err) {
            message.error('Gagal mengambil data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:3002/pegawai/${id}`);
            message.success('Data dihapus');
            fetchData();
        } catch {
            message.error('Gagal hapus data');
        }
    };

    const showModal = (record?: Pegawai) => {
        setEditingPegawai(record || null);
        if (record) form.setFieldsValue(record);
        else form.resetFields();
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const finalValues = {
                ...values,
                sertifikasi: values.statusAkun === 'Aktif' ? 1 : 0,
                b1: 1, b2: 1, b3: 1, b4: 1, b5: 1,
                a1: Math.round(Math.random()), a2: Math.round(Math.random()),
                a3: Math.round(Math.random()), a4: Math.round(Math.random()), a5: Math.round(Math.random()),
            };

            if (editingPegawai) {
                await axios.put(`http://localhost:3002/pegawai/${editingPegawai.id}`, {
                    ...editingPegawai,
                    ...finalValues,
                });
                message.success('Data diperbarui');
            } else {
                await axios.post(`http://localhost:3002/pegawai`, finalValues);
                message.success('Data ditambahkan');
            }

            setIsModalVisible(false);
            fetchData();
        } catch {
            message.error('Gagal menyimpan data');
        }
    };

    const renderPelatihanTag = (label: string, value: number) => (
        <Tag color={value ? 'blue' : 'default'}>{label}</Tag>
    );

    const columns = [
        {
            title: 'Nama Pegawai',
            dataIndex: 'nama',
            key: 'nama',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Posisi',
            dataIndex: 'posisi',
            key: 'posisi',
        },
        {
            title: 'Sertifikasi',
            dataIndex: 'sertifikasi',
            key: 'sertifikasi',
            render: (v: number) =>
                <Tag color={v ? 'green' : 'volcano'}>{v ? 'Sudah' : 'Belum'}</Tag>
        },
        {
            title: 'Pelatihan Dasar',
            key: 'pelatihanDasar',
            render: (record: Pegawai) => (
                <Space wrap>
                    {renderPelatihanTag('B1', record.b1)}
                    {renderPelatihanTag('B2', record.b2)}
                    {renderPelatihanTag('B3', record.b3)}
                    {renderPelatihanTag('B4', record.b4)}
                    {renderPelatihanTag('B5', record.b5)}
                </Space>
            ),
        },
        {
            title: 'Pelatihan Advance',
            key: 'pelatihanAdvance',
            render: (record: Pegawai) => (
                <Space wrap>
                    {renderPelatihanTag('A1', record.a1)}
                    {renderPelatihanTag('A2', record.a2)}
                    {renderPelatihanTag('A3', record.a3)}
                    {renderPelatihanTag('A4', record.a4)}
                    {renderPelatihanTag('A5', record.a5)}
                </Space>
            ),
        },
        {
            title: 'Status Akun',
            dataIndex: 'statusAkun',
            key: 'statusAkun',
            render: (status: string) => (
                <Tag color={status === 'Aktif' ? 'green' : 'volcano'}>{status}</Tag>
            ),
        },
        {
            title: 'Aksi',
            key: 'aksi',
            render: (_: any, record: Pegawai) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Hapus">
                        <Popconfirm
                            title="Yakin ingin menghapus?"
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button type="link" icon={<DeleteOutlined />} danger />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filteredData = data.filter(item =>
        item.nama.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
            <Card style={{ borderRadius: 10 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Title level={4}>Manajemen User</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Input.Search
                                placeholder="Cari nama pegawai"
                                allowClear
                                onChange={e => setFilterText(e.target.value)}
                                style={{ width: 200 }}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showModal()}
                            >
                                Tambah User
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    bordered
                    loading={loading}
                    scroll={{ x: true }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ paddingLeft: 24 }}>
                                <p><strong>Tempat Lahir:</strong> {record.tempat_lahir}</p>
                                <p><strong>Tanggal Lahir:</strong> {record.tanggal_lahir}</p>
                                <p><strong>Nomor Telepon:</strong> {record.no_telepon}</p>
                                <p><strong>Jabatan:</strong> {record.jabatan}</p>
                                <p><strong>Jurusan:</strong> {record.jurusan}</p>
                                <p><strong>Pendidikan Terakhir:</strong> {record.pendidikan_terakhir}</p>
                                <p><strong>Umur:</strong> {record.umur}</p>
                            </div>
                        ),
                    }}
                />
            </Card>

            {/* Modal Form */}
            <Modal
                title={editingPegawai ? 'Edit User' : 'Tambah User'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Simpan"
                cancelText="Batal"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item name="nama" label="Nama" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="posisi" label="Posisi" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="statusAkun" label="Status Akun" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Aktif">Aktif</Option>
                            <Option value="Tidak Aktif">Tidak Aktif</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManajemenUser;
    