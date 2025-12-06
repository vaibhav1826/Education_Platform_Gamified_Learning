import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar.jsx';
import TeacherTopbar from './TeacherTopbar.jsx';

const TeacherLayout = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950/80">
      <TeacherSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TeacherTopbar />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;

