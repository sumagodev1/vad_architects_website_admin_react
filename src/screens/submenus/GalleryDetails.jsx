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
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaTrashAlt } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { ThreeDots } from "react-loader-spinner";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import "../../App.scss";
import axios from "axios";
const GalleryDetails = () => {
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
      name: <CustomHeader name="Gallery Category" />,
      cell: (row) => <span>{row.gallery_category}</span>,
    },
    {
      name: <CustomHeader name="Image" />,
      cell: (row) => (
        <img
          src={row.img}
          alt="GalleryDetails"
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
        "galleryDetails/get-galleryDetails",
        {
          headers: {
            // Authorization: "Bearer " + accessToken,
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
    if (!formData.gallery_category?.trim()) {
      errors.gallery_category = "gallery category is required";
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
    }  else {
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      }
  };
  
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   // console.log("Submitting form with data:", formData);
  //   if (validateForm(formData)) {
  //     setLoading(true);
  //     const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
  //     const data = new FormData();

  //         // Add categoryId and projectId explicitly
  //   data.append("gallery_category", formData.gallery_category); 
    
  //   // Handle file (image)
  //   if (formData.img instanceof File) {
  //     data.append("img", formData.img);
  //   }

  //   // console.log("Form data being sent:", [...data.entries()]);

  //   //   console.log("Form data being sent:", [...data.entries()]);

  //     try {
  //       if (editMode) {
  //         await instance.put(
  //           `galleryDetails/update-galleryDetails/${editingId}`,
  //           data,
  //           {
  //             headers: {
  //               Authorization: "Bearer " + accessToken,
  //               "Content-Type": "multipart/form-data",
  //             },
  //           }
  //         );
  //         toast.success("Data Updated Successfully");
  //         const updatedTeam = team.map((member) =>
  //           member.id === editingId ? formData : member
  //         );
  //         setTeam(updatedTeam);
  //       } else {
  //         await instance.post("galleryDetails/create-galleryDetails", data, {
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
  //       if (error.response && error.response.data) {
  //         if (
  //           error.response.data.message === "Gallery category already exists when update"
  //         ) {
  //           toast.error("This gallery category already exists. Please enter another gallery category.");
  //         } else {
  //           toast.error(error.response.data.message || "An error occurred");
  //         }
  //       } else {
  //         toast.error("An error occurred while submitting data");
  //       }
  //     } finally {
  //       setLoading(false); // Set loading to false
  //     }
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (validateForm(formData)) {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
      const data = new FormData();
  
      // Add category to form data
      data.append("gallery_category", formData.gallery_category);
  
      // Handle file (image)
      if (formData.img instanceof File) {
        data.append("img", formData.img);
      }
  
      // Function to check if gallery category exists
      const checkCategoryExists = async (category) => {
        try {
          const response = await instance.get(`/galleryDetails/check-category/${category}`);
          console.log("Check response:", response.data); // Log the response
          return response.data.exists; // Assuming your backend sends { exists: true/false }
        } catch (error) {
          console.error('Error checking category:', error);
          return false;
        }
      };
  
      try {
        // Check if category exists before submission
        const categoryExists = await checkCategoryExists(formData.gallery_category);
        console.log('Category exists:', categoryExists); // Log result
  
        if (categoryExists) {
          toast.error("This gallery category already exists. Please enter another gallery category.");
          return; // Stop the form submission
        }
  
        if (editMode) {
          // Handle update
          await instance.put(
            `galleryDetails/update-galleryDetails/${editingId}`,
            data,
            {
              headers: {
                // Authorization: "Bearer " + accessToken,
                "Content-Type": "multipart/form-data",
              },
              withCredentials: true, 
            }
          );
          toast.success("Gallery Details Updated Successfully");
  
          const updatedTeam = team.map((member) =>
            member.id === editingId ? formData : member
          );
          setTeam(updatedTeam);
        } else {
          // Handle creation
          await instance.post("galleryDetails/create-galleryDetails", data, {
            headers: {
              // Authorization: "Bearer " + accessToken,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true, 
          });
          toast.success("Gallery Details Submitted Successfully");
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
            error.response.data.message === "Gallery category already exists when update"
          ) {
            toast.error("This gallery category already exists. Please enter another gallery category.");
          } else {
            toast.error(error.response.data.message || "An error occurred");
          }
        } else {
          toast.error("An error occurred while submitting data");
        }
      } finally {
        setLoading(false); // Set loading to false after submission
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
            textAlign: "center",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(5, 5, 5, 0.2)",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <FaTrashAlt size={50} color="red" />
          <h2 style={{ marginTop: "15px", fontWeight: "bold" }}>Are you sure?</h2>
          <p style={{ fontSize: "16px", color: "#555" }}>Do you really want to delete this record? This action cannot be undone.</p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button className="btn btn-secondary" onClick={() => onClose()} style={{ marginRight: "10px" }}>
              No
            </button>
            <button
              style={{ marginRight: "10px" }}
              className="btn btn-danger"
              onClick={async () => {
                setLoading(true);
                const accessToken = localStorage.getItem("accessToken");
                try {
                  await instance.delete(
                    `galleryDetails/isdelete-galleryDetails/${id}`,
                    {
                      headers: {
                        // Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                      withCredentials: true, 
                    }
                  );
                  toast.success("Gallery Details Deleted Successfully");
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
              Yes, Delete
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
                    `galleryDetails/isactive-galleryDetails/${id}`,
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
                    `Gallery Details ${isVisible ? "hidden" : "shown"} successfully`
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
                  data={searchQuery.length > 0 ? filteredData : team} // Show team initially, filteredData only when searching
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
                  <Col md={6}>
                      <NewResuableForm
                        // label="Gallery category"
                        label={<span>Gallery category<span className="text-danger">*</span></span>}
                        placeholder="Enter Project Category"
                        name="gallery_category"
                        type="text"
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.gallery_category}
                        // charLimit={1000}
                      />
                    </Col>
                    <Col md={12} className="mt-2">
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
                        // label={"Upload gallery thumbnail image"}
                        label={<span>Upload gallery thumbnail image<span className="text-danger">*</span></span>}
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

export default GalleryDetails;
