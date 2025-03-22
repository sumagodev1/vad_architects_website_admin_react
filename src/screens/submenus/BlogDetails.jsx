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
const BlogDetails = () => {

  const baseURL = instance.defaults.baseURL;

  const { searchQuery, handleSearch, handleExport, setData, filteredData } =
    useSearchExport();

  const [team, setTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [eyeVisibilityById, setEyeVisibilityById] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [imagePreview2, setImagePreview2] = useState("");
  const [showTable, setShowTable] = useState(true); // New state for toggling form and table view
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const CustomHeader = ({ name }) => (
    <div style={{ fontWeight: "bold", color: "black", fontSize: "16px" ,width:"auto"}}>
      {name}
    </div>
  );



  const tableColumns = (currentPage, rowsPerPage) => [
    {
      name: <CustomHeader name="Sr. No." />,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "80px",
    },

    {
      name: <CustomHeader name="Title" />,
      cell: (row) => <span>{row.title}</span>,
      width: "auto",
    },
    // {
    //   name: <CustomHeader name="Short Description" />,
    //   cell: (row) => <span>{row.shortDesc}</span>,
    // },
    // {
    //   name: <CustomHeader name="Long Description" />,
    //   cell: (row) => <span>{row.longDesc}</span>,
    //   width: "auto",
    // },
    {
      name: <CustomHeader name="Short Description" />,
      cell: (row) => (
        <span
          style={{
            // display: "block",
            overflow: "hidden",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
            textOverflow: "ellipsis",
          }}
        >
          {row.shortDesc}
        </span>
      ),
    },
    // {
    //   name: <CustomHeader name="Long Description" />,
    //   cell: (row) => (
    //     <span
    //       style={{
    //         overflow: "hidden",
    //         WebkitLineClamp: 4,
    //         WebkitBoxOrient: "vertical",
    //         display: "-webkit-box",
    //         textOverflow: "ellipsis",
    //       }}
    //     >
    //       {row.longDesc}
    //     </span>
    //   ),
    //   width: "auto",
    // },
    {
      name: <CustomHeader name="Image" />,
      cell: (row) => (
        <img
          src={row.img}
          alt="BlogDetails"
          style={{ width: "100px", height: "auto" }}
        />
      ),
      width: "150px",
    },
    {
      name: <CustomHeader name="Date" />,
      selector: (row) =>
        //  (row.createdAt)?.slice(0, 10),
      row.createdAt
      ? new Date(row.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
      : "N/A",
      key: "date",
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

  useEffect(() => {
    if (formData.img2 && formData.img2 instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview2(reader.result);
      };
      reader.readAsDataURL(formData.img2);
    } else if (formData.img2 && typeof formData.img2 === "string") {
      setImagePreview2(`${baseURL}${formData.img2}`);
    } else {
      setImagePreview2("");
    }
  }, [formData.img2]);

  const fetchTeam = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
    try {
      const response = await instance.get("blogdetails/find-blogdetails", {
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
    }    finally {
      setLoading(false);
    }
  };

  const validateForm = (formData) => {
    let errors = {};
    let isValid = true;

    if (!formData.img) {
      errors.img = "Image is required with 700x645 pixels";
      isValid = false;
    } else if (formData.img instanceof File && !validateImageSize(formData.img)) {
      errors.img = "Image is not 700x645 pixels";
      isValid = false;
    }

    if (!formData.img2) {
      errors.img2 = "Image is required with 1400x495 pixels";
      isValid = false;
    } else if (formData.img2 instanceof File && !validateImageSize(formData.img2)) {
      errors.img2 = "Image is not 1400x495 pixels";
      isValid = false;
    }

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!formData.shortDesc?.trim()) {
      errors.shortDesc = "Short Description is required";
      isValid = false;
    }
    if (!formData.longDesc?.trim()) {
      errors.longDesc = "Long Description is required";
      isValid = false;
    }
    setErrors(errors);
    return isValid;
  };

  const validateImageSize = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width === 700 && img.height === 645) {
          resolve();
        } else {
          reject("Image must be 700x645 pixels");
        }
      };
      img.onerror = () => reject("Error loading image");
      img.src = URL.createObjectURL(file);
    });
  };

  const validateImageSize2 = (file) => {
    return new Promise((resolve, reject) => {
      const img2 = new Image();
      img2.onload = () => {
        if (img2.width === 1400 && img2.height === 495) {
          resolve();
        } else {
          reject("Image must be 1400x495 pixels");
        }
      };
      img2.onerror = () => reject("Error loading image");
      img2.src = URL.createObjectURL(file);
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
    } else if (name === "img2" && value instanceof File) {
      try {
        await validateImageSize2(value);
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, img2: "" }));
      } catch (error) {
        setErrors((prevErrors) => ({ ...prevErrors, img2: error }));
        setImagePreview2(""); // Ensure imagePreview2 is cleared in case of error
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  

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
  //   } else {
  //     setFormData({ ...formData, [name]: value });
  //   }

  //   if (name === "img2" && value instanceof File) {
  //     try {
  //       await validateImageSize2(value);
  //       setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  //       setErrors((prevErrors) => ({ ...prevErrors, img2: "" }));
  //     } catch (error) {
  //       setErrors((prevErrors) => ({ ...prevErrors, img2: error }));
  //       setImagePreview2("");
  //     }
  //   } else {
  //     setFormData({ ...formData, [name]: value });
  //   }

  // };

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
          await instance.put(`blogdetails/update-blogdetail/${editingId}`, data, {
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
          await instance.post("blogdetails/create-blogdetail", data, {
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
                  await instance.delete(`blogdetails/isdelete-blogdetail/${id}`, {
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


// ////v1
// const handleIsActive = async (id, isVisible) => {
//   confirmAlert({
//     title: "Confirm to change visibility",
//     customUI: ({ onClose }) => (
//       <div
//         style={{
//           textAlign: "left",
//           padding: "20px",
//           backgroundColor: "white",
//           borderRadius: "8px",
//           boxShadow: "0 4px 8px rgba(5, 5, 5, 0.2)",
//           maxWidth: "400px",
//           margin: "0 auto",
//         }}
//       >
//         <h2>Confirm to change visibility</h2>
//         <p>
//           Are you sure you want to {isVisible ? "hide" : "show"} this data?
//         </p>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             marginTop: "20px",
//           }}
//         >
//           <button
//             style={{ marginRight: "10px" }}
//             className="btn btn-primary"
//             onClick={async () => {
//               setLoading(true);
//               const accessToken = localStorage.getItem("accessToken");
//               try {
//                 await instance.put(
//                   `blogdetails/isactive-blogdetail/${id}`,
//                   { isVisible },
//                   {
//                     headers: {
//                       Authorization: `Bearer ${accessToken}`,
//                       "Content-Type": "application/json",
//                     },
//                   }
//                 );
//                 toast.success(
//                   `Data ${isVisible ? "hidden" : "shown"} successfully`
//                 );

//                 // Update visibility state both locally and in localStorage
//                 setEyeVisibilityById((prev) => {
//                   const newState = { ...prev, [id]: isVisible };
//                   localStorage.setItem("eyeVisibility", JSON.stringify(newState));
//                   return newState;
//                 });

//                 fetchTeam();
//               } catch (error) {
//                 console.error("Error updating visibility:", error);
//                 toast.error("Error updating visibility");
//               } finally {
//                 setLoading(false); // Set loading to false
//               }
//               onClose();
//             }}
//           >
//             Yes
//           </button>
//           <button className="btn btn-secondary" onClick={() => onClose()}>
//             No
//           </button>
//         </div>
//       </div>
//     ),
//   });
// };

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
                    `blogdetails/isactive-blogdetail/${id}`,
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
                      // label={"Upload Blog Image"}
                      label={<span>Upload Blog thumbnail Image<span className="text-danger">*</span></span>}
                      placeholder={"Upload Image"}
                      name={"img"}
                      type={"file"}
                      onChange={handleChange}
                      initialData={formData}
                      error={errors.img}
                      imageDimensiion="Image must be 700*645 pixels" 
                    />
                  
                  </Col>
                  <Col md={12} className="mt-2">
                    {imagePreview2 && (
                      <img
                        src={imagePreview2}
                        alt="Selected Preview"
                        style={{
                          width: "100px",
                          height: "auto",
                          marginBottom: "10px",
                        }}
                      />
                    )}
                    <NewResuableForm
                      // label={"Upload Blog Image"}
                      label={<span>Upload Blog Image<span className="text-danger">*</span></span>}
                      placeholder={"Upload Image"}
                      name={"img2"}
                      type={"file"}
                      onChange={handleChange}
                      initialData={formData}
                      error={errors.img2}
                      imageDimensiion="Image must be 1400*495 pixels" 
                    />
                  
                  </Col>
                  <Col md={6} className="mt-2">
                    <NewResuableForm
                      // label={"Title"}
                      label={<span>Title<span className="text-danger">*</span></span>}
                      placeholder={"Enter Title"}
                      name={"title"}
                      type={"text"}
                      onChange={handleChange}
                      initialData={formData}
                      error={errors.title}
                    />
          
                  </Col>
                  <Col md={12} className="mt-2">
                    <NewResuableForm
                      // label={"Short Description "}
                      label={<span>Short Description<span className="text-danger">*</span></span>}
                      placeholder={"Short Description "}
                      name={"shortDesc"}
                      type={"text"}
                      onChange={handleChange}
                      initialData={formData}
                      textarea
                      error={errors.shortDesc}
                    />
            
                  </Col>
                  <Col md={12} className="mt-2">
                    <NewResuableForm
                      // label={"Long Description "}
                      label={<span>Long Description<span className="text-danger">*</span></span>}
                      placeholder={"Long Description "}
                      name={"longDesc"}
                      type={"text"}
                      onChange={handleChange}
                      initialData={formData}
                      textarea
                      useJodit={true}
                      error={errors.longDesc}
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

export default BlogDetails;
