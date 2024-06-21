// Import global styles and components used in the Home component
import '../styles/globals.css';
import UserTable from '../components/UserTable';
import Header from '@/components/Header';

// Home component, renders the Header and UserTable components
export default function Home() {
  return (
    <div>
      <Header />
      <UserTable />
    </div>
  );
}


