import React, { useState, useRef, useEffect } from "react";
import { useUserContext } from "src/contexts/user/user.context";
import { userService } from "/src/services/user";
import { IMAGES_ROUTES } from "src/services/config";
import ValidationInput from "src/components/common/form/validation-input";
import "./info.scss";
import UserImage from "src/assets/user/default-user.svg";
import { useAuthContext } from "src/contexts/auth/auth.context";

const COLORS_BY_ROLE = {
  student: "blue",
  teacher: "green",
  admin: "red",
};

const namePattern = /^[A-Z]{1,1}[a-z]+$/;
const lastNamePattern = /^[A-Z]{1,1}[a-z]+$/;
const mailPattern = /^[A-Za-z_0-9]+@[a-z_]+?\.[a-zA-Z]{2,3}$/;

const INITIAL_VALUES = {
  name: {
    value: "",
    isCorrect: false,
    validation: namePattern,
    placeholder: "",
  },
  lastName: {
    value: "",
    isCorrect: false,
    validation: lastNamePattern,
    placeholder: "",
  },
  mail: {
    value: "",
    isCorrect: true,
    validation: mailPattern,
    placeholder: "",
  },
};

export default function UserInfo() {
  const { selectedUser } = useUserContext();
  const [form, setFormValues] = useState(INITIAL_VALUES);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileData, setFileData] = useState(null); // state to store the selected file

  useEffect(() => {
    setPreviewImage(`${IMAGES_ROUTES}${selectedUser.profileImage}`);
    setFormValues((prevForm) => ({
      ...prevForm,
      name: { ...prevForm.name, placeholder: selectedUser.name },
      lastName: { ...prevForm.lastName, placeholder: selectedUser.lastName },
      mail: { ...prevForm.mail, placeholder: selectedUser.mail },
    }));
  }, [selectedUser]);

  const handleChange = (event) => {
    const { value, name } = event.target;
    const isCorrect = form[name].validation.test(value);

    setFormValues((prevForm) => ({
      ...prevForm,
      [name]: { ...prevForm[name], value, isCorrect },
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFileData(file); // store the selected file
    } else {
      setPreviewImage(null);
      setFileData(null);
    }
  };

  const { updateInfo } = useAuthContext(); // Access the updateInfo function from the auth context

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedUser = {
      ...selectedUser,
      name: form.name.value || selectedUser.name,
      lastName: form.lastName.value || selectedUser.lastName,
      mail: form.mail.value || selectedUser.mail,
    };
    // Check if the email is being updated
    const isEmailUpdated = updatedUser.mail !== selectedUser.mail;
    // Display a warning and ask for confirmation
    if (isEmailUpdated) {
      const confirmed = window.confirm(
        "Are you sure you want to Update Email?"
      );
      if (!confirmed) {
        return;
      }
    }
    try {
      if (fileData) {
        const formData = new FormData();
        Object.keys(updatedUser).forEach((key) => {
          formData.append(key, updatedUser[key]);
        });
        formData.append("profileImage", fileData);
        await userService.edit(formData, selectedUser.id);
      } else {
        await userService.edit(updatedUser, selectedUser.id);
      }
      console.log("User info updated successfully!");
      updateInfo(updatedUser);
      setFormValues(INITIAL_VALUES);
      setFormValues((prevForm) => ({
        ...prevForm,
        name: { ...prevForm.name, placeholder: updatedUser.name },
        lastName: { ...prevForm.lastName, placeholder: updatedUser.lastName },
        mail: { ...prevForm.mail, placeholder: updatedUser.mail },
      }));

      // Show success message
      alert("User info updated successfully!");
    } catch (error) {
      console.error("Failed to update user info:", error);

      // Show error message
      alert("Failed to update user info. Please try again.");
    }

    setFileData(null);
  };

  return (
    <section className="user-info">
      <div className="detailed-information">
        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: "center" }}>
            <label className="profile-image-label" htmlFor="profile-image">
              {fileData ? (
                <img src={previewImage} alt="User" className="profile-image" />
              ) : (
                <img
                  src={
                    selectedUser.profileImage
                      ? `${IMAGES_ROUTES}${selectedUser.profileImage}`
                      : `${UserImage}`
                  }
                  // src={UserImage}
                  alt="img"
                  className="profile-image"
                />
              )}
            </label>
          </div>

          <p
            className={`role ${COLORS_BY_ROLE[selectedUser.role]}`}
            style={{ margin: "10px 0", textAlign: "center" }}
          >
            {selectedUser.role}
          </p>

          <div className="selectable-input">
            <div style={{ marginBottom: "8px" }}>First Name</div>
            <ValidationInput
              name="name"
              value={form.name.value}
              isCorrect={form.name.isCorrect}
              placeholder={form.name.placeholder}
              onChange={handleChange}
            />
          </div>

          <div className="selectable-input">
            <div style={{ marginBottom: "8px" }}>Last Name</div>
            <ValidationInput
              name="lastName"
              value={form.lastName.value}
              isCorrect={form.lastName.isCorrect}
              placeholder={form.lastName.placeholder}
              onChange={handleChange}
            />
          </div>

          <div className="selectable-input">
            <div style={{ marginBottom: "8px" }}>Email</div>
            <ValidationInput
              name="mail"
              value={form.mail.value}
              isCorrect={form.mail.isCorrect}
              placeholder={form.mail.placeholder}
              onChange={handleChange}
            />
          </div>
          <input
            type="file"
            id="profile-image"
            ref={fileInputRef}
            accept="image/*"
            className="profile-image-input"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <button
            type="submit"
            className="primary-button"
            style={{ width: "100%" }}
          >
            Save
          </button>
        </form>
      </div>
    </section>
  );
}
