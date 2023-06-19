import React, { useState } from "react";
import { useUserContext } from "src/contexts/user/user.context";
import { userService } from "/src/services/user";
// import { useAuthContext } from "src/contexts/auth/auth.context";
import ValidationInput from "src/components/common/form/validation-input";
import "./reset.scss";

const passwordPattern = /[\w]{8,16}/;

const INITIAL_VALUES = {
  currentPassword: {
    value: "",
    isCorrect: false,
    validation: passwordPattern,
    placeholder: "Enter your current password",
  },
  newPassword: {
    value: "",
    isCorrect: false,
    validation: passwordPattern,
    placeholder: "Enter your new password",
  },
  confirmPassword: {
    value: "",
    isCorrect: false,
    validation: passwordPattern,
    placeholder: "Confirm your new password",
  },
};

export default function PasswordInfo() {
  const { selectedUser } = useUserContext();
  const [form, setFormValues] = useState(INITIAL_VALUES);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { value, name } = event.target;
    const isCorrect = form[name].validation.test(value);

    setFormValues((prevForm) => ({
      ...prevForm,
      [name]: { ...prevForm[name], value, isCorrect },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = form;

    if (newPassword.value !== confirmPassword.value) {
      setErrorMessage("Password do not match");
      return;
    }

    try {
      await userService.updatePassword(
        selectedUser.id,
        currentPassword.value,
        newPassword.value
      );
      console.log("Password updated successfully!");
      setFormValues(INITIAL_VALUES);
      setErrorMessage(""); // Clear any previous error message
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Failed to update password:", error);
      setErrorMessage("Incorrect current password"); // Set the error message
    }
  };

  return (
    <section className="user-info">
      <div className="detailed-information">
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Reset Password
        </h1>{" "}
        <form onSubmit={handleSubmit}>
          <div className="selectable-input">
            <div style={{ marginBottom: "8px" }}>Current Password</div>
            <ValidationInput
              name="currentPassword"
              value={form.currentPassword.value}
              isCorrect={form.currentPassword.isCorrect}
              placeholder={form.currentPassword.placeholder}
              onChange={handleChange}
              type="password"
            />
          </div>

          <div className="selectable">
            <div style={{ marginBottom: "8px" }}>New Password</div>
            <ValidationInput
              name="newPassword"
              value={form.newPassword.value}
              isCorrect={form.newPassword.isCorrect}
              placeholder={form.newPassword.placeholder}
              onChange={handleChange}
              type="password"
            />
          </div>

          <div className="selectable-input">
            <div style={{ marginBottom: "8px",marginTop: "8px" }}>Confirm Password</div>
            <ValidationInput
              name="confirmPassword"
              value={form.confirmPassword.value}
              isCorrect={form.confirmPassword.isCorrect}
              placeholder={form.confirmPassword.placeholder}
              onChange={handleChange}
              type="password"
            />
            {errorMessage && (
              <div
                className="error-message"
                style={{ color: "red", marginTop: "20px" }}
              >
                {errorMessage}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="primary-button"
            style={{ width: "100%" }}
          >
            Update Password
          </button>
        </form>
      </div>
    </section>
  );
}
