import React from 'react';
import { Card, Col, Row } from 'antd';
import Chart from 'react-apexcharts';

function Dashboard() {
    // Grafik 1: Jumlah pegawai per departemen
    const departemenChart = {
        options: {
            chart: { id: 'departemen-bar' },
            xaxis: { categories: ['Dokter', 'Perawat', 'Administrasi', 'Lab', 'Radiologi'] },
        },
        series: [{ name: 'Pegawai', data: [45, 60, 25, 15, 10] }],
    };

    // Grafik 2: Pegawai berdasarkan jurusan pendidikan (pie)
    const jurusanChart = {
        options: {
            labels: ['Kedokteran', 'Keperawatan', 'Manajemen', 'Teknik Lab', 'Radiologi'],
        },
        series: [40, 50, 20, 15, 10],
    };

    // Grafik 3: Pegawai yang sudah ikut pelatihan (donut)
    const pelatihanChart = {
        options: {
            labels: ['Sudah Ikut', 'Belum Ikut'],
        },
        series: [95, 30],
    };

    // Grafik 4: Jumlah pelatihan per bulan
    const pelatihanBulananChart = {
        options: {
            chart: { id: 'pelatihan-line' },
            xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'] },
        },
        series: [
            {
                name: 'Pelatihan',
                data: [2, 3, 1, 4, 2, 3],
            },
        ],
    };

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Card title="Jumlah Pegawai per Departemen">
                        <Chart
                            options={departemenChart.options}
                            series={departemenChart.series}
                            type="bar"
                            height={250}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Pegawai Berdasarkan Jurusan Pendidikan">
                        <Chart
                            options={jurusanChart.options}
                            series={jurusanChart.series}
                            type="pie"
                            height={250}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Status Pelatihan Pegawai">
                        <Chart
                            options={pelatihanChart.options}
                            series={pelatihanChart.series}
                            type="donut"
                            height={250}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Jumlah Pelatihan yang Dilakukan per Bulan">
                        <Chart
                            options={pelatihanBulananChart.options}
                            series={pelatihanBulananChart.series}
                            type="line"
                            height={250}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Dashboard;
