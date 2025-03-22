import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import instance from "../../api/AxiosInstance"; // Make sure this is your Axios instance
import "../../App.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // This is the state for storing the current password (fetched from the server)
  const [currentPassword, setCurrentPassword] = useState("");

  // State to manage visibility of passwords
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    // Fetch the profile on component mount to get the user's details
    const fetchProfile = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await instance.get("/auth/get-profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assuming the password is within the 'responseData' object in the response
        setCurrentPassword(response.data.responseData.password); // Set the fetched password
        setFormData((prevState) => ({
          ...prevState,
          oldPassword: response.data.responseData.password, // Pre-fill the old password
        }));
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Unable to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  // Validation function
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    // Validate old password (even though it's pre-filled)
    if (!formData.oldPassword.trim()) {
      errors.oldPassword = "Old password is required";
      isValid = false;
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "New Password & Confirm Password do not match";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");

    try {
      await instance.put(
        "/auth/change-password",
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Password changed successfully");

      // Redirect to /logout after password change
      navigate("/logout");

      // Reset form data after successful submission
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      // toast.error(
      //   error.response?.data?.message || "An error occurred while changing password"
      // );
      if (error.response?.data?.message === "Old password is incorrect") {
        setErrors({ ...errors, oldPassword: "Please enter the correct old password" });
      } else {
        toast.error(error.response?.data?.message || "An error occurred while changing password");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  return (
    <Container fluid>
      <Row className="justify-content-center mt-5">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Old Password */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Old Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="oldPassword"
                    placeholder="Old password"
                    value={formData.oldPassword} // Fill with old password || currentPassword
                    onChange={handleChange}
                    isInvalid={!!errors.oldPassword}
                    // readOnly={true}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.oldPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* New Password */}
                <Form.Group className="mb-3 position-relative">
                  <Form.Label>
                    New Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type={showNewPassword ? "text" : "password"} // Toggle between text and password
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.newPassword}
                  />
                  <span
                    className="position-absolute"
                    style={{
                      top: "70%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Confirm Password */}
                <Form.Group className="mb-3 position-relative">
                  <Form.Label>
                    Confirm Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"} // Toggle between text and password
                    name="confirmPassword"
                    placeholder="Re-enter new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <span
                    className="position-absolute"
                    style={{
                      top: "70%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Submit Button */}
                <div className="d-flex justify-content-center">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Changing Password..." : "Change Password"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;
