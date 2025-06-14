import { Typography } from 'antd';

const { Title } = Typography;

function Navbar() {
    return (
        <div style={{ padding: '0 24px' }}>
            <Title level={4} style={{ margin: 0 }}>
                Dilan
            </Title>
        </div>
    );
}

export default Navbar;
