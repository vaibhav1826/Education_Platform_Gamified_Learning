import useGamification from '../hooks/useGamification.js';
import useCourses from '../hooks/useCourses.js';
import useLeaderboardData from '../hooks/useLeaderboardData.js';
import LeaderboardWidget from '../components/LeaderboardWidget.jsx';
import GamificationProgress from '../components/GamificationProgress.jsx';
import CourseCard from '../components/CourseCard.jsx';

const StudentDashboard = () => {
  const { courses } = useCourses();
  const { leaders } = useLeaderboardData();
  const { user, requirements } = useGamification();

  return (
    <main className="max-w-6xl mx-auto p-6 grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 space-y-6">
        <GamificationProgress xp={user?.xp || 0} requirement={requirements || 100} />
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>
      <LeaderboardWidget data={leaders} />
    </main>
  );
};

export default StudentDashboard;