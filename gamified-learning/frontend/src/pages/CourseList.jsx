import useCourses from '../hooks/useCourses.js';
import CourseCard from '../components/CourseCard.jsx';

const CourseList = () => {
  const { courses } = useCourses();

  return (
    <div className="max-w-6xl mx-auto p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
};

export default CourseList;