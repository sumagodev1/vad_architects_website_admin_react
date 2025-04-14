import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Tooltip, OverlayTrigger,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useSearchExport } from "../../context/SearchExportContext";
import NewResuableForm from "../../components/form/NewResuableForm";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../api/AxiosInstance";
import { FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';
import { confirmAlert } from "react-confirm-alert";
import "../../App.scss";

const SocialContact = () => {
  const { searchQuery, handleSearch, setData, filteredData } = useSearchExport();
  const [team, setTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [eyeVisibilityById, setEyeVisibilityById] = useState({});
  const [showTable, setShowTable] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const CustomHeader = ({ name }) => (
    <div style={{ fontWeight: "bold", color: "black", fontSize: "16px" }}>
      {name}
    </div>
  );

  const tableColumns = (currentPage, rowsPerPage) => [
    {
      name: <CustomHeader name="Sr. No." />,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
    },
    {
      name: <CustomHeader name="Name" />,
      cell: (row) => <span>{row.name}</span>,
    },
    {
      name: <CustomHeader name="Url" />,
      cell: (row) => <span>{row.url}</span>,
    },
    {
      name: <CustomHeader name="Actions" />,
      cell: (row) => (
        <div className="d-flex">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="edit-tooltip">Edit</Tooltip>}
          >

            <Button className="ms-1" onClick={() => toggleEdit(row.id)}>
              <FaEdit />
            </Button>
          </OverlayTrigger>
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="visibility-tooltip">{eyeVisibilityById[row.id] ? 'Show' : 'Hide'}</Tooltip>}
            >
                <Button
                className="ms-1"
                style={{
                    backgroundColor: eyeVisibilityById[row.id] ? 'red' : 'green',
                    borderColor: eyeVisibilityById[row.id] ? 'red' : 'green',
                    color: 'white',
                }}
                onClick={() => handleIsActive(row.id, !eyeVisibilityById[row.id])}
                >
                {eyeVisibilityById[row.id] ? <FaEyeSlash /> : <FaEye />}
                </Button>
            </OverlayTrigger>
        </div>
      ),
    },
  ];

    useEffect(() => {
      fetchTeam();
      // Retrieve and set visibility state from localStorage
      const storedVisibility = JSON.parse(localStorage.getItem('eyeVisibilityById')) || {};
      setEyeVisibilityById(storedVisibility);
    }, []);
  
    useEffect(() => {
      // Store visibility state in localStorage whenever it changes
      localStorage.setItem('eyeVisibilityById', JSON.stringify(eyeVisibilityById));
    }, [eyeVisibilityById]);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await instance.get("social-contact/get-socialcontacts", {
        headers: {
          // Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);

      const reversedData = response.data.responseData;
      setTeam(reversedData);
      setData(reversedData);
    } catch (error) {
      console.error("Error fetching team:", error.response || error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData) => {
    let errors = {};
    let isValid = true;

    if (!formData.name?.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.url?.trim()) {
      errors.url =
        formData.name === "Whatsapp Number"
          ? "Mobile Number is required"
          : formData.name === "Email"
          ? "Enter valid email id is required"
          : "URL is required";
      isValid = false;
    } else {
      if (formData.name === "Whatsapp Number") {
        const mobilePattern = /^[6-9]\d{9}$/;
        if (!mobilePattern.test(formData.url)) {
          errors.url =
            "Mobile Number must be 10 digits and start with 9, 8, 7, or 6";
          isValid = false;
        }
      } else if (formData.name === "Email") {
        // const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(formData.url)) {
          errors.url = "Enter a valid Email Id (e.g., user@example.com)";
          isValid = false;
        }
      } else {
        const urlPattern =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlPattern.test(formData.url)) {
          errors.url = "Enter a valid URL (e.g., https://example.com)";
          isValid = false;
        }
      }
    }
    

    // if (!formData.url?.trim()) {
    //     errors.url = formData.name === "Whatsapp Number" ? "Mobile Number is required" : "URL is required";
    //     isValid = false;
    //   } else if (formData.name === "Whatsapp Number" && !/^\d{10}$/.test(formData.url)) {
    //     errors.url = "Mobile Number must be enter exactly 10 digits";
    //     isValid = false;
    // }

    // if (!formData.url?.trim()) {
    //   errors.url = "URL link is required";
    //   isValid = false;
    // }
    // if (!formData.email?.trim()) {
    //   errors.email = "email link is required";
    //   isValid = false;
    // }
    // if (!formData.linkedin?.trim()) {
    //   errors.linkedin = "linkedin link is required";
    //   isValid = false;
    // }
    // if (!formData.twitter?.trim()) {
    //   errors.linkedin = "twitter link is required";
    //   isValid = false;
    // }
    // if (!formData.whatsapp?.trim()) {
    //   errors.whatsapp = "Whatsapp number is required";
    //   isValid = false;
    // } else if (!/^\d+$/.test(formData.whatsapp)) {
    //   errors.whatsapp = "Whatsapp number must contain only digits";
    //   isValid = false;
    // } else if (formData.whatsapp.length !== 10) {
    //   errors.whatsapp = "Whatsapp number must be exactly 10 digits";
    //   isValid = false;
    // }

    setErrors(errors);
    return isValid;
  };

  const handleChange = (name, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm(formData)) {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      try {
        await instance.put(`social-contact/socialcontact/${editingId}`, data, {
          headers: {
            // Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
          },
          withCredentials: true, 
        });
        toast.success("Data Updated Successfully");


        const updatedTeam = team.map((member) =>
          member.id === editingId ? { ...member, ...formData } : member
        );
        setTeam(updatedTeam);
        setData(updatedTeam);
        setEditMode(false);
        setFormData({});
        setShowTable(true);
      } catch (error) {
        console.error("Error handling form submission:", error);
      } finally {
        setLoading(false);
      }
    }
  };

    const handleIsActive = async (id, isVisible) => {
      confirmAlert({
        title: "Confirm to change visibility",
        customUI: ({ onClose }) => (
          <div
            style={{
              textAlign: "left",
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(5, 5, 5, 0.2)",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            <h2>Confirm to change visibility</h2>
            <p>
              Are you sure you want to {isVisible ? "hide" : "show"} this data?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                style={{ marginRight: "10px" }}
                className="btn btn-primary"
                onClick={async () => {
                  setLoading(true);
                  const accessToken = localStorage.getItem("accessToken");
                  try {
                    await instance.put(
                      `social-contact/isactive-social/${id}`,
                      { isVisible },
                      {
                        headers: {
                          // Authorization: `Bearer ${accessToken}`,
                          "Content-Type": "application/json",
                        },
                        withCredentials: true, 
                      }
                    );
                    toast.success(
                      `Data ${isVisible ? "hidden" : "shown"} successfully`
                    );
                    setEyeVisibilityById((prev) => ({
                      ...prev,
                      [id]: isVisible,
                    }));
                    fetchTeam();
                  } catch (error) {
                    console.error("Error updating visibility:", error);
                    toast.error("Error updating visibility");
                  } finally {
          setLoading(false); // Set loading to false
        }
                  onClose();
                }}
              >
                Yes
              </button>
              <button className="btn btn-secondary" onClick={() => onClose()}>
                No
              </button>
            </div>
          </div>
        ),
      });
    };

  const toggleEdit = (id) => {
    const selectedMember = team.find((member) => member.id === id);
    setEditingId(id);
    setFormData(selectedMember);
    setEditMode(true);
    setShowTable(false);
  };

  const handleCancel = () => {
    setFormData({});
    setEditMode(false);
    setShowTable(true);
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card>
            {/* <Card.Header>
              <Row>
                <Col className="d-flex justify-content-end align-items-center">
                  {showTable && (
                    <SearchInput
                      searchQuery={searchQuery}
                      onSearch={handleSearch}
                      showExportButton={false}
                    />
                  )}
                </Col>
              </Row>
            </Card.Header> */}

            <Card.Body>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                  <ThreeDots
                    height="80"
                    width="80"
                    radius="9"
                    color="#000"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                </div>
              ) : showTable ? (
                <DataTable
                  columns={tableColumns(currentPage, rowsPerPage)}
                  data={filteredData.length > 0 ? filteredData : team}
                  pagination
                  responsive
                  striped
                  noDataComponent="No Data Available"
                  onChangePage={(page) => setCurrentPage(page)}
                  onChangeRowsPerPage={(rowsPerPage) =>
                    setRowsPerPage(rowsPerPage)
                  }
                />
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <NewResuableForm
                        label={<span>Name<span className="text-danger">*</span></span>}
                        placeholder={"Enter name link"}
                        type={"text"}
                        name={"name"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.name}
                        disabled={true} 
                      />
                    </Col>
                    <Col md={6}>
                        <NewResuableForm
                            label={
                            <span>
                                {/* {formData.name === "Whatsapp Number" ? "Mobile Number" : "Url"} */}
                                {formData.name === "Whatsapp Number"
                                  ? "Mobile Number"
                                  : formData.name === "Email"
                                  ? "Email Id"
                                  : "Url"}
                                <span className="text-danger">*</span>
                            </span>
                            }
                            // placeholder={
                            // formData.name === "Whatsapp Number" ? "Enter Mobile Number" : "Enter URL"
                            // }
                            placeholder={
                              formData.name === "Whatsapp Number"
                                ? "Enter Mobile Number"
                                : formData.name === "Email"
                                ? "Enter Email Id"
                                : "Enter URL"
                            }
                            type={"text"}
                            name={"url"}
                            onChange={handleChange}
                            initialData={formData}
                            error={errors.url}
                        />
                    </Col>

                    {/* <Col md={6}>
                        <NewResuableForm
                            label={
                            <span>
                                {formData.name === "Whatsapp Number" ? "Mobile Number" : "Url"}
                                <span className="text-danger">*</span>
                            </span>
                            }
                            placeholder={
                            formData.name === "Whatsapp Number" ? "Enter Mobile Number" : "Enter URL"
                            }
                            type={"text"}
                            name={"url"}
                            maxLength={formData.name === "Whatsapp Number" ? 10 : undefined} // Restrict max length
                            onChange={(name, value) => {
                            if (formData.name === "Whatsapp Number") {
                                const onlyNums = value.replace(/\D/g, "").slice(0, 10); // Allow only numbers, max 10
                                handleChange(name, onlyNums);
                            } else {
                                handleChange(name, value);
                            }
                            }}
                            initialData={formData}
                            error={errors.url}
                        />
                    </Col> */}
                    {/* <Col md={6}>
                      <NewResuableForm
                        // label={"Instagram"}
                        label={<span>Url<span className="text-danger">*</span></span>}
                        placeholder={"Enter url"}
                        type={"text"}
                        name={"url"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.url}
                      />
                    </Col> */}
                    {/* <Col md={6} className="mt-2">
                      <NewResuableForm
                        // label={"Email Id"}
                        label={<span>Email Id<span className="text-danger">*</span></span>}
                        placeholder={"Enter Email Id "}
                        type={"text"}
                        name={"email"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.email}
                      />
                    </Col> */}
                    {/* <Col md={6} className="mt-2">
                      <NewResuableForm
                        // label={"Whatsapp"}
                        label={<span>Whatsapp Number<span className="text-danger">*</span></span>}
                        placeholder={"Enter Whatsapp Number "}
                        type={"text"}
                        name={"whatsapp"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.whatsapp}
                      />
                    </Col> */}
                    {/* <Col md={6} className="mt-2">
                      <NewResuableForm
                        // label={"LinkedIn"}
                        label={<span>LinkedIn<span className="text-danger">*</span></span>}
                        placeholder={"Enter LinkedIn Link "}
                        type={"text"}
                        name={"linkedin"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.linkedin}
                      />
                    </Col> */}
                    {/* <Col md={6} className="mt-2">
                      <NewResuableForm
                        // label={"Twitter"}
                        label={<span>Twitter<span className="text-danger">*</span></span>}
                        placeholder={"Enter Twitter Link "}
                        type={"text"}
                        name={"twitter"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.twitter}
                      />
                    </Col> */}
                  </Row>
                  <Row>
                    <div className="mt-3 d-flex justify-content-end">
                      <Button type="submit" variant="success">
                        Update
                      </Button>
                      <Button
                        variant="secondary"
                        className="ms-2"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Row>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SocialContact;
