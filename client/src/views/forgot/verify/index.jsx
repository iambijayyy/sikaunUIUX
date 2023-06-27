import React, { useState } from "react";
import axios from "axios";
import ValidationInput from "src/components/common/form/validation-input";
import "./verify.scss";
import { useNavigate } from "react-router-dom";
useNavigate;
const mailPattern = /^[A-Za-z_0-9]+@[a-z_]+?\.[a-zA-Z]{2,3}$/;
const passwordPattern = /^.{6,}$/;

const INITIAL_VALUES = {
  mail: {
    value: "",
    isCorrect: false,
    validation: mailPattern,
    placeholder: "Enter your email",
  },
  verificationCode: {
    value: "",
    isCorrect: false,
    validation: /^\d{6}$/,
    placeholder: "Enter verification code",
  },
  newPassword: {
    value: "",
    isCorrect: false,
    validation: passwordPattern,
    placeholder: "Enter new password",
  },
  confirmPassword: {
    value: "",
    isCorrect: false,
    validation: passwordPattern,
    placeholder: "Confirm new password",
  },
};

export default function PasswordInfo() {
  const navigate = useNavigate();

  const [form, setFormValues] = useState(INITIAL_VALUES);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const handleChange = (event) => {
    const { value, name } = event.target;
    const isCorrect = form[name].validation.test(value);

    setFormValues((prevForm) => ({
      ...prevForm,
      [name]: { ...prevForm[name], value, isCorrect },
    }));
  };

  const handleSendVerificationCode = async () => {
    const { mail } = form;

    try {
      await axios.post("http://localhost:3002/users/forgot-password", {
        mail: mail.value,
      });

      console.log("Reset password email sent successfully!");
      setIsCodeSent(true);
      setErrorMessage("");
      alert("Reset password email sent successfully!");
    } catch (error) {
      console.error("Failed to send reset password email:", error);
      setErrorMessage("Failed to send reset password email");
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();

    const { mail, verificationCode } = form;

    try {
      const response = await axios.post(
        "http://localhost:3002/users/verify-code",
        {
          mail: mail.value,
          verificationCode: verificationCode.value,
        }
      );

      console.log("Received verification code:", verificationCode.value);

      if (response.data.message === "Code is correct") {
        setIsCodeVerified(true);
        setErrorMessage("");
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (error) {
      console.error("Failed to verify code:", error);

      if (
        error.response &&
        error.response.data !== "Invalid verification code"
      ) {
        setErrorMessage("Failed to verify code");
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage("Invalid verification code");
      }
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const { mail, newPassword, confirmPassword } = form;

    if (newPassword.value !== confirmPassword.value) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:3002/users/reset-password", {
        mail: mail.value,
        verificationCode: form.verificationCode.value,
        newPassword: newPassword.value,
      });

      console.log("Password reset successfully!");
      setFormValues(INITIAL_VALUES);
      setIsCodeSent(false);
      setIsCodeVerified(false);
      setErrorMessage("");
      alert("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Failed to reset password:", error);
      setErrorMessage("Failed to reset password");
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
          Forgot Password
        </h1>
        {!isCodeVerified ? (
          <form onSubmit={handleVerifyCode}>
            <div className="selectable-input">
              <div style={{ marginBottom: "8px", marginTop: "8px" }}>
                {isCodeSent
                  ? "Enter the verification code sent to your email"
                  : "No worries! Fill in your email, and we'll send you a link to reset your password"}
              </div>
              <ValidationInput
                name="mail"
                value={form.mail.value}
                isCorrect={form.mail.isCorrect}
                placeholder={form.mail.placeholder}
                onChange={handleChange}
                type="email"
                disabled={isCodeSent}
              />

              {isCodeSent && (
                <>
                  <div style={{ margin: "10px 0" }}></div>
                  <ValidationInput
                    name="verificationCode"
                    value={form.verificationCode.value}
                    isCorrect={form.verificationCode.isCorrect}
                    placeholder={form.verificationCode.placeholder}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              {errorMessage && (
                <div
                  className="error-message"
                  style={{ color: "red", marginTop: "20px" }}
                >
                  {errorMessage}
                </div>
              )}
            </div>
            {!isCodeSent ? (
              <button
                type="button"
                className="primary-button"
                onClick={handleSendVerificationCode}
                style={{ width: "100%" }}
              >
                Send Reset Email
              </button>
            ) : (
              <button
                type="submit"
                className="primary-button"
                style={{ width: "100%" }}
              >
                Verify Code
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="selectable-input">
              <div style={{ marginBottom: "8px", marginTop: "8px" }}>
                Reset your password
              </div>
              <ValidationInput
                name="newPassword"
                value={form.newPassword.value}
                isCorrect={form.newPassword.isCorrect}
                placeholder={form.newPassword.placeholder}
                onChange={handleChange}
                type="password"
      
              />

              <div style={{ marginBottom: "20px" }}></div>

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
              Reset Password
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
