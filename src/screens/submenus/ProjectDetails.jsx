////sos final
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useSearchExport } from "../../context/SearchExportContext";
import { ShowContext } from "../../context/ShowContext";
import NewResuableForm from "../../components/form/NewResuableForm";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../api/AxiosInstance";
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { ThreeDots } from "react-loader-spinner";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import "../../App.scss";
import axios from "axios";
const ProjectDetails = () => {
  // const {  setData, filteredData } =
  //   useSearchExport();
  const { searchQuery, handleSearch, handleExport, setData, filteredData } =
    useSearchExport();
  const [team, setTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [eyeVisibilityById, setEyeVisibilityById] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [showTable, setShowTable] = useState(true); // New state for toggling form and table view
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [projectcategory, setProjectcategory] = useState([]);
  const [projectname, setProjectname] = useState([]);
  const [filteredProjectNames, setFilteredProjectNames] = useState([]);

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
      name: <CustomHeader name="Project Category" />,
      cell: (row) => <span>{row.project_category}</span>,
    },
    {
      name: <CustomHeader name="Project Name" />,
      cell: (row) => <span>{row.project_name}</span>,
    },
    {
      name: <CustomHeader name="Project Location" />,
      cell: (row) => <span>{row.project_location}</span>,
    },
    {
      name: <CustomHeader name="Image" />,
      cell: (row) => (
        <img
          src={row.img}
          alt="ProjectDetails"
          style={{ width: "100px", height: "auto" }}
        />
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
              style={{
                backgroundColor: "red",
                color: "white",
                borderColor: "red",
              }}
              onClick={() => handleDelete(row.id)}
            >
              <FaTrash />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="visibility-tooltip">
                {eyeVisibilityById[row.id] ? "Hide" : "Show"}
              </Tooltip>
            }
          >
            <Button
              className="ms-1"
              style={{
                backgroundColor: eyeVisibilityById[row.id] ? "red" : "green",
                borderColor: eyeVisibilityById[row.id] ? "red" : "green",
                color: "white",
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
    const storedVisibility =
      JSON.parse(localStorage.getItem("eyeVisibilityById")) || {};
    setEyeVisibilityById(storedVisibility);
  }, []);

  useEffect(() => {
    // Store visibility state in localStorage whenever it changes
    localStorage.setItem(
      "eyeVisibilityById",
      JSON.stringify(eyeVisibilityById)
    );
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
      const response = await instance.get(
        "projectDetails/find-projectDetails",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
          },
        }
      );
      const reversedData = response.data.responseData.reverse();
    //   console.log("Fetched data:", reversedData);
      setTeam(reversedData);
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

    if (!formData.img) {
      errors.img = "Image is not 338x220 pixels";
      isValid = false;
    } else if (
      formData.img instanceof File &&
      !validateImageSize(formData.img)
    ) {
      errors.img = "Image is required with 338x220 pixels";
      isValid = false;
    }
    if (!formData.project_category?.trim()) {
      errors.project_category = "project category is required";
      isValid = false;
    }

    if (!formData.project_name?.trim()) {
      errors.project_name = "project name is required";
      isValid = false;
    }

    if (!formData.project_location?.trim()) {
      errors.project_location = "project location is required";
      isValid = false;
    }

    if (!formData.project_total_tonnage?.trim()) {
      errors.project_total_tonnage = "project total tonnage is required";
      isValid = false;
    }
    if (!formData.project_year_of_completion) {
      errors.project_year_of_completion =
        "project year of completion is required";
      isValid = false;
    }
    if (!formData.project_status?.trim()) {
      errors.project_status = "project status is required";
      isValid = false;
    }
    if (!formData.project_info?.trim()) {
      errors.project_info = "project info is required";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const validateImageSize = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width === 338 && img.height === 220) {
          resolve();
        } else {
          reject("Image is required with 338x220 pixels");
        }
      };
      img.onerror = () => reject("Error loading image");
      img.src = URL.createObjectURL(file);
    });
  };

//   const handleChange = async (name, value) => {
//     if (name === "img" && value instanceof File) {
//       try {
//         await validateImageSize(value);
//         setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
//         setErrors((prevErrors) => ({ ...prevErrors, img: "" }));
//       } catch (error) {
//         setErrors((prevErrors) => ({ ...prevErrors, img: error }));
//         setImagePreview("");
//       }
//     } else {
//       setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
//       setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//     }
//   };

