import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Container, Row, Col, Card, Image, InputGroup } from "react-bootstrap";
import instance from "../../api/AxiosInstance";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from "../../assets/images/logo.png";
import login from "../../assets/images/login.jpg";
import { ThreeDots } from 'react-loader-spinner';
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const captchaRef = useRef(null);

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email address";
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    }

    if (!recaptchaValue) {
      errors.recaptcha = "Please complete the CAPTCHA";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
 
    if (validateForm()) {

     
        setLoading(true);

        if (!recaptchaValue) {
            alert("Please complete the CAPTCHA");
            setLoading(false);
            return;
        }

        try {
            // Verify CAPTCHA with the server
            const captchaResponse = await instance.post(
                "auth/verify-captcha",
                { captcha: recaptchaValue },
                { headers: { "Content-Type": "application/json" } }
            );

            if (!captchaResponse.data.success) {
                alert("CAPTCHA verification failed. Please try again.");
                setLoading(false);
                return;
            }

           // toast.success("CAPTCHA verification successful.");

            // Proceed with login
            const loginResponse = await instance.post(
                "/auth/login",
                { email, password },
                { headers: { "Content-Type": "application/json" }, withCredentials: true, },
                
            );

            if (loginResponse.data.result) {
                toast.success("Login successful");
                navigate("/headercontact");
            } else {
                toast.error("Login failed");
            }
        } catch (error) {
          console.log(error)
            console.error("Error handling form submission:", error);
            toast.error("Login failed, please enter correct email ID & password");
        } finally {
            setLoading(false);
        }
    }
};

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (validateForm()) {
  //     setLoading(true);

  //     e.preventDefault();

  //     if (!recaptchaValue) {
  //         alert("Please complete the CAPTCHA");
  //         return;
  //     }

  //     const response = await fetch("http://localhost:8000/auth/verify-captcha", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ captcha: recaptchaValue }),
  //     });

  //     const data = await response.json();

  //     if (data.success) { 
  //       alert("CAPTCHA verification Sucess.");
  //     } else {
  //         alert("CAPTCHA verification failed. Please try again.");
  //         return;
  //     }
  //     try {
  //       const response = await instance.post(
  //         "/auth/login",
  //         { email, password },
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (response.data.result) {
  //         const { token } = response.data.responseData;
  //         localStorage.setItem("accessToken", token);

  //         toast.success("Login successful");
  //         navigate("/headercontact");
  //       } else {
  //         toast.error("Login failed");
  //       }
  //     } catch (error) {
  //       console.error("Error handling form submission:", error);
  //       toast.error("Login failed please enter correct email id & password");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

 
  //  useEffect(async () => {
  //   try {
  //     await instance.get(`header-contact/findheaderContacts`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         // If needed, uncomment the following line and set accessToken correctly
  //         // Authorization: "Bearer " + accessToken,
  //       },
  //       withCredentials: true,  // Correct placement of withCredentials
  //     });
  //   } catch(e){
  //     console.log("ee",e)
  //   }
  //  }, []);

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center bg-light">
      <Row className="w-100">
        <Col lg={6} className="d-none d-lg-block p-0">
          <Image src={login} className="img-fluid w-100 h-100 object-fit-cover" alt="Login" />
        </Col>
        <Col lg={6} className="d-flex align-items-center justify-content-center">
          <Card className="shadow border-0 p-4 w-75" style={{borderRadius:'1rem'}}>
            <h3 className="text-center mb-2">Welcome back!</h3>
            <p className="text-muted text-center">Enter your credentials to continue</p>
            <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-4">
                    <Form.Label className="d-flex align-items-center">
                      <FaUser className="me-2 text-secondary" />
                      Email id
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-light border-0 shadow-sm rounded-pill px-3"
                    />
                    {errors.email && (
                      <span className="text-danger">{errors.email}</span>
                    )}
                  </Form.Group>

                  <Form.Group controlId="formBasicPassword" className="mb-4">
                    <Form.Label className="d-flex align-items-center">
                      <FaLock className="me-2 text-secondary" />
                      Password
                    </Form.Label>
                    <InputGroup className="bg-light border-0 shadow-sm rounded-pill">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-0 px-3 rounded-pill bg-light password_input"
                      />
                      <InputGroup.Text
                        className="bg-light border-0 rounded-pill"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                    {errors.password && (
                      <span className="text-danger">{errors.password}</span>
                    )}
                  </Form.Group>

                  {/* ReCAPTCHA Section */}
                  <div className="mb-4 d-flex justify-content-center">
                    <ReCAPTCHA
                      ref={captchaRef}
                          // sitekey="6Le657EpAAAAADHl0EnUi-58y19XOcORV9dehjAz"
                          // sitekey = "6LeAZfoqAAAAAMc5CwBV3EdVbedy9IhxloDVUFNm"
                          sitekey = "6LdFwgwrAAAAACd-erqrmZaKx4p30-aktFBG_BbZ"

                          // sitekey="6LcvPesqAAAAADOOYwjQlAP7YuXckifnTPJ9rvVS"
                          // secretkey="6LcvPesqAAAAAEasHj8-Rc9jAH8znHjyfD_6dgAO"

                          // sitekey = "6LckIvEqAAAAAPdy1kCNcZ-VEnwUf6zcJAw1zjK8"
                          // secretkey = "6LckIvEqAAAAAJokDpuRBhmJLdCAz2Y3wHkjQhuU"
                      onChange={handleRecaptchaChange}
                    />
                  </div>
                  {errors.recaptcha && <small className="text-danger d-flex justify-content-center">{errors.recaptcha}</small>}

                  <Row className="justify-content-center">
                    <Col xs="auto">
                      <Button
                        variant="primary"
                        type="submit"
                        className="mt-4 py-2 px-5 rounded-pill shadow-lg"
                        style={{ backgroundColor: "#000", border: "none" }}
                        disabled={loading}
                      >
                        Login
                      </Button>
                    </Col>
                  </Row>
                </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;