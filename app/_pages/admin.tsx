import type { Locale } from '@/lib/i18n';
import AdminDashboard from '@/app/_components/admin-dashboard';
export const metadata={title:'Удирдлага — InnoLab',robots:{index:false,follow:false}};
export default function AdminPage({locale='mn'}:{locale?:Locale}={}){return <AdminDashboard locale={locale}/>;}
