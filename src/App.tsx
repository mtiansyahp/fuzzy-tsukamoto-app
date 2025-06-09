import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

const { Header, Sider, Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <Sidebar />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          <Navbar />
        </Header>
        <Content style={{ margin: '16px' }}>
          <AppRoutes />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
