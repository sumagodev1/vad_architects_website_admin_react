
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Tooltip, OverlayTrigger,
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

import "../../App.scss";
import { Label } from "recharts";
const Carousal = () => {
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
      name: <CustomHeader name="View" />,
      cell: (row) => <span>{row.view}</span>,
    },
    {
      name: <CustomHeader name="Media" />,
      cell: (row) => {
        if (typeof row.img === 'string') {
          const fileExtension = row.img.split('.').pop().toLowerCase();
          const isVideo = ['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension);
    
          return isVideo ? (
            <video
              src={row.img}
              autoPlay
              controls
              style={{ width: "100px", height: "auto" }}
            />
          ) : (
            <img
              src={row.img}
              alt="Event"
              style={{ width: "100px", height: "auto" }}
            />
          );
        } else {
          return <div>Invalid Media</div>;
        }
      },
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
          {/* <OverlayTrigger
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
          </OverlayTrigger> */}
          {/* <OverlayTrigger
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
          </OverlayTrigger> */}
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
    if (formData.img) {
      if (formData.img instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(formData.img);
      } else if (typeof formData.img === "string") {
        setImagePreview(formData.img);
      }
    } else {
      setImagePreview("");
    }
  }, [formData.img]);


  const fetchTeam = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
    try {
      const response = await instance.get("homeslider/find-homeslider", {
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      });
      const reversedData = response.data.responseData.reverse();
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
    console.log("formData", formData);

    let errors = {};
    let isValid = true;


    // Check if formData.img is a File object
    if (!editMode) { // Only check for the image if not in edit mode
      if (!formData.img || !(formData.img instanceof File)) {
        errors.img = "Image is required with 1920*685 for Desktop and 1360*1055 pixels for mobile";
        isValid = false;
      } else {
        // Validate image size
        const isSizeValid = validateImageSize(formData.img);
        if (!isSizeValid) {
          errors.img = "Media size must be 1920*685for Desktop and 1360*1055 pixels for mobile";
          isValid = false;
        }
      }
    } else {
      // In edit mode, if an image is provided, validate its size
      if (formData.img && formData.img instanceof File) {
        const isSizeValid = validateImageSize(formData.img);
        if (!isSizeValid) {
          errors.img = "Media size must be 1920*685 for Desktop and 1360*1055 pixels for mobile";
          isValid = false;
        }
      }
    }
    if (!formData.view) {
      errors.view = "View selection is required";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };


  const validateImageSize = (file, view) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        // Skip validation for non-image files
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        if ((img.width === 1920 || img.width === 1360) && img.height === 685 || img.height === 1055) {
          resolve();
        } else {
          reject("Media size: 1920x685 for Desktop view, 1360x1055 for Mobile view. Videos must be less than 10 mb");
        }
      };
      img.onerror = () => reject("Error loading image");
      img.src = URL.createObjectURL(file);
    });
  };

  const renderPreview = () => {
    if (!imagePreview) {
      return <div>No preview available</div>;
    }

    try {
      if (imagePreview.startsWith('data:')) {
        const mimeType = imagePreview?.split(',')[0]?.split(':')[1]?.split(';')[0];
        const isVideo = mimeType.startsWith('video/');
        const isImage = mimeType.startsWith('image/');

        if (isVideo) {
          return <video autoPlay controls src={imagePreview} style={{ width: "100px", height: "auto", marginBottom: "10px" }} />;
        } else if (isImage) {
          return <img src={imagePreview} alt="Selected Preview" style={{ width: "100px", height: "auto", marginBottom: "10px" }} />;
        } else {
          return <div>Unsupported file type</div>;
        }
      } else {
        const isVideo = imagePreview.endsWith('.mp4') || imagePreview.endsWith('.webm') || imagePreview.endsWith('.avi');
        const isImage = imagePreview.endsWith('.png') || imagePreview.endsWith('.jpg') || imagePreview.endsWith('.jpeg');

        if (isVideo) {
          return <video src={imagePreview} autoPlay controls style={{ width: "100px", height: "auto", marginBottom: "10px" }} />;
        } else if (isImage) {
          return <img src={imagePreview} alt="Selected Preview" style={{ width: "100px", height: "auto", marginBottom: "10px" }} />;
        } else {
          return <div>Unsupported file type</div>;
        }
      }
    } catch (error) {
      console.error("Error rendering preview:", error);
      return <div>Error rendering preview</div>;
    }
  };

  const handleChange = async (name, value) => {
    if (name === "img" && value instanceof File) {
      try {
        const fileType = value.type?.split("/")[0];

        if (fileType === "image" || fileType === "video") {
          setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

          // Update preview if the file is an image or video
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(value);
        }
      } catch (error) {
        setErrors((prevErrors) => ({ ...prevErrors, img: "Error processing file" }));
        setImagePreview("");
      }
    } else {
      setFormData({ ...formData, [name]: value });
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
      console.log("data", data);

      try {
        if (editMode) {

          await instance.put(`homeslider/update-homeslider/${editingId}`, data, {
            headers: {
              Authorization: "Bearer " + accessToken,
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Data Updated Successfully");
          const updatedTeam = team.map((member) =>
            member.id === editingId ? formData : member
          );
          setTeam(updatedTeam);
        } else {
          await instance.post("homeslider/create-homeslider", data, {
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
        setShowTable(true);
      } catch (error) {
        console.error("Error handling form submission:", error);
      } finally {
        setLoading(false);
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
                  await instance.delete(`homeslider/isdelete-homeslider/${id}`, {
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
                    `homeslider/isactive-homeslider/${id}`,
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
    console.log("selectedMember", selectedMember);

    setFormData({
      ...selectedMember,
      img: selectedMember.img // Ensure the URL or file is set correctly
    });
    setEditMode(true);
    setShowTable(false);
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

                    {/* <Button
                      variant="outline-success"
                      onClick={handleAdd}
                      className="ms-2 mb-3"
                    >
                      Add
                    </Button> */}
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
                    <Col md={12}>
                      {renderPreview()}
                      <NewResuableForm
                        // label={"Upload Home Sliding Media"}
                        label={<span>Upload Home Sliding Media<span className="text-danger">*</span></span>}
                        placeholder={"Upload Media"}
                        name={"img"}
                        type={"file"}
                        onChange={(name, value) => {
                          const file = value;
                          if (file) {
                            handleChange(name, file);
                          }
                        }}
                        initialData={formData}
                        error={errors.img}
                        imageDimensiion="Media size: 1920x685 for Desktop view, 1360x1055 for Mobile view. Videos must be less than 10 mb"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="formView" className="mt-2">
                        <Form.Label>View<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="select"
                          name="view"
                          value={formData.view || ""}
                          onChange={(e) =>
                            handleChange(e.target.name, e.target.value)
                          }
                        >
                          <option value="">Select View</option>
                          <option value="Mobile">Mobile</option>
                          <option value="Desktop">Desktop</option>
                        </Form.Control>
                        {errors.view && (
                          <p className="text-danger">{errors.view}</p>
                        )}
                      </Form.Group>
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

export default Carousal;
