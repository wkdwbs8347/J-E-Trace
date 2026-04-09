import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/Home.tsx"),
  route("student", "routes/student/Page.tsx"),
  route("student/assignments", "routes/student/Assignments.tsx"),
  route("student/assignment/:assignmentId", "routes/student/AssignmentDetail.tsx"),
  route("teacher", "routes/teacher/Page.tsx"),
  route("signup", "routes/SignupSelectPage.tsx"),
  route("signup/student", "routes/student/StudentSignupPage.tsx"),
  route("login/student", "routes/student/StudentLoginPage.tsx"),
];  