


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
import { ThreeDots  } from 'react-loader-spinner'; 
import { Tooltip, OverlayTrigger,  } from 'react-bootstrap';
import "../../App.scss";
const OurTeam = () => {
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
      name: <CustomHeader name="Name" />,
      cell: (row) => <span>{row?.name}</span>,
    },
    {
      name: <CustomHeader name="Designation" />,
      cell: (row) => <span>{row.designation}</span>,
    },
    {
      name: <CustomHeader name="Description" />,
      cell: (row) => <span>{row.description}</span>,
    },
    // {
    //   name: <CustomHeader name="Position No" />,
    //   cell: (row) => <span>{row.position_no}</span>,
    // },
    {
      name: <CustomHeader name="Image" />,
      cell: (row) => (
        <img
          src={row.img}
          alt="OurTeam"
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
      const response = await instance.get("team/find-teammembers", {
        headers: {
          // Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        withCredentials: true, 
      });
      const reversedData = response.data.responseData.reverse();
      setTeam(reversedData);
      setData(reversedData);
    } catch (error) {
      console.error(
        "Error fetching team:",
        error.response || error.message || error
      );
    }    finally {
      setLoading(false);
    }
  };

  const validateForm = (formData) => {
    let errors = {};
    let isValid = true;

    if (!formData.img) {
      errors.img = "Image is required with 678x650 pixels";
      isValid = false;
    } else if (formData.img instanceof File && !validateImageSize(formData.img)) {
      errors.img = "Image is not 678x650 pixels";
      isValid = false;
    }


    if (!formData.name?.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.designation?.trim()) {
      errors.designation = "Designation is required";
      isValid = false;
    } else if (formData.designation.length > 40) {
      errors.designation = "Designation must not exceed 40 characters";
      isValid = false;
    }
  
    if (!formData.description?.trim()) {
      errors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length > 151) {
      errors.description = "Description must not exceed 151 characters";
      isValid = false;
    }
    // formData.description.split(/\s+/).length > 25
    // if (!formData.position_no) {
    //   errors.position_no = "Position no is required";
    //   isValid = false;
    // }
    setErrors(errors);

    return isValid;
  };

  const validateImageSize = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width === 678 && img.height === 650) {
          resolve();
        } else {
          reject("Image must be 678x650 pixels");
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
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm(formData)) {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      try {
        if (editMode) {
          await instance.put(`team/update-teammember/${editingId}`, data, {
            headers: {
              // Authorization: "Bearer " + accessToken,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true, 
          });
          toast.success("Data Updated Successfully");
          const updatedTeam = team.map((member) =>
            member.id === editingId ? formData : member
          );
          setTeam(updatedTeam);
        } else {
          await instance.post("team/create-teammember", data, {
            headers: {
              // Authorization: "Bearer " + accessToken,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true, 
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
        if (
          error.response &&
          error.response.data &&
          error.response.data.message ===
            "Position no already exists, please enter another number"
        ) {
          setErrors({
            ...errors,
            position_no: "Position no already exists, please enter another number",
          });
        } else {
          toast.error("An error occurred. Please try again.");
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
                  await instance.delete(`team/isdelete-teammember/${id}`, {
                    headers: {
                      // Authorization: `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                    withCredentials: true, 
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
                    `team/isactive-teammember/${id}`,
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
                  <Button   variant="outline-secondary" onClick={handleView}>
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
              //       rows: {
              //         style: {
              //           alignItems: "flex-start", // Aligns text to the top-left corner
              //         },
              //       },
              //       cells: {
              //         style: {
              //           textAlign: "left", // Ensures text is aligned to the left
              //         },
              //       },
              //     }}
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
                      // label={"Upload photo"}
                      label={<span>Upload photo<span className="text-danger">*</span></span>}
                      placeholder={"Upload Image"}
                      name={"img"}
                      type={"file"}
                      onChange={handleChange}
                      initialData={formData}
                      error={errors.img}
                      imageDimensiion="Image must be 678*650 pixels" 
                    />
                    </Col>
                    <Col md={6} className="mt-2">
                    <NewResuableForm
                      // label={"Name"}
                      label={<span>Name<span className="text-danger">*</span></span>}
                      placeholder={"Enter Name"}
                      name={"name"}
                      type={"text"}
                      onChange={handleChange}
                      initialData={formData}
                      error={errors.name}
                    />
                  </Col>
                  <Col md={6} className="mt-2">
                    <NewResuableForm
                      // label={"Designation"}
                      label={<span>Designation<span className="text-danger">*</span></span>}
                      placeholder={"Enter Designation"}
                      name={"designation"}
                      type={"text"}
                      onChange={handleChange}
                      initialData={formData}
                      error={errors.designation}
                    />
                  </Col>
                  <Col md={6} className="mt-2">
                    <NewResuableForm
                      // label={"Description "}
                      label={<span>Description<span className="text-danger">*</span></span>}
                      placeholder={"Enter Description "}
                      name={"description"}
                      type={"text"}
                      onChange={handleChange}
                      initialData={formData}
                      textarea
                      error={errors.description}
                    />
                  </Col>
                  {/* <Col md={6} className="mt-2">
                    <NewResuableForm
                      // label={"Position Number"}
                      label={<span>Position Number<span className="text-danger">*</span></span>}
                      placeholder={"Enter Position Number "}
                      name={"position_no"}
                      type={"number"}
                      onChange={handleChange}
                      initialData={formData}
                      error={errors.position_no}
                    />
                  </Col> */}
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

export default OurTeam;