useEffect(() => {
  if (formData.project_category) {
    // Find category ID from the selected category
    const categoryId = projectcategory.find(c => c.title === formData.project_category)?.id;

    // Fetch project names based on the stored category ID
    const filteredNames = projectname.filter(project => project.project_category_id === categoryId);

    // Update state with filtered names
    setFilteredProjectNames(filteredNames);
  }
}, [formData.project_category, projectcategory, projectname]);

  // const handleChange = async (name, value) => {
  //   if (name === "img" && value instanceof File) {
  //     try {
  //       await validateImageSize(value);
  //       setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  //       setErrors((prevErrors) => ({ ...prevErrors, img: "" }));
  //     } catch (error) {
  //       setErrors((prevErrors) => ({ ...prevErrors, img: error }));
  //       setImagePreview("");
  //     }
  //   } else if (name === "project_category") {
  //        // Find the categoryId based on selected category title
  //     const categoryId = projectcategory.find((c) => c.title === value)?.id;
      
  //     // Set the selected category and clear the project name field
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       project_category: value,
  //       project_category_id: categoryId,
  //       project_name: "", // Clear the project name when category is changed
  //     }));
  
  //     // Fetch project names for the selected category
  //     const filteredNames = projectname.filter(
  //       (project) => project.project_category_id === categoryId
  //     );
  //     setFilteredProjectNames(filteredNames); // Update the filtered project names list
  //     } 
  //     else if (name === "project_name") {
  //       const projectId = projectname.find(p => p.project_name === value)?.id;
  //       setFormData((prevFormData) => ({
  //         ...prevFormData,
  //         project_name: value,
  //         project_name_id: projectId
  //       }));
  //     } 
  //     else {
  //       setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  //       setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  //     }
  // };

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
    } else if (name === "project_category") {
        const categoryId = projectcategory.find((c) => c.title === value)?.id;
        setFormData((prevFormData) => ({
            ...prevFormData,
            project_category: value,
            project_category_id: categoryId,
            project_name: "", // Clear project name when category changes
        }));
    } else {


            // Restrict project_year_of_completion to only numbers
    if (name === "project_year_of_completion" && !/^\d*$/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "Only numbers are allowed.",
      }));
      return; // Prevent updating state
    }

    if (name === "project_total_tonnage" && !/^\d*$/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "Only numbers are allowed.",
      }));
      return; // Prevent updating state
    }
      
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }


};
  

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await instance.get("category/get-category");
        setProjectcategory(Array.isArray(response.data.responseData) ? response.data.responseData : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setProjectcategory([]);
      }
    };
  
    const fetchProjectNames = async () => {
      try {
        const response = await instance.get("projectName/get-projectName");
        setProjectname(Array.isArray(response.data.responseData) ? response.data.responseData : []);
      } catch (error) {
        console.error("Error fetching project names:", error);
        setProjectname([]);
      }
    };
  
    fetchCategories();
    fetchProjectNames();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting form with data:", formData);
    if (validateForm(formData)) {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
      const data = new FormData();

          // Add categoryId and projectId explicitly
    data.append("project_category_id", formData.project_category_id); 
    data.append("project_category", formData.project_category); 
    // data.append("project_name_id", formData.project_name_id); 
    data.append("project_name", formData.project_name);        
    data.append("project_location", formData.project_location);
    data.append("project_info", formData.project_info);
    data.append(
      "project_year_of_completion",
      formData.project_year_of_completion
    );
    data.append("project_total_tonnage", formData.project_total_tonnage);
    data.append("project_status", formData.project_status);
    
    // Handle file (image)
    if (formData.img instanceof File) {
      data.append("img", formData.img);
    }

    // console.log("Form data being sent:", [...data.entries()]);

    //   console.log("Form data being sent:", [...data.entries()]);

      try {
        if (editMode) {
          await instance.put(
            `projectDetails/update-projectDetails/${editingId}`,
            data,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          toast.success("Data Updated Successfully");
          const updatedTeam = team.map((member) =>
            member.id === editingId ? formData : member
          );
          setTeam(updatedTeam);
        } else {
          await instance.post("projectDetails/create-projectDetails", data, {
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
        if (error.response && error.response.data) {
          if (
            error.response.data.message === "Another project with this name already exists in this category"
          ) {
            toast.error("Project Name already exists for this category");
          } else {
            toast.error(error.response.data.message || "An error occurred");
          }
        } else {
          toast.error("An error occurred while submitting data");
        }
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
                  await instance.delete(
                    `projectDetails/isdelete-projectDetails/${id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
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
                    `projectDetails/isactive-projectDetails/${id}`,
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
    const selectedMember = team.find((member) => member.id === id);
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
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "100px" }}
                >
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
                // <DataTable
                //   columns={tableColumns(currentPage, rowsPerPage)}
                //   data={filteredData.length > 0 ? filteredData : team}
                //   pagination
                //   responsive
                //   striped
                //   noDataComponent="No Data Available"
                //   onChangePage={(page) => setCurrentPage(page)}
                //   onChangeRowsPerPage={(rowsPerPage) =>
                //     setRowsPerPage(rowsPerPage)
                //   }
                //   customStyles={{
                //     rows: {
                //       style: {
                //         alignItems: "flex-start", // Aligns text to the top-left corner
                //       },
                //     },
                //     cells: {
                //       style: {
                //         textAlign: "left", // Ensures text is aligned to the left
                //       },
                //     },
                //   }}
                // />
                <DataTable
                columns={tableColumns(currentPage, rowsPerPage)}
                data={searchQuery.length > 0 ? filteredData : team} // Show testimonial initially, filteredData only when searching
                pagination
                responsive
                striped
                noDataComponent="No Data Available" // Show when search returns nothing
                onChangePage={(page) => setCurrentPage(page)}
                onChangeRowsPerPage={(rowsPerPage) => setRowsPerPage(rowsPerPage)}
                customStyles={{
                  rows: {
                    style: {
                      alignItems: "flex-start",
                    },
                  },
                  cells: {
                    style: {
                      textAlign: "left",
                    },
                  },
                }}
              />
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row>

                    <Col md={6} className="mt-2">
                        <Form.Group controlId="projectCategory">
                        <Form.Label>Project Category<span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={formData.project_category || ""} // Set selected option for edit mode
                            onChange={(e) => handleChange("project_category", e.target.value)}
                        >
                            <option disabled value="">Choose Category</option>
                            {projectcategory.map((a, index) => (
                            <option key={a.id} value={a.title}>{a.title}</option>
                            ))}
                        </Form.Select>
                        </Form.Group>
                        <p className="text-danger">{errors.project_category}</p>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectName">
                          <Form.Label>Project Name<span className="text-danger">*</span></Form.Label>
                          <Form.Control
                              type="text"
                              value={formData.project_name || ""} // Allow manual input
                              onChange={(e) => handleChange("project_name", e.target.value)}
                              placeholder="Enter Project Name"
                          />
                          <p className="text-danger">{errors.project_name}</p>
                      </Form.Group>
                  </Col>

                    {/* <Col md={6} className="mt-2">
                        <Form.Group controlId="projectName">
                            <Form.Label>Project Name</Form.Label>
                            <Form.Select
                                value={formData.project_name || ""} // Set selected option for edit mode
                                onChange={(e) => handleChange("project_name", e.target.value)}
                                disabled={!formData.project_category} // Disable the project name field until a category is selected
                            >
                                <option disabled value="">
                                {formData.project_category ? "Choose Project Name" : "Select a Category First"}
                                </option>
                                {filteredProjectNames.length > 0 ? (
                                filteredProjectNames.map((a, index) => (
                                    <option key={a.id} value={a.project_name}>
                                    {a.project_name}
                                    </option>
                                ))
                                ) : (
                                <option disabled>No project names available</option>
                                )}
                            </Form.Select>
                            <p className="text-danger">{errors.project_name}</p>
                        </Form.Group>
                    </Col> */}


                    {/* <Col md={6} className="mt-2">
                        <Form.Group controlId="projectName">
                        <Form.Label>Project Name</Form.Label>
                        <Form.Select
                            value={formData.project_name || ""} // Set selected option for edit mode
                            onChange={(e) => handleChange("project_name", e.target.value)}
                        >
                            <option disabled value="">Choose Project Name</option>
                            {projectname.map((a, index) => (
                            <option key={a.id} value={a.project_name}>{a.project_name}</option>
                            ))}
                        </Form.Select>
                        </Form.Group>
                        <p className="text-danger">{errors.project_name}</p>
                    </Col> */}
                    <Col md={6} className="mt-2">
                      <NewResuableForm
                        // label="Project Location"
                        label={<span>Project Location<span className="text-danger">*</span></span>}
                        placeholder="Enter Project Location"
                        name="project_location"
                        type="text"
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.project_location}
                        // charLimit={1000}
                      />
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectTotalTonnage">
                        <Form.Label>Project Total Tonnage<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="project_total_tonnage"
                          value={formData.project_total_tonnage || ""}
                          onChange={(e) =>
                            handleChange(
                              "project_total_tonnage",
                              e.target.value
                            )
                          }
                          isInvalid={errors.project_total_tonnage}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_total_tonnage}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectYearOfCompletion">
                        <Form.Label>Project Completion Year<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="project_year_of_completion"
                          value={formData.project_year_of_completion || ""}
                          onChange={(e) =>
                            handleChange(
                              "project_year_of_completion",
                              e.target.value
                            )
                          }
                          isInvalid={errors.project_year_of_completion}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_year_of_completion}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectStatus">
                        <Form.Label>Project Status<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="project_status"
                          value={formData.project_status || ""}
                          onChange={(e) =>
                            handleChange("project_status", e.target.value)
                          }
                          isInvalid={errors.project_status}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_status}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mt-2">
                      <Form.Group controlId="projectInfo">
                        <Form.Label>Project Information<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          name="project_info"
                          value={formData.project_info || ""}
                          onChange={(e) =>
                            handleChange("project_info", e.target.value)
                          }
                          isInvalid={errors.project_info}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.project_info}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mt-4">
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
                        // label={"Upload project thumbnail Image"}
                        label={<span>Upload project thumbnail Image<span className="text-danger">*</span></span>}
                        placeholder={"Upload Image"}
                        name={"img"}
                        type={"file"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.img}
                        imageDimensiion="Image must be 338x220 pixels"
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

export default ProjectDetails;
