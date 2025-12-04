import { randomUUID } from 'crypto';

export const createId = () => randomUUID();

export const sanitizeUser = (user, data) => {
  if (!user) return null;
  const { password, ...rest } = user;
  const badges = rest.badges || [];
  return {
    ...rest,
    badges: data
      ? badges.map((badgeId) => data.badges?.find((badge) => badge.id === badgeId)).filter(Boolean)
      : badges
  };
};

export const findCourseById = (data, courseId) => data.courses.find((course) => course.id === courseId);

export const findCourseByModuleId = (data, moduleId) => {
  for (const course of data.courses) {
    const module = (course.modules || []).find((m) => m.id === moduleId);
    if (module) return { course, module };
  }
  return {};
};

export const findCourseByLessonId = (data, lessonId) => {
  for (const course of data.courses) {
    for (const module of course.modules || []) {
      const lesson = (module.lessons || []).find((l) => l.id === lessonId);
      if (lesson) return { course, module, lesson };
    }
  }
  return {};
};

export const findCourseByQuizId = (data, quizId) => {
  for (const course of data.courses) {
    for (const module of course.modules || []) {
      for (const lesson of module.lessons || []) {
        if (lesson.quiz && lesson.quiz.id === quizId) {
          return { course, module, lesson, quiz: lesson.quiz };
        }
      }
    }
  }
  return {};
};

export const findLessonById = (data, lessonId) => findCourseByLessonId(data, lessonId).lesson;
export const findQuizById = (data, quizId) => findCourseByQuizId(data, quizId).quiz;

