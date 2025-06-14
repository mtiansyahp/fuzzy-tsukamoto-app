import React, { useEffect, useMemo, useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    Space,
    Popconfirm,
    message,
    Typography,
    Switch,
    Collapse
} from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Penilaian {
    created_at: any;
    updated_at: any;
    id: string;
    nama: string;
    skor: number;
    keterangan: string;
    pelatihan_id: string;
    perhitungan: Record<string, number>;  // <— tambah ini
}


interface Pegawai {
    id: number;
    nama: string;
    jurusan: string;
    pendidikan_terakhir: string;
    posisi: string;
    umur: number;
    // sesuai JSON Anda, Pegawai juga punya properti:
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
    sertifikasi: number;
    ikut_pelatihan: number;
    // sisanya tidak dipakai untuk perhitungan fuzzy (tapi tetap ada di BE):
    [key: string]: any;
}

interface Pelatihan {
    id: string;
    nama_pelatihan: string;
    tanggal: string;
    deskripsi: string;
    syarat: string;
    kualifikasi: string;
    peserta: number[];
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
    sertifikasi: number;
    ikut_pelatihan: number;
    pendidikan_terakhir: string;
    jurusan: string;
    posisi: string;
    max_umur: number;
}

export default function PenilaianPelatihan() {
    const role = localStorage.getItem('userRole');
    const isPegawai = role === 'pegawai';
    const [penilaianData, setPenilaianData] = useState<Penilaian[]>([]);
    const [pelatihanData, setPelatihanData] = useState<Pelatihan[]>([]);
    const [pegawaiData, setPegawaiData] = useState<Pegawai[]>([]);
    const [loading, setLoading] = useState(false);

    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<any>(null);

    const [isPenilaianModalVisible, setPenilaianModalVisible] = useState(false);
    const [editingPenilaian, setEditingPenilaian] = useState<Penilaian | null>(null);
    const [penilaianForm] = Form.useForm();

    const [isPelatihanModalVisible, setPelatihanModalVisible] = useState(false);
    const [editingPelatihan, setEditingPelatihan] = useState<Pelatihan | null>(null);
    const [pelatihanForm] = Form.useForm();

    const [selectedPeserta, setSelectedPeserta] = useState<Pegawai[]>([]);
    const [isPesertaModalVisible, setPesertaModalVisible] = useState(false);

    const baseUrl = 'http://localhost:3002';

    useEffect(() => {
        fetchData();
    }, []);

    const summaryColumns = [
        { title: 'Pelatihan', dataIndex: 'nama_pelatihan', key: 'nama_pelatihan' },
        { title: 'Tanggal Proses', dataIndex: 'tanggal_proses', key: 'tanggal_proses' },
        { title: 'Total Pegawai', dataIndex: 'total', key: 'total' },
        {
            title: 'Aksi',
            key: 'aksi',
            render: (_: any, row: any) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedSummary(row);
                        setSummaryModalVisible(true);
                    }}
                    type="link"
                />
            ),
        },
    ];


    // state untuk summary
    const [summaryModalVisible, setSummaryModalVisible] = useState(false);
    const [selectedSummary, setSelectedSummary] = useState<{
        nama_pelatihan: string;
        tanggal_proses: string;
        total: number;
        scores: Penilaian[];
    } | null>(null);

    // build summaryData: satu entry per pelatihan_id
    const summaryData = useMemo(() => {
        // group penilaianData per pelatihan_id
        const map = new Map<string, Penilaian[]>();
        penilaianData.forEach(p => {
            if (!map.has(p.pelatihan_id)) map.set(p.pelatihan_id, []);
            map.get(p.pelatihan_id)!.push(p);
        });

        // for each grup, cari nama pelatihan + tanggal_proses + total
        return Array.from(map.entries()).map(([pelId, grup]) => {
            const pel = pelatihanData.find(pl => pl.id === pelId);
            const tanggalProses = grup[0].created_at ?? grup[0].updated_at ?? '-';
            return {
                key: pelId,
                nama_pelatihan: pel?.nama_pelatihan ?? pelId,
                tanggal_proses: tanggalProses.split('T')[0],
                total: grup.length,
                scores: grup,
            };
        });
    }, [penilaianData, pelatihanData]);




    const fetchData = async () => {
        setLoading(true);
        try {
            const [resPenilaian, resPelatihan, resPegawai] = await Promise.all([
                axios.get(`${baseUrl}/penilaian`),
                axios.get(`${baseUrl}/pelatihan`),
                axios.get(`${baseUrl}/pegawai`),
            ]);
            setPenilaianData(resPenilaian.data);
            setPelatihanData(resPelatihan.data);
            setPegawaiData(resPegawai.data);
        } catch {
            message.error('Gagal memuat data dari server');
        } finally {
            setLoading(false);
        }
    };

    // === PENILAIAN ===
    const showPenilaianModal = () => {
        setEditingPenilaian(null);
        penilaianForm.resetFields();
        setPenilaianModalVisible(true);
    };

    const handlePenilaianSubmit = async () => {
        try {
            const values = await penilaianForm.validateFields();
            if (editingPenilaian) {
                await axios.put(`${baseUrl}/penilaian/${editingPenilaian.id}`, values);
                message.success('Penilaian diperbarui');
            } else {
                await axios.post(`${baseUrl}/penilaian`, values);
                message.success('Penilaian ditambahkan');
            }
            setPenilaianModalVisible(false);
            fetchData();
        } catch {
            message.error('Gagal menyimpan penilaian');
        }
    };

    const handlePenilaianEdit = (record: Penilaian) => {
        setEditingPenilaian(record);
        penilaianForm.setFieldsValue(record);
        setPenilaianModalVisible(true);
    };

    const handlePenilaianDelete = async (id: string) => {
        await axios.delete(`${baseUrl}/penilaian/${id}`);
        message.success('Penilaian dihapus');
        fetchData();
    };

    const handleViewDetail = (record: Penilaian) => {
        const pegawai = pegawaiData.find((p) => record.nama === p.nama);
        const pelatihan = pelatihanData.find((p) => record.pelatihan_id === p.id);

        if (!pegawai || !pelatihan) {
            message.error('Data pegawai atau pelatihan tidak ditemukan');
            return;
        }

        // Ambil setiap komponen perhitungan Fuzzy Tsukamoto:
        const T1 = calculateComponentT1(pegawai, pelatihan);
        const T2 = calculateComponentT2(pegawai, pelatihan);
        const Pendidikan = calculateComponentPendidikan(pegawai, pelatihan);
        const Umur = calculateComponentUmur(pegawai, pelatihan);
        const Sertifikasi = pelatihan.sertifikasi === pegawai.sertifikasi ? 1 : 0;
        const PernahPelatihan =
            pelatihan.ikut_pelatihan === pegawai.ikut_pelatihan ? 1 : 0;
        const Jurusan = pegawai.jurusan.toLowerCase() === pelatihan.jurusan.toLowerCase() ? 1 : 0;
        const Posisi = pegawai.posisi.toLowerCase() === pelatihan.posisi.toLowerCase()
            ? 1
            : pegawai.posisi.toLowerCase().includes(pelatihan.posisi.toLowerCase())
                ? 0.7
                : 0;

        const detail = {
            ...record,
            pegawai,
            pelatihan,
            perhitungan: {
                T1,
                T2,
                Pendidikan,
                Umur,
                Sertifikasi,
                PernahPelatihan,
                Jurusan,
                Posisi,
            },
        };

        setSelectedDetail(detail);
        setDetailVisible(true);
    };

    const penilaianColumns = [
        { title: 'Nama', dataIndex: 'nama' },
        { title: 'Skor', dataIndex: 'skor' },
        { title: 'Keterangan', dataIndex: 'keterangan' },
        {
            title: 'Aksi',
            render: (_: any, record: Penilaian) => (
                <Space>
                    <Button type="link" onClick={() => handleViewDetail(record)}>
                        View
                    </Button>

                    {/* hanya untuk atasan/admin */}
                    {!isPegawai && (
                        <>
                            <Button type="link" onClick={() => handlePenilaianEdit(record)}>
                                Edit
                            </Button>
                            <Popconfirm
                                title="Yakin hapus?"
                                onConfirm={() => handlePenilaianDelete(record.id)}
                            >
                                <Button type="link" danger>
                                    Hapus
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];


    // === PELATIHAN ===
    const showPelatihanModal = () => {
        setEditingPelatihan(null);
        pelatihanForm.resetFields();
        setPelatihanModalVisible(true);
    };



    const handlePelatihanSubmit = async () => {
        try {
            const values = await pelatihanForm.validateFields();
            const booleanFields = [
                'a1',
                'a2',
                'a3',
                'a4',
                'a5',
                'b1',
                'b2',
                'b3',
                'b4',
                'b5',
                'sertifikasi',
                'ikut_pelatihan',
            ];

            const formatted: any = {
                ...values,
                tanggal: values.tanggal.format('YYYY-MM-DD'),
                peserta: JSON.parse(values.peserta),
            };
            booleanFields.forEach((k) => {
                formatted[k] = values[k] ? 1 : 0;
            });

            if (editingPelatihan) {
                await axios.put(`${baseUrl}/pelatihan/${editingPelatihan.id}`, formatted);
                message.success('Pelatihan diperbarui');
            } else {
                await axios.post(`${baseUrl}/pelatihan`, formatted);
                message.success('Pelatihan ditambahkan');
            }
            setPelatihanModalVisible(false);
            fetchData();
        } catch {
            message.error('Gagal menyimpan pelatihan');
        }
    };

    const handlePelatihanEdit = (record: Pelatihan) => {
        const booleanFields = [
            'a1',
            'a2',
            'a3',
            'a4',
            'a5',
            'b1',
            'b2',
            'b3',
            'b4',
            'b5',
            'sertifikasi',
            'ikut_pelatihan',
        ];
        const boolValues: any = {};
        booleanFields.forEach((key) => {
            boolValues[key] = record[key as keyof Pelatihan] === 1;
        });

        setEditingPelatihan(record);
        pelatihanForm.setFieldsValue({
            ...record,
            peserta: JSON.stringify(record.peserta),
            tanggal: dayjs(record.tanggal),
            ...boolValues,
        });
        setPelatihanModalVisible(true);
    };

    const handlePelatihanDelete = async (id: string) => {
        await axios.delete(`${baseUrl}/pelatihan/${id}`);
        message.success('Pelatihan dihapus');
        fetchData();
    };

    /** 
     * HITUNG T1 = rata‐rata dari b1..b5 
     * (nilai 1 jika pegawai.bX === pelatihan.bX, jamak 5 kunci)
     */
    const calculateComponentT1 = (pegawai: Pegawai, pelatihan: Pelatihan): number => {
        const keys: Array<'b1' | 'b2' | 'b3' | 'b4' | 'b5'> = ['b1', 'b2', 'b3', 'b4', 'b5'];
        const match: number[] = keys.map((k) =>
            // pastikan kita membandingkan angka, bukan string
            Number(pegawai[k]) === Number(pelatihan[k]) ? 1 : 0
        );
        const T1 = match.reduce((a, b) => a + b, 0) / match.length;
        console.log(`T1 (${pegawai.nama}):`, T1.toFixed(4), '⟐ pegawai =', keys.map((k) => pegawai[k]), '⟐ pelatihan =', keys.map((k) => pelatihan[k]));
        return T1;
    };

    /**
     * HITUNG T2 = rata‐rata dari { aX : pelatihan.aX===1 } 
     * (hanya ambil aX yang di‐on di pelatihan)
     */
    const calculateComponentT2 = (pegawai: Pegawai, pelatihan: Pelatihan): number => {
        const keys: Array<'a1' | 'a2' | 'a3' | 'a4' | 'a5'> = ['a1', 'a2', 'a3', 'a4', 'a5'];
        // ambil hanya aX yang aktif (===1) di pelatihan
        const activeKeys = keys.filter((k) => Number(pelatihan[k]) === 1);
        if (activeKeys.length === 0) {
            console.log(`T2 (${pegawai.nama}): 1.0000 (tidak ada kriteria a*)`);
            return 1;
        }
        const match: number[] = activeKeys.map((k) =>
            Number(pegawai[k]) === 1 ? 1 : 0
        );
        const T2 = match.reduce((a, b) => a + b, 0) / match.length;
        console.log(
            `T2 (${pegawai.nama}):`,
            T2.toFixed(4),
            '⟐ pegawai a* =',
            activeKeys.map((k) => pegawai[k]),
            '⟐ pelatihan a* =',
            activeKeys.map((k) => pelatihan[k])
        );
        return T2;
    };

    /**
     * HITUNG Pendidikan = 1 − (|index(pegawai.pendidikan) − index(pelatihan.pendidikan)| / 4)
     * di mana urutan = ['D3','D4','S1','S2','S3']
     */
    const calculateComponentPendidikan = (pegawai: Pegawai, pelatihan: Pelatihan): number => {
        const urutan = ['D3', 'D4', 'S1', 'S2', 'S3'];
        const i1 = urutan.indexOf(pegawai.pendidikan_terakhir.toUpperCase());
        const i2 = urutan.indexOf(pelatihan.pendidikan_terakhir.toUpperCase());
        const Pendidikan =
            i1 >= 0 && i2 >= 0 ? 1 - Math.abs(i1 - i2) / (urutan.length - 1) : 0;
        console.log(
            `Pendidikan (${pegawai.nama}):`,
            Pendidikan.toFixed(4),
            '⟐ pegawai =',
            pegawai.pendidikan_terakhir.toUpperCase(),
            '⟐ pelatihan =',
            pelatihan.pendidikan_terakhir.toUpperCase()
        );
        return Pendidikan;
    };

    /**
     * HITUNG Umur = 1 jika pegawai.umur ≤ pelatihan.max_umur,
     *   kalau lebih : max(0, 1 − (pegawai.umur − pelatihan.max_umur)/20)
     */
    const calculateComponentUmur = (pegawai: Pegawai, pelatihan: Pelatihan): number => {
        const Umur =
            pegawai.umur <= pelatihan.max_umur
                ? 1
                : Math.max(0, 1 - (pegawai.umur - pelatihan.max_umur) / 20);
        console.log(
            `Umur (${pegawai.nama}):`,
            Umur.toFixed(4),
            '⟐ pegawai.umur =',
            pegawai.umur,
            '⟐ pelatihan.max_umur =',
            pelatihan.max_umur
        );
        return Umur;
    };

    const showPesertaModal = async (record: Pelatihan) => {
        try {
            let dataPegawai: Pegawai[] = [];

            if (pegawaiData.length === 0) {
                const res = await axios.get(`${baseUrl}/pegawai`);
                dataPegawai = res.data;
                setPegawaiData(res.data);
            } else {
                dataPegawai = pegawaiData;
            }

            const pesertaIds = parsePeserta(record.peserta);
            const pesertaDetail = dataPegawai
                .filter((p) => pesertaIds.includes(Number(p.id)))
                .map((pegawai) => {
                    const penilaian = penilaianData.find(
                        (pn) => pn.nama === pegawai.nama && pn.pelatihan_id === record.id
                    );
                    return {
                        ...pegawai,
                        skor: penilaian?.skor ?? null,
                    };
                });

            setSelectedPeserta(pesertaDetail);
            setPesertaModalVisible(true);
        } catch (err) {
            console.error('❌ Gagal ambil peserta:', err);
            message.error('Gagal menampilkan peserta');
        }
    };


    const pelatihanColumns = [
        { title: 'Nama Pelatihan', dataIndex: 'nama_pelatihan' },
        { title: 'Tanggal', dataIndex: 'tanggal' },
        { title: 'Deskripsi', dataIndex: 'deskripsi' },
        {
            title: 'Lihat Peserta',
            render: (_: any, record: Pelatihan) => (
                <Button icon={<EyeOutlined />} onClick={() => showPesertaModal(record)} />
            ),
        },
        {
            title: 'Proses',
            render: (_: any, record: Pelatihan) => (
                <Button
                    type="primary"
                    loading={loading}
                    onClick={() => handleProsesPenilaian(record)}
                >
                    Proses Penilaian
                </Button>
            ),
        },
        {
            title: 'Aksi',
            render: (_: any, record: Pelatihan) => (
                <Space>
                    {/* hanya untuk atasan/admin */}
                    {!isPegawai && (
                        <>
                            <Button type="link" onClick={() => handlePelatihanEdit(record)}>
                                Edit
                            </Button>
                            <Popconfirm
                                title="Yakin hapus?"
                                onConfirm={() => handlePelatihanDelete(record.id)}
                            >
                                <Button type="link" danger>
                                    Hapus
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];


    /**
     * HITUNG keseluruhan skor menggunakan Tsukamoto:
     * 1) panggil calculateComponentT1.. calculateComponentUmur
     * 2) hitung Sertifikasi, PernahPelatihan, Jurusan, Posisi
     * 3) skor = rata‐rata semua 8 komponen
     */
    const calculateTsukamotoScore = (
        pegawai: Pegawai,
        pelatihan: Pelatihan
    ): {
        nilai: number;
        keterangan: string;
        detail: Record<string, number>;
    } => {
        // 1. T1
        const T1 = calculateComponentT1(pegawai, pelatihan);

        // 2. T2
        const T2 = calculateComponentT2(pegawai, pelatihan);

        // 3. Pendidikan
        const Pendidikan = calculateComponentPendidikan(pegawai, pelatihan);

        // 4. Umur
        const Umur = calculateComponentUmur(pegawai, pelatihan);

        // 5. Sertifikasi
        const Sertifikasi =
            Number(pegawai.sertifikasi) === Number(pelatihan.sertifikasi) ? 1 : 0;
        console.log(
            `Sertifikasi (${pegawai.nama}):`,
            Sertifikasi.toFixed(4),
            '⟐ pegawai.sertifikasi =',
            pegawai.sertifikasi,
            '⟐ pelatihan.sertifikasi =',
            pelatihan.sertifikasi
        );

        // 6. PernahPelatihan
        const PernahPelatihan =
            Number(pegawai.ikut_pelatihan) === Number(pelatihan.ikut_pelatihan) ? 1 : 0;
        console.log(
            `PernahPelatihan (${pegawai.nama}):`,
            PernahPelatihan.toFixed(4),
            '⟐ pegawai.ikut_pelatihan =',
            pegawai.ikut_pelatihan,
            '⟐ pelatihan.ikut_pelatihan =',
            pelatihan.ikut_pelatihan
        );

        // 7. Jurusan
        const Jurusan =
            pegawai.jurusan.toLowerCase() === pelatihan.jurusan.toLowerCase() ? 1 : 0;
        console.log(
            `Jurusan (${pegawai.nama}):`,
            Jurusan.toFixed(4),
            '⟐ pegawai.jurusan =',
            pegawai.jurusan,
            '⟐ pelatihan.jurusan =',
            pelatihan.jurusan
        );

        // 8. Posisi
        const pegPos = pegawai.posisi.toLowerCase();
        const pelPos = pelatihan.posisi.toLowerCase();
        const Posisi = pegPos === pelPos ? 1 : pegPos.includes(pelPos) ? 0.7 : 0;
        console.log(
            `Posisi (${pegawai.nama}):`,
            Posisi.toFixed(4),
            '⟐ pegawai.posisi =',
            pegawai.posisi,
            '⟐ pelatihan.posisi =',
            pelatihan.posisi
        );

        const komponen = {
            T1,
            T2,
            Pendidikan,
            Umur,
            Sertifikasi,
            PernahPelatihan,
            Jurusan,
            Posisi,
        };
        const skor = Object.values(komponen).reduce((a, b) => a + b, 0) / Object.keys(komponen).length;
        const skorFinal = parseFloat((skor * 100).toFixed(2));

        const keterangan =
            skorFinal >= 85
                ? 'Sangat Baik'
                : skorFinal >= 75
                    ? 'Baik'
                    : skorFinal >= 65
                        ? 'Cukup'
                        : skorFinal >= 50
                            ? 'Kurang'
                            : 'Sangat Kurang';

        return {
            nilai: skorFinal,
            keterangan,
            detail: komponen,
        };
    };

    /**
     * Proses seluruh peserta untuk satu Pelatihan:
     * - Hitung Tsukamoto
     * - Cek apakah sudah ada di DB / hindari duplikat
     * - Kirim hasil baru ke endpoint /penilaian
     */

    // ── Tambahkan helper ini ───────────────────────────────────────────────────────
    function parsePeserta(raw: number[] | string): number[] {
        if (Array.isArray(raw)) return raw.map(x => Number(x));
        try {
            return JSON.parse(raw).map((x: any) => Number(x));
        } catch {
            return [];
        }
    }
    // ───────────────────────────────────────────────────────────────────────────────

    const handleProsesPenilaian = async (pelatihan: Pelatihan) => {
        setLoading(true);
        console.log('→ Proses Penilaian untuk', pelatihan.id);

        try {
            // 1. Normalize peserta → number[]
            const pesertaIds = parsePeserta(pelatihan.peserta);
            console.log('   Peserta IDs:', pesertaIds);

            // 2. Cari data pegawai sesuai ID
            const pesertaList = pegawaiData.filter(p => pesertaIds.includes(Number(p.id)));

            console.log('   Akan diproses:', pesertaList.map(p => p.nama));

            // 3. Hitung Tsukamoto tiap pegawai
            const hasilPenilaian = pesertaList.map(p => {
                const { nilai, keterangan, detail } = calculateTsukamotoScore(p, pelatihan);
                return {
                    id: `${pelatihan.id}-${p.id}`,
                    nama: p.nama,
                    skor: nilai,
                    keterangan,
                    pelatihan_id: pelatihan.id,
                    perhitungan: detail,
                };
            });

            // 4. Ambil existing untuk hindari duplikat
            const resExisting = await axios.get(`${baseUrl}/penilaian`);
            const existingIds: string[] = resExisting.data.map((d: any) => d.id);
            console.log('   Existing IDs:', existingIds);

            // 5. Filter dan kirim yang baru
            const baru = hasilPenilaian.filter(h => !existingIds.includes(h.id));
            if (baru.length > 0) {
                await Promise.all(baru.map(p => axios.post(`${baseUrl}/penilaian`, p)));
                message.success(`Tersimpan ${baru.length} penilaian baru`);
            } else {
                message.info('Tidak ada penilaian baru untuk disimpan');
            }

            // 6. Refresh tabel
            await fetchData();
        } catch (err) {
            console.error('❌ Gagal proses penilaian:', err);
            message.error('Gagal menyimpan hasil penilaian');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={3}>Penilaian</Title>
            {/* <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showPenilaianModal}
                style={{ marginBottom: 16 }}
            >
                Tambah Penilaian
            </Button> */}
            <Title level={3}>Hasil Penilaian</Title>
            <Table
                columns={summaryColumns}
                dataSource={summaryData}
                loading={loading}
                pagination={false}
                bordered
            />


            <Title level={3} style={{ marginTop: 48 }}>
                Pelatihan Rumah Sakit
            </Title>
            {/* TOMBOL TAMBAH hanya untuk atasan/admin */}
            {!isPegawai && (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showPelatihanModal}
                    style={{ marginBottom: 16 }}
                >
                    Tambah Pelatihan
                </Button>
            )}

            <Table
                columns={pelatihanColumns}
                dataSource={pelatihanData}
                rowKey="id"
                bordered
                loading={loading}
            />

            <Modal
                open={summaryModalVisible}
                title={`Detail Penilaian: ${selectedSummary?.nama_pelatihan}`}
                footer={null}
                onCancel={() => setSummaryModalVisible(false)}
                width={800}
            >
                {selectedSummary && (
                    <Table<Penilaian>
                        dataSource={selectedSummary.scores}
                        rowKey="id"
                        pagination={false}
                        bordered
                        // ————————— expandable untuk collapse/expand per baris —————————
                        expandable={{
                            // untuk tiap baris peserta, tampilkan detail perhitungan:
                            expandedRowRender: score => {
                                // ubah perhitungan menjadi array [{ key, value }]
                                const details = Object.entries(score.perhitungan).map(([komp, val]) => ({
                                    komp,
                                    val,
                                }));
                                return (
                                    <Table
                                        dataSource={details}
                                        rowKey="komp"
                                        pagination={false}
                                        size="small"
                                        bordered
                                        columns={[
                                            {
                                                title: 'Komponen',
                                                dataIndex: 'komp',
                                                key: 'komp',
                                            },
                                            {
                                                title: 'Nilai',
                                                dataIndex: 'val',
                                                key: 'val',
                                                render: (v: number) => v.toFixed(4),
                                            },
                                        ]}
                                    />
                                );
                            },
                            // selalu boleh di-expand
                            rowExpandable: () => true,
                        }}
                        // ————————— kolom utama peserta —————————
                        columns={[
                            {
                                title: 'Nama Pegawai',
                                dataIndex: 'nama',
                                key: 'nama',
                            },
                            {
                                title: 'Skor (%)',
                                dataIndex: 'skor',
                                key: 'skor',
                                render: (v: number) => `${v.toFixed(2)}%`,
                            },
                            {
                                title: 'Keterangan',
                                dataIndex: 'keterangan',
                                key: 'keterangan',
                            },
                        ]}
                    />
                )}
            </Modal>


            {/* Modal Penilaian */}
            <Modal
                open={isPenilaianModalVisible}
                title={editingPenilaian ? 'Edit Penilaian' : 'Tambah Penilaian'}
                onOk={handlePenilaianSubmit}
                onCancel={() => setPenilaianModalVisible(false)}
                okText="Simpan"
            >
                <Form layout="vertical" form={penilaianForm}>
                    <Form.Item name="nama" label="Nama" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="skor" label="Skor" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="keterangan" label="Keterangan">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Pelatihan */}
            <Modal
                open={isPelatihanModalVisible}
                title={editingPelatihan ? 'Edit Pelatihan' : 'Tambah Pelatihan'}
                onOk={handlePelatihanSubmit}
                onCancel={() => setPelatihanModalVisible(false)}
                okText="Simpan"
            >
                <Form layout="vertical" form={pelatihanForm}>
                    <Form.Item
                        name="nama_pelatihan"
                        label="Nama Pelatihan"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="tanggal"
                        label="Tanggal"
                        rules={[{ required: true }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="deskripsi" label="Deskripsi">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="syarat" label="Syarat">
                        <Input />
                    </Form.Item>
                    <Form.Item name="kualifikasi" label="Kualifikasi">
                        <Input />
                    </Form.Item>
                    <Form.Item name="peserta" label="Peserta (Array ID)">
                        <Input />
                    </Form.Item>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Form.Item key={`b${n}`} name={`b${n}`} label={`b${n}`}>
                            <Switch />
                        </Form.Item>
                    ))}
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Form.Item key={`a${n}`} name={`a${n}`} label={`a${n}`}>
                            <Switch />
                        </Form.Item>
                    ))}
                    <Form.Item name="sertifikasi" label="Sertifikasi">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="ikut_pelatihan" label="Ikut Pelatihan">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="pendidikan_terakhir" label="Pendidikan Terakhir">
                        <Input />
                    </Form.Item>
                    <Form.Item name="jurusan" label="Jurusan">
                        <Input />
                    </Form.Item>
                    <Form.Item name="posisi" label="Posisi">
                        <Input />
                    </Form.Item>
                    <Form.Item name="max_umur" label="Max Umur">
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Peserta */}
            <Modal
                open={isPesertaModalVisible}
                title="Daftar Peserta"
                footer={null}
                onCancel={() => setPesertaModalVisible(false)}
                width={800}
            >
                <Table
                    dataSource={selectedPeserta}
                    rowKey="id"
                    pagination={false}
                    bordered
                    columns={[
                        { title: 'ID', dataIndex: 'id', key: 'id' },
                        { title: 'Nama', dataIndex: 'nama', key: 'nama' },
                        { title: 'Jurusan', dataIndex: 'jurusan', key: 'jurusan' },
                        { title: 'Pendidikan', dataIndex: 'pendidikan_terakhir', key: 'pendidikan_terakhir' },
                        { title: 'Posisi', dataIndex: 'posisi', key: 'posisi' },
                        { title: 'Umur', dataIndex: 'umur', key: 'umur' },
                        {
                            title: 'Skor Penilaian',
                            dataIndex: 'skor',
                            key: 'skor',
                            render: (val: number | null) =>
                                val !== null ? `${val.toFixed(2)}%` : <i>Belum dinilai</i>,
                        },
                    ]}
                    locale={{
                        emptyText: 'Tidak ada peserta ditemukan',
                    }}
                />

            </Modal>

            <Modal
                open={detailVisible}
                title="Detail Penilaian Fuzzy Tsukamoto"
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={700}
            >

                {/* Modal Summary Detail */}


                {selectedDetail && (
                    <div>
                        <p>
                            <b>Nama:</b> {selectedDetail.nama}
                        </p>
                        <p>
                            <b>Pelatihan:</b> {selectedDetail.pelatihan?.nama_pelatihan}
                        </p>
                        <p>
                            <b>Skor:</b> {selectedDetail.skor} ({selectedDetail.keterangan})
                        </p>
                        <br />
                        <Title level={5}>Rincian Perhitungan:</Title>
                        <ul>
                            {Object.entries(selectedDetail.perhitungan).map(
                                ([label, value]) => (
                                    <li key={label}>
                                        <b>{label}</b>: {(value as number).toFixed(4)}
                                    </li>
                                )
                            )}
                        </ul>
                        <br />
                        <p>
                            <b>Rumus Skor:</b> Rata‐rata dari T1, T2, Pendidikan, Umur,
                            Sertifikasi, PernahPelatihan, Jurusan, Posisi
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
