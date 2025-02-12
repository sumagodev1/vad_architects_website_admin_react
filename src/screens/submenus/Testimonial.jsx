
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useSearchExport } from "../../context/SearchExportContext";
import NewResuableForm from "../../components/form/NewResuableForm";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../api/AxiosInstance";
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { ThreeDots } from 'react-loader-spinner';
import { Tooltip, OverlayTrigger, } from 'react-bootstrap';
import "../../App.scss";
const Testimonial = () => {
  const { searchQuery, handleSearch, handleExport, setData, filteredData } =
    useSearchExport();
  const [testimonial, setTestimonial] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [eyeVisibilityById, setEyeVisibilityById] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [showTable, setShowTable] = useState(true); // New state for toggling form and table view
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
      name: <CustomHeader name="Company Name" />,
      cell: (row) => <span>{row.company_Name ? row.company_Name : "NA"}</span>,
    },
    {
      name: <CustomHeader name="Review" />,
      cell: (row) => <span>{row.review}</span>,
    },
    {
      name: <CustomHeader name="Star" />,
      cell: (row) => <span>{row.star}</span>,
    },
    {
      name: <CustomHeader name="Experience" />,
      cell: (row) => <span>{row.experience}</span>,
    },
    {
      name: <CustomHeader name="Image" />,
      cell: (row) => row.img ? (
        <img
          src={row.img}
          alt="Uploaded"
          style={{ width: "100px", height: "auto" }}
        />
      ) : (
        <span>NA</span>
      ),
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
            overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}
          >
            <Button
              className="ms-1"
              style={{ backgroundColor: "red", color: "white", borderColor: "red" }}
              onClick={() => handleDelete(row.id)}
            >
              <FaTrash />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="visibility-tooltip">{eyeVisibilityById[row.id] ? 'Hide' : 'Show'}</Tooltip>}
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
    if (formData.img && formData.img instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(formData.img);
    } else if (formData.img && typeof formData.img === "string") {
      setImagePreview(formData.img);
    } else {
      setImagePreview("");
    }
  }, [formData.img]);

  const fetchTeam = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
    try {
      const response = await instance.get("testimonials/get-testimonials", {
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      });
      const reversedData = response.data.responseData.reverse();
      setTestimonial(reversedData);
      setData(reversedData);
    } catch (error) {
      console.error(
        "Error fetching team:",
        error.response || error.message || error
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData) => {

    let errors = {};
    let isValid = true;

    if (formData.img && formData.img instanceof File && !validateImageSize(formData.img)) {
      errors.img = "Image must be 400x400 pixels";
      isValid = false;
    }
    if (!formData.name?.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    if (!formData.review?.trim()) {
      errors.desc = "Review is required";
      isValid = false;
    }
    if (!formData.experience) {
      errors.desc = "Experience is required";
      isValid = false;
    }
    if (!formData.star) {
      errors.desc = "Star is required";
      isValid = false;
    }
    // else if (formData.desc.length > 1000) {
    //   errors.desc = "Description must be 1000 characters or less";
    //   isValid = false;
    // }

    setErrors(errors);
    return isValid;
  };

  const validateImageSize = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width === 400 && img.height === 400) {
          resolve();
        } else {
          reject("Image is required with 400x400 pixels");
        }
      };
      img.onerror = () => reject("Error loading image");
      img.src = URL.createObjectURL(file);
    });
  };



  const handleChange = async (name, value) => {
    if (name === "img" && value instanceof File) {
      try {
        await validateImageSize(value);
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, img: "" }));
      } catch (error) {
        setErrors((prevErrors) => ({ ...prevErrors, img: error }));
        setImagePreview("");
      }
    } else {
      setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };




  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log("formData", formData);
    
  //   if (validateForm(formData)) {
  //     setLoading(true);
  //     const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
  //     const data = new FormData();
      
  //     for (const key in formData) {
  //       data.append(key, formData[key]);
  //     }
      
  //     try {
  //       if (editMode) {
  //         await instance.put(`testimonials/update-testimonials/${editingId}`, data, {
  //           headers: {
  //             Authorization: "Bearer " + accessToken,
  //             "Content-Type": "multipart/form-data",
  //           },
  //         });
  //         toast.success("Data Updated Successfully");
  //         const updatedTeam = testimonial.map((member) =>
  //           member.id === editingId ? formData : member
  //         );
  //         setTestimonial(updatedTeam);
  //       } else {
  //         await instance.post("testimonials/create-testimonials", data, {
  //           headers: {
  //             Authorization: "Bearer " + accessToken,
  //             "Content-Type": "multipart/form-data",
  //           },
  //         });
  //         toast.success("Data Submitted Successfully");
  //       }
  //       fetchTeam();

  //       setEditMode(false);
  //       setFormData({});
  //       setImagePreview("");
  //       setShowTable(true); // Switch back to table view after submission
  //     } catch (error) {
  //       console.error("Error handling form submission:", error);
  //     } finally {
  //       setLoading(false); // Set loading to false
  //     }
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("formData", formData);
  
    if (validateForm(formData)) {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
      const data = new FormData();
      
      // Replace null values with empty strings
      const adjustedFormData = {
        ...formData,
        company_name: formData.company_name || "",
        img: formData.img || ""
      };
  
      for (const key in adjustedFormData) {
        data.append(key, adjustedFormData[key]);
      }
  
      try {
        if (editMode) {
          await instance.put(`testimonials/update-testimonials/${editingId}`, data, {
            headers: {
              Authorization: "Bearer " + accessToken,
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Data Updated Successfully");
          const updatedTeam = testimonial.map((member) =>
            member.id === editingId ? adjustedFormData : member
          );
          setTestimonial(updatedTeam);
        } else {
          await instance.post("testimonials/create-testimonials", data, {
            headers: {
              Authorization: "Bearer " + accessToken,
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Data Submitted Successfully");
        }
        fetchTeam();
  
        setEditMode(false);
        setFormData({});
        setImagePreview("");
        setShowTable(true); // Switch back to table view after submission
      } catch (error) {
        console.error("Error handling form submission:", error);
      } finally {
        setLoading(false); // Set loading to false
      }
    }
  };
  
  const handleDelete = async (id) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this data?",
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
          <h2>Confirm to delete</h2>
          <p>Are you sure you want to delete this data?</p>
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
                  await instance.delete(`testimonials/isdelete-testimonial/${id}`, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                  });
                  toast.success("Data Deleted Successfully");
                  fetchTeam();
                } catch (error) {
                  console.error("Error deleting data:", error);
                  toast.error("Error deleting data");
                } finally {
                  setLoading(false);
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
                    `testimonials/isactive-testimonial/${id}`,
                    { isVisible },
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
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
    const selectedMember = testimonial.find((member) => member.id === id);
    setEditingId(id);
    setFormData(selectedMember);
    setEditMode(true);
    setShowTable(false); // Switch to form view when editing
  };

  const handleAdd = () => {
    setFormData({});
    setEditMode(false);
    setShowTable(false); // Switch to form view when adding new item
  };

  const handleView = () => {
    setFormData({});
    setEditMode(false);
    setShowTable(true); // Switch to table view
  };

  return (


    <Container fluid>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Row>
                {showTable ? (
                  <Col className="d-flex justify-content-end align-items-center">
                    <SearchInput
                      searchQuery={searchQuery}
                      onSearch={handleSearch}
                      onExport={handleExport}
                      showExportButton={false}
                    />
                    <Button
                      variant="outline-success"
                      onClick={handleAdd}
                      className="ms-2 mb-3"
                    >
                      Add
                    </Button>
                  </Col>
                ) : (
                  <Col className="d-flex justify-content-end align-items-center">
                    <Button variant="outline-secondary" onClick={handleView}>
                      View
                    </Button>
                  </Col>
                )}
              </Row>
            </Card.Header>

            <Card.Body>
              {loading ? ( // Check loading state
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
                  data={filteredData.length > 0 ? filteredData : testimonial}
                  pagination
                  responsive
                  striped
                  noDataComponent="No Data Available"
                  onChangePage={(page) => setCurrentPage(page)}
                  onChangeRowsPerPage={(rowsPerPage) =>
                    setRowsPerPage(rowsPerPage)
                  }
                  customStyles={{
                    rows: {
                      style: {
                        alignItems: "flex-start", // Aligns text to the top-left corner
                      },
                    },
                    cells: {
                      style: {
                        textAlign: "left", // Ensures text is aligned to the left
                      },
                    },
                  }}
                />
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Selected Preview"
                          style={{
                            width: "100px",
                            height: "auto",
                            marginBottom: "10px",
                          }}
                        />
                      )}
                      <NewResuableForm
                        label={"Upload Testimonials Image"}
                        placeholder={"Upload Image"}
                        name={"img"}
                        type={"file"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.img}
                        imageDimensiion="Image must be 400x400 pixels"
                      />
                    </Col>
                    <Col md={6}>
                      <NewResuableForm
                        label="Name"
                        placeholder="Enter Name"
                        name="name"
                        type="text"
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.name}
                      />
                    </Col>
                    <Col md={6}>
                      <NewResuableForm
                        label="Company Name"
                        placeholder="Enter Company Name"
                        name="company_Name"
                        type="text"
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.company_Name}
                      />
                    </Col>
                    <Col md={6}>
                      <NewResuableForm
                        label="Experience"
                        placeholder="Enter Experience"
                        name="experience"
                        type="text"
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.experience}
                      />
                    </Col>
                    <Col md={6}>
                      <NewResuableForm
                        label="Star"
                        placeholder="Enter Star"
                        name="star"
                        type="text"
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.star}
                      />
                    </Col>
                    <Col md={12}>
                      <NewResuableForm
                        label="Review"
                        placeholder="Enter Review"
                        name="review"
                        type="text"
                        onChange={handleChange}
                        initialData={formData}
                        textarea
                        error={errors.review}
                        charLimit={1000}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <div className="mt-3 d-flex justify-content-end">
                      <Button
                        type="submit"
                        variant={editMode ? "success" : "primary"}
                      >
                        {editMode ? "Update" : "Submit"}
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

export default Testimonial;
