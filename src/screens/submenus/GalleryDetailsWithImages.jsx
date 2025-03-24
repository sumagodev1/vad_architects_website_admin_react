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
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaPlus, FaTrashAlt } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { ThreeDots } from "react-loader-spinner";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import "../../App.scss";
import axios from "axios";
const GalleryDetailsWithImages = () => {
  const baseURL = instance.defaults.baseURL;
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
  const [imagePreview, setImagePreviews] = useState("");
  const [showTable, setShowTable] = useState(true); // New state for toggling form and table view
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [gallerycategory, setgallerycategory] = useState([]);
  const [galleryname, setgalleryname] = useState([]);
  const [filteredgalleryNames, setFilteredgalleryNames] = useState([]);
  const [isCategorySelected, setIsCategorySelected] = useState(false);

  const [loading, setLoading] = useState(false);
  const CustomHeader = ({ name }) => (
    <div style={{ fontWeight: "bold", color: "black", fontSize: "16px" }}>
      {name}
    </div>
  );

  const CustomHeader2 = ({ name }) => (
    <div style={{ fontWeight: "bold", color: "black", fontSize: "16px", marginLeft:"auto" }}>
      {name}
    </div>
  );

  const tableColumns = (currentPage, rowsPerPage) => [
    {
      name: <CustomHeader name="Sr. No." />,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width:'95px',
    },
  
    {
      name: <CustomHeader name="Category" />,
      cell: (row) => <span>{row.gallery_category}</span>,
      width:'120px',
    },
    {
      name: <CustomHeader name="Images" />,
      cell: (row) => {
        const images = JSON.parse(row.gallery_images);
  
        if (images && images.length > 0) {
          return (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                maxHeight: "250px", // Set fixed height for the image container
                overflowY: "auto", // Enable vertical scrolling only for images
              }}
            >
              {images.map((image, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={`${baseURL}${image}`}
                    alt={`galleryImage-${index}`}
                    style={{
                      width: "70px",
                      height: "70px",
                      marginRight: "5px",
                      marginBottom: "5px",
                    }}
                  />
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}
                  >
                    <Button
                      className="p-0"
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "red",
                        color: "white",
                        borderColor: "red",
                        height: "20px",
                        width: "20px",
                        fontSize: "10px",
                      }}
                      onClick={() => handleDelete2(row.id, image)}
                    >
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </div>
              ))}
            </div>
          );
        } else {
          return <span>No Images Available</span>;
        }
      },
    },
  
    {
      name: <CustomHeader2 name="Actions" />,
      cell: (row) => (
        <div className="d-flex" >
          <OverlayTrigger placement="top" overlay={<Tooltip id="edit-tooltip">Edit</Tooltip>}>
            <Button className="ms-1" onClick={() => toggleEdit(row.id)}>
              <FaPlus />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}>
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
      style: { flex: "none" },
    },
  ];  

  // const tableColumns = (currentPage, rowsPerPage) => [
  //   {
  //     name: <CustomHeader name="Sr. No." />,
  //     selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
  //   },

  //   {
  //     name: <CustomHeader name="Gallery Category" />,
  //     cell: (row) => <span>{row.gallery_category}</span>,
  //   },
  //   {
  //     name: <CustomHeader name="Images" />,
  //     cell: (row) => {
  //       const images = JSON.parse(row.gallery_images); // Parse the JSON string into an array

  //       // Check if images array exists and is not empty
  //       if (images && images.length > 0) {
  //         return (
  //           <div style={{ display: "flex", flexWrap: "wrap" }}>
  //             {images.map((image, index) => (
  //               <>
  //                 {" "}
  //                 <img
  //                   key={index}
  //                   src={`${baseURL}${image}`} // Access each image
  //                   alt={`galleryImage-${index}`}
  //                   style={{
  //                     width: "100px",
  //                     height: "auto",
  //                     marginRight: "5px",
  //                     marginBottom: "5px",
  //                   }}
  //                 />
  //                 <OverlayTrigger
  //                   placement="top"
  //                   overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}
  //                 >
  //                   <Button
  //                     className="p-0"
  //                     style={{
  //                       backgroundColor: "red",
  //                       color: "white",
  //                       borderColor: "red",
  //                       height: "20px",
  //                       width: "20px",
  //                       fontSize: "10px",
  //                     }}
  //                     onClick={() => handleDelete2(row.id, image)} 
  //                   >
  //                     <FaTrash />
  //                   </Button>
  //                 </OverlayTrigger>
  //               </>
  //             ))}
  //           </div>
  //         );
  //       } else {
  //         return <span>No Images Available</span>; // Fallback if no images exist
  //       }
  //     },
  //   },

  //   {
  //     name: <CustomHeader name="Actions" />,
  //     cell: (row) => (
  //       <div className="d-flex">
  //         <OverlayTrigger
  //           placement="top"
  //           overlay={<Tooltip id="edit-tooltip">Edit</Tooltip>}
  //         >
  //           <Button className="ms-1" onClick={() => toggleEdit(row.id)}>
  //             {/* <FaEdit /> */}
  //             <FaPlus />
  //           </Button>
  //         </OverlayTrigger>
  //         <OverlayTrigger
  //           placement="top"
  //           overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}
  //         >
  //           <Button
  //             className="ms-1"
  //             style={{
  //               backgroundColor: "red",
  //               color: "white",
  //               borderColor: "red",
  //             }}
  //             onClick={() => handleDelete(row.id)}
  //           >
  //             <FaTrash />
  //           </Button>
  //         </OverlayTrigger>
  //         <OverlayTrigger
  //           placement="top"
  //           overlay={
  //             <Tooltip id="visibility-tooltip">
  //               {eyeVisibilityById[row.id] ? "Hide" : "Show"}
  //             </Tooltip>
  //           }
  //         >
  //           <Button
  //             className="ms-1"
  //             style={{
  //               backgroundColor: eyeVisibilityById[row.id] ? "red" : "green",
  //               borderColor: eyeVisibilityById[row.id] ? "red" : "green",
  //               color: "white",
  //             }}
  //             onClick={() => handleIsActive(row.id, !eyeVisibilityById[row.id])}
  //           >
  //             {eyeVisibilityById[row.id] ? <FaEyeSlash /> : <FaEye />}
  //           </Button>
  //         </OverlayTrigger>
  //       </div>
  //     ),
  //   },
  // ];

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
        setImagePreviews(reader.result); // Use the base64 URL from the FileReader
      };
      reader.readAsDataURL(formData.img); // Read as data URL
    } else if (formData.img && typeof formData.img === "string") {
      setImagePreviews(formData.img); // Directly use the image URL from formData.img
    } else {
      setImagePreviews(""); // Clear the preview if no image is provided
    }
  }, [formData.img]);

  const fetchTeam = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken"); // Retrieve access token
    try {
      const response = await instance.get(
        "/galleryImages/galleryImages",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
          },
        }
      );
      const reversedData = response.data.reverse();
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

  const validateForm = (formData,isEditMode) => {
    let errors = {};
    let isValid = true;

  //   if (!isEditMode || (formData.img && formData.img.length > 0)) {
  //   if (formData.img && formData.img.length > 0) {
  //     formData.img.forEach((file, index) => {
  //       if (!validateImageSize(file)) {
  //         errors.img = `Image ${file.name} is required with 338x220 pixels`;
  //         isValid = false;
  //       }
  //     });
  //   } else {
  //     errors.img = "Image is not 338x220 pixels";
  //     isValid = false;
  //   }
  // }

  if (!isEditMode || (formData.img && formData.img.length > 0)) {
    if (formData.img && formData.img.length > 0) {
      formData.img.forEach((file) => {
        if (file.size > 1 * 1024 * 1024) { // Check if file size exceeds 1MB
          errors.img = `Image "${file.name}" must be 1MB or less`;
          isValid = false;
        }
      });
    } else {
      errors.img = "Image is required";
      isValid = false;
    }
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

  // const validateImageSize = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.onload = () => {
  //       if (img.width === 338 && img.height === 220) {
  //         resolve(); // Validation successful
  //       } else {
  //         reject(`Image "${file.name}" must be 338x220 pixels`); // Reject with specific error
  //       }
  //     };
  //     img.onerror = () => reject("Error loading image");
  //     img.src = URL.createObjectURL(file); // Set image source
  //   });
  // };

  const validateImageSize = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > 1 * 1024 * 1024) { // 1MB = 1024 * 1024 bytes
        reject(`Image "${file.name}" must be 1MB or less`);
      } else {
        resolve(); // Validation successful
      }
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
    if (name === "gallery_category") {
      const categoryId = gallerycategory.find((c) => c.gallery_category === value)?.id;
      console.log(categoryId);
  
      setFormData((prevFormData) => ({
        ...prevFormData,
        gallery_category: value,
        gallery_category_id: categoryId,
      }));
  
      // Reset the flag and filtered gallery names when category changes
      setIsCategorySelected(false);
      setFilteredgalleryNames([]);
    }  else {
      setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    }
  
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await instance.get("galleryDetails/get-galleryDetails");
        console.log("gallery:", response.data.responseData);

        setgallerycategory(
          Array.isArray(response.data.responseData)
            ? response.data.responseData
            : []
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        setgallerycategory([]);
      }
    };

    fetchCategories();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm(formData,editMode)) {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const data = new FormData();

      // Add other fields to FormData
      data.append("gallery_category_id", formData.gallery_category_id);
      data.append("gallery_category", formData.gallery_category);

      // Check if formData.img is an array and contains files
      console.log(formData.img); // Verify formData.img contains files

      // Append each file from formData.img to FormData
      if (formData.img && Array.isArray(formData.img)) {
        formData.img.forEach((file) => {
          console.log(file); // Log each file to verify they are correct
          data.append("gallery_images", file); // Append each file individually
        });
      }

      // Log the FormData to check if files are being appended
      for (let pair of data.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      try {
        if (editMode) {
          await instance.put(
            `galleryImages/galleryImages/${editingId}/images`,
            data,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          await instance.post(
            "galleryImages/create-galleryImageDetailsWithImages",
            data,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
        fetchTeam();

        setEditMode(false);
        setFormData({});
        setImagePreviews("");
        setShowTable(true);
      } catch (error) {
        console.error("Error handling form submission:", error);
        // toast.error(error);
        if (error.response && error.response.data) {
          if (
            error.response.data.message ===
            "Gallery category already exists. Please choose another name."
          ) {
            toast.error(
              "A gallery category with this name already exists. Please choose another."
            );
          } else {
            toast.error(error.response.data.message || "An error occurred");
          }
        } else {
          toast.error("An error occurred while submitting data");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div
          style={{
            textAlign: "center",
            padding: "25px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            maxWidth: "420px",
            margin: "0 auto",
          }}
        >
          <FaTrashAlt size={50} color="red" />
          <h2 style={{ marginTop: "15px", fontWeight: "bold" }}>Are you sure?</h2>
          <p style={{ fontSize: "16px", color: "#555" }}>
            Do you really want to delete this record? This action cannot be undone.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
              gap: "10px",
            }}
          >
            <button
              style={{
                backgroundColor: "#ccc",
                color: "#333",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
              onClick={onClose}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#bbb")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#ccc")}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={async () => {
                setLoading(true);
                const accessToken = localStorage.getItem("accessToken");
                try {
                  await instance.delete(
                    `galleryImages/galleryImages/${id}/is-delete`,
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
              Yes, Delete
            </button>
          </div>
        </div>
      ),
    });
  };
  
  // const handleDelete2 = async (id, imagePath) => {
  //   confirmAlert({
  //     title: "Confirm to delete",
  //     message: "Are you sure you want to delete this image?",
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
  //         <h2>Confirm to delete</h2>
  //         <p>Are you sure you want to delete this image?</p>
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
  //                 // Send the image path along with the gallery ID to the backend
  //                 await instance.delete(
  //                   `GalleryImages/GalleryImages/${id}/delete-image`,
  //                   {
  //                     headers: {
  //                       Authorization: `Bearer ${accessToken}`,
  //                       "Content-Type": "application/json",
  //                     },
  //                     data: { imagePath: imagePath }, // Sending imagePath in the request body
  //                   }
  //                 );
  //                 toast.success("Image Deleted Successfully");
  //                 fetchTeam();
  //               } catch (error) {
  //                 console.error("Error deleting data:", error);
  //                 toast.error("Error deleting image");
  //               } finally {
  //                 setLoading(false);
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

  const handleDelete2 = async (id, imagePath) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this image?",
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
          <p style={{ fontSize: "16px", color: "#555" }}>
            Do you really want to delete this image? This action cannot be undone.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button className="btn btn-secondary" onClick={() => onClose()} style={{ marginRight: "10px" }}>
              Cancel
            </button>
            <button
              style={{ marginRight: "10px" }}
              className="btn btn-danger"
              onClick={async () => {
                setLoading(true);
                const accessToken = localStorage.getItem("accessToken");
                try {
                  // Send the image path along with the project ID to the backend
                  await instance.delete(
                    `galleryImages/galleryImages/${id}/delete-image`,
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                      data: { imagePath: imagePath }, // Sending imagePath in the request body
                    }
                  );
                  toast.success("Image Deleted Successfully");
                  fetchTeam();
                } catch (error) {
                  console.error("Error deleting data:", error);
                  toast.error("Error deleting image");
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
                    `galleryImages/galleryImages/${id}/is-active`,
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

    if (!selectedMember) return;

    // Parse `gallery_images` if it's a stringified JSON array
    let parsedImages = [];
    try {
      parsedImages = JSON.parse(selectedMember.gallery_images);
    } catch (error) {
      console.error("Error parsing gallery_images:", error);
    }

    setEditingId(id);
    setFormData({
      ...selectedMember,
      gallery_images: parsedImages, // Store it as an array
    });

    console.log("%%%%%%%%%%%%%", {
      ...selectedMember,
      gallery_images: parsedImages,
    });

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
    setShowTable(true);
    // window.location.reload();
  };
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    console.log(files); // Check if files are correctly selected

    // Validate image size for each file before setting it in formData
    const validFiles = [];
    const invalidFiles = [];
    for (const file of files) {
      try {
        await validateImageSize(file); // Wait for validation to complete
        validFiles.push(file); // If valid, add to valid files
      } catch (error) {
        invalidFiles.push({ file, error }); // If invalid, store the error
      }
    }

    // Update the formData with valid images
    setFormData({
      ...formData,
      img: validFiles, // Store only valid files in formData
    });

    // Create image previews for valid files
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Handle invalid files by setting the error messages
    if (invalidFiles.length > 0) {
      const errors = invalidFiles.map((item) => ({
        file: item.file.name,
        error: item.error,
      }));
      setErrors({ img: errors });
    } else {
      setErrors({ img: null }); // Clear previous errors if there are no invalid files
    }
  };

  console.log(formData); // Make sure the files are in formData

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
                    <Col md={12}>
                      {imagePreview && imagePreview.length > 0 && (
                        <div>
                          {imagePreview.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Selected Preview ${index}`}
                              style={{
                                width: "100px",
                                height: "auto",
                                marginBottom: "10px",
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <Form.Group controlId="gallery_images">
                        <Form.Label>Upload multiple gallery Images<span className="text-danger">*</span> <small className="text-danger">(Image must be 1MB or less)</small></Form.Label>
                        <Form.Control
                          type="file"
                          name="gallery_images"
                          multiple
                          onChange={handleImageChange}
                          isInvalid={errors.img}
                        />
                        {(!editMode || (editMode && errors.img)) &&
                          errors.img && (
                            <Form.Control.Feedback type="invalid">
                              {Array.isArray(errors.img) ? (
                                errors.img.map((err, idx) => (
                                  <div key={idx}>{err.error}</div>
                                ))
                              ) : (
                                <div>{errors.img}</div>
                              )}
                            </Form.Control.Feedback>
                          )}
                        
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      {formData.gallery_images &&
                        formData.gallery_images.length > 0 && (
                          <div>
                            {formData.gallery_images.map((preview, index) => (
                              <img
                                key={index}
                                src={`${baseURL}${preview}`} // Ensure the correct URL format
                                alt={`Selected Preview ${index}`}
                                style={{
                                  width: "100px",
                                  height: "auto",
                                  margin: "10px",
                                }}
                              />
                            ))}
                          </div>
                        )}
                    </Col>
                    <Col md={6} className="mt-2">
                      <Form.Group controlId="galleryCategory">
                        <Form.Label>gallery Category<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="select"
                          value={formData.gallery_category || ""}
                          onChange={(e) =>
                            handleChange("gallery_category", e.target.value)
                          }
                          isInvalid={errors.gallery_category}
                          disabled={editMode} 
                          style={{ appearance: "auto", WebkitAppearance: "auto", MozAppearance: "auto" }}
                        >
                          <option disabled value="">
                            Choose Category
                          </option>
                          {gallerycategory.map((a) => (
                            <option key={a.id} value={a.gallery_category}>
                              {a.gallery_category}
                            </option>
                          ))}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.gallery_category}
                        </Form.Control.Feedback>
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

export default GalleryDetailsWithImages;
