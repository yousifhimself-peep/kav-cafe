import { useRoute } from './router';
import { useStore } from './store';
import { Toast } from './components/ui';
import StaffLogin from './staff/StaffLogin';
import BranchPicker from './staff/BranchPicker';
import CountForm from './staff/CountForm';
import Done from './staff/Done';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';

// One link, two areas: staff (#/…) enter counts; managers (#/admin/…) see everything.
export default function App() {
  const { staff, manager } = useStore();
  const { parts, params } = useRoute();

  let screen;
  if (parts[0] === 'admin') screen = manager ? <AdminLayout page={parts[1] || 'overview'} id={parts[2]} params={params} /> : <AdminLogin />;
  else if (!staff) screen = <StaffLogin />;
  else if (parts[0] === 'count' && parts[1]) screen = <CountForm branchId={parts[1]} />;
  else if (parts[0] === 'done' && parts[1]) screen = <Done branchId={parts[1]} />;
  else screen = <BranchPicker />;

  return <>{screen}<Toast /></>;
}
