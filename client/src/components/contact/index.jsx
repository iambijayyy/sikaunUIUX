import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "./contact.scss";

const Contact = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [touched, setTouched] = useState({});

  const onBlur = ({ target }) => {
    setTouched((prev) => ({ ...prev, [target.name]: true }));
  };

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    return regex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const { name, email, message } = form;

      if (!name || !email || !message) {
        throw new Error("Please fill out all fields");
      }

      if (!validateEmail(email)) {
        throw new Error("Invalid email address");
      }

      await emailjs.send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: "Adhyanyan",
          from_email: form.email,
          to_email: "bijay.gautam1501@gmail.com",
          message: form.message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      );

      setTouched({});
      setSuccess("Message sent! We will get back to you as soon as possible.");

      setForm({
        name: "",
        email: "",
        message: "",
      });

      setTimeout(() => {
        setSuccess("");
      }, 5000);
    } catch (error) {
      if (error.message === "Please fill out all fields") {
        setError("Please fill out all fields");
      } else if (error.message === "Invalid email address") {
        setError("Invalid email address");
      } else {
        setError(
          "An error occurred while sending your message. Please try again later."
        );
      }
    }
  };

  return (
    <section style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="">
        <form onSubmit={handleSubmit}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Contact Us
          </h1>
          <div>
            <div style={{ marginBottom: "14px" }}>Full Name</div>
            <input
              className="validation-input input-container"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={onBlur}
              placeholder="Your full name"
              style={{
                paddingTop:"16px",
                paddingBottom:"16px",
                marginBottom: "20px",
              }}
            />
            {touched.name && !form.name && (
              <span style={{ color: "orange" }}>e.g. John Doe</span>
            )}
          </div>
          <div style={{ marginTop: "10px" }}>
            <div style={{ marginBottom: "14px" }}>Email</div>
            <input
              style={{
                paddingTop:"16px",
                paddingBottom:"16px",
                marginBottom: "20px",
              }}
              className=" input-container"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={onBlur}
              placeholder="Your email address"
            />
            {touched.email && !form.email && (
              <span style={{ color: "orange" }}>e.g. example@gmail.com</span>
            )}
          </div>
          <div style={{ marginTop: "10px" }}>
            <div style={{ marginBottom: "14px" }}>Message</div>
            <textarea
              className="validation-input input-container"
              rows={4}
              name="message"
              value={form.message}
              onChange={handleChange}
              onBlur={onBlur}
              placeholder="Write your message"
              style={{
                paddingTop:"16px",
                paddingBottom:"16px",
                marginBottom: "20px",
              }}
            />
            {touched.message && !form.message && (
              <span style={{ color: "orange" }}>Required</span>
            )}
          </div>
          {error && <p style={{ color: "orange" }}>{error}</p>}
          {success && <p style={{ color: "#62CDFF" }}>{success}</p>}

          <button
            type="submit"
            className="primary-button"
            style={{ width: "100%", marginTop: "20px" }}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
