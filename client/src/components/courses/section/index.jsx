import { useState } from "react";
import uniqid from "uniqid";
import { useCoursesContext } from "src/contexts/courses/courses.context";
import { useAuthContext } from "src/contexts/auth/auth.context";
import List from "src/components/common/list";
import NewCourse from "./new-course";
import Course from "./course";
import CoursePreload from "./preload";
import "./section.scss";
import notavailable from "/public-assets/not.png";
import LoadingIcon from "src/components/common/load";
import SearchIcon from "@mui/icons-material/Search";
import UserImage from "src/assets/user/default-user.svg";
import { IMAGES_ROUTES } from "src/services/config";

const NUMBER_OF_ELEMENTS_BY_DEFAULT = 20;

export default function CoursesSection() {
  const { courses, isLoading } = useCoursesContext();
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(""); // Track the selected filter

  const isUserAuthorized = user.role === "teacher" || user.role === "admin";
  const icon = isLoading ? (
    <LoadingIcon />
  ) : (
    <SearchIcon className="search-icon" />
  );

  const filterCourses = (searchTerm) => {
    const filtered = courses.filter(
      (course) =>
        course.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const handleSearchInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    filterCourses(newSearchTerm);
  };
  const profileImg = user
    ? `${IMAGES_ROUTES}${user.profileImage}`
    : { UserImage };
  const handleFilterButtonClick = (filter) => {
    if (selectedFilter === filter) {
      // If the same filter button is clicked again, reset the filters
      setSelectedFilter("");
      setFilteredCourses([]);
    } else {
      const filtered = courses.filter((course) => course.level === filter);
      setFilteredCourses(filtered);
      setSelectedFilter(filter); // Set the selected filter
    }
  };

  const coursesToDisplay =
    searchTerm !== "" || filteredCourses.length > 0 ? filteredCourses : courses;

  const coursesElements = coursesToDisplay.map((item) => (
    <Course key={item.id} course={item} />
  ));
  const preloadElements = Array(NUMBER_OF_ELEMENTS_BY_DEFAULT)
    .fill()
    .map(() => <CoursePreload key={uniqid()} />);

  let elements;

  if (isLoading) {
    elements = preloadElements;
  } else if (coursesToDisplay.length === 0) {
    elements = (
      <div className="">
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          <img
            src={notavailable}
            style={{ width: "400px", height: "400px" }}
            alt="Not available"
          />
          <div>No courses available</div>
        </div>
      </div>
    );
  } else {
    elements = coursesElements;
  }

  return (
    <>
      <div className="search-bar">
        <section className="search-section">
          <div className="search-input-container">
            <form>
              <input
                type="text"
                className="search-input"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
              {icon}
            </form>
          </div>
          <div className="filters">
            <ul>
              <button
                className={`filter${
                  selectedFilter === "Beginner" ? " selected" : ""
                }`}
                onClick={() => handleFilterButtonClick("Beginner")}
              >
                Beginner
              </button>
              <button
                className={`filter${
                  selectedFilter === "Mid Level" ? " selected" : ""
                }`}
                onClick={() => handleFilterButtonClick("Mid Level")}
              >
                Mid Level
              </button>
              <button
                className={`filter${
                  selectedFilter === "Senior" ? " selected" : ""
                }`}
                onClick={() => handleFilterButtonClick("Senior")}
              >
                Senior
              </button>
            </ul>
          </div>
        </section>
      </div>
      <div className="course-section">
        <List>
          {isUserAuthorized && !searchTerm && <NewCourse />}
          {elements}
        </List>
      </div>
    </>
  );
}
