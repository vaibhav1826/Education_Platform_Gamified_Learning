import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => (
  <motion.div whileHover={{ y: -4 }} className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-lg space-y-3">
    <h3 className="text-xl font-bold">{course.title}</h3>
    <p className="text-slate-400 text-sm">{course.description}</p>
    <div className="flex justify-between items-center text-sm">
      <span>Level {course.levelRequirement}</span>
      <Link to={`/courses/${course._id}`} className="text-accent font-semibold">
        View &rarr;
      </Link>
    </div>
  </motion.div>
);

export default CourseCard;