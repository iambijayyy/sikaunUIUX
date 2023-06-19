import * as React from "react";
import { useCoursesContext } from "src/contexts/courses/courses.context";
import { courseService } from "src/services/courses";
import ValidationInput from "src/components/common/form/validation-input";
import CreationModalActions from "./actions";
import useForm from "src/hooks/useForm";
import Levels from "../../../levels";
import CoverDropzone from "./cover-dropzone";

const namePattern = /./;
const levelPattern = /^(Beginner|Mid Level|Senior)$/;
const tagsPattern = /^[a-zA-Z0-9\s]*$/;

const INITIAL_VALUES = {
  name: { value: "", isCorrect: false, validation: namePattern },
  level: { value: "Beginner", isCorrect: true, validation: levelPattern },
  tags: { value: "", isCorrect: true, validation: tagsPattern },
};
const TOTAL_INPUTS = Object.keys(INITIAL_VALUES);

export default function EditCourseForm() {
  const { setCourses, modals, setModals } = useCoursesContext();
  const { courseId, course: placeholders } = modals.edit.payload;
  const { form, handleChanges, setFormValues } = useForm(INITIAL_VALUES);
  const [cover, setCover] = React.useState({ name: "" });
  const [error, setError] = React.useState("");

  const correctInputs = Object.keys(form).filter(
    (prop) => form[prop].isCorrect
  );
  const isInfoCorrect = correctInputs.length === TOTAL_INPUTS.length;

  function edit(event) {
    event.preventDefault();
    const separatedTags = form.tags.value.split(",");
    const formatedTags = separatedTags.length > 1 ? separatedTags : [];

    const formData = new FormData();
    formData.append("id", placeholders.id);
    formData.append("name", form.name.value);
    formData.append("level", form.level.value);
    formData.append("tags", formatedTags.join(",")); // Join the formatted tags into a comma-separated string
    formData.append("cover", cover.image);
    formData.append("coverName", cover.image.name);

    courseService
      .edit(courseId, placeholders.folder, formData)
      .then((editedCourse) => {
        setModals((otherModals) => ({
          ...otherModals,
          edit: { ...otherModals.edit, show: false },
        }));
        setCourses((otherCourses) =>
          otherCourses.map((courseItem) => {
            if (courseItem.id !== courseId) return courseItem;
            return editedCourse;
          })
        );
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          setError(`Error: ${error.response.data.message}`);
        } else {
          setError("An error occurred. Please try again later.");
        }
      });
  }
  function edit(event) {
    event.preventDefault();
    const separatedTags = form.tags.value.split(",");
    const formatedTags = separatedTags.length > 1 ? separatedTags : [];

    const formData = new FormData();
    formData.append("id", placeholders.id);
    formData.append("name", form.name.value);
    formData.append("level", form.level.value);
    formData.append("tags", formatedTags.join(",")); // Join the formatted tags into a comma-separated string
    formData.append("cover", cover.image);
    formData.append("coverName", cover.image.name);

    courseService
      .edit(courseId, placeholders.folder, formData)
      .then((editedCourse) => {
        setModals((otherModals) => ({
          ...otherModals,
          edit: { ...otherModals.edit, show: false },
        }));
        setCourses((otherCourses) =>
          otherCourses.map((courseItem) => {
            if (courseItem.id !== courseId) return courseItem;
            return editedCourse;
          })
        );
      })
      .catch((error) => {
        if (error.response && error.response.status) {
          const { status } = error.response;
          let errorMessage = "";

          switch (status) {
            case 401:
              errorMessage = "You are unauthorized to edit this.";
              break;
            case 403:
              errorMessage = "Access forbidden.";
              break;
            case 404:
              errorMessage = "Resource not found.";
              break;
            default:
              errorMessage = "An error occurred. Please try again later.";
              break;
          }
          setError(errorMessage);
        } else {
          setError("An error occurred. Please try again later.");
        }
      });
  }

  return (
    <form className="create-course-form" onSubmit={edit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <CoverDropzone file={cover} setFile={setCover} />
      <ValidationInput
        type="text"
        name="name"
        value={form.name.value}
        onChange={handleChanges}
        placeholder={placeholders.name}
        autoComplete="off"
        isCorrect={form.name.isCorrect}
      />
      <ValidationInput
        type="text"
        name="tags"
        value={form.tags.value}
        onChange={handleChanges}
        placeholder={placeholders.tags?.join(", ") || "Tags (optional)"}
        autoComplete="off"
        isCorrect={form.tags.isCorrect}
      />
      <Levels form={form} setFormValues={setFormValues} />
      <CreationModalActions isInfoCorrect={isInfoCorrect} />
    </form>
  );
}
