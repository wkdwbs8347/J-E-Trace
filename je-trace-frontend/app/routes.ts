import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("student", "routes/student/page.tsx"),
  route("teacher", "routes/teacher/page.tsx"),
];  