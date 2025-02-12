///// not in use
import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useSearchExport } from "../../context/SearchExportContext";
import { ShowContext } from "../../context/ShowContext";
import NewResuableForm from "../../components/form/NewResuableForm";
import ReusableTable from "../../components/table/ReusableTable";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TablePagination from "../../components/pagination/TablePagination";
import instance from "../../api/AxiosInstance";

const ProjectTitleName = () => {
  const { searchQuery, handleSearch, handleExport, setData, filteredData } =
    useSearchExport();
  const { shows, toggleForm, toggleShow } = useContext(ShowContext);
  const [team, setTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const tableColumns = [

    { key: "title", label: "Title" },

  ];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await instance.get("contactperson/find-contactpersons", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      setTeam(response.data.responseData);
      setData(response.data.responseData);
    } catch (error) {
      console.error("Error fetching office data:", error);
    }
  };

  const validateForm = (formData) => {
    let errors = {};
    let isValid = true;

    if (!formData.img) {
      errors.img = "Image is required";
      isValid = false;
    }

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!formData.person_name?.trim()) {
      errors.person_name = "Person Name is required";
      isValid = false;
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email person_name";
      isValid = false;
    }

    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm(formData)) {
      const accessToken = localStorage.getItem("accessToken");
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      try {
        if (editMode) {
          await instance.put(`contactperson/update-contactperson/${editingId}`, data, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Data Updated Successfully");
        } else {
          await instance.post("contactperson/create-contactperson", data, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Data Submitted Successfully");
        }
        fetchTeam();
        toggleForm();
        toggleShow();
        setEditMode(false);
        setFormData({});
      } catch (error) {
        console.error("Error handling form submission:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      await instance.delete(
        `contactperson/isdelete-contactperson/${id}`,
        {},
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
      console.error("Error deleting office:", error);
      toast.error("Deletion failed. Please try again.");
    }
  };

  const handleIsActive = async (id, isVisible) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      await instance.put(
        `contactperson/isactive-contactperson/${id}`,
        { isVisible },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (isVisible) {
        toast.success("Data hidden successfully");
      } else {
        toast.success("Data shown successfully");
      }
      
      fetchTeam();
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Error updating visibility");
    }
  };

  const toggleEdit = (leaderId) => {
    const memberToEdit = team.find((item) => item.id === leaderId);
    if (memberToEdit) {
      setEditingId(leaderId);
      setEditMode(true);
      toggleForm();
      toggleShow();
      setFormData(memberToEdit);
    }
  };

  useEffect(() => {
    if (shows) {
      setEditMode(false);
      setEditingId(null);
      setFormData({});
    }
  }, [shows]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Container>
      <Row>
        <Col>
          <SearchInput
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onExport={handleExport}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          {!shows && !editMode ? (
            <ReusableTable
              columns={tableColumns}
              data={searchQuery.trim() ? filteredData : team}
              onEdit={toggleEdit}
              onDelete={handleDelete}
              onShow={handleIsActive}
            />
          ) : (
            <Card className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <NewResuableForm
                      label="Image Upload"
                      placeholder="Upload Image"
                      name="img"
                      type="file"
                      onChange={handleChange}
                      initialData={formData}
                    />
                    {errors.img && <p className="text-danger">{errors.img}</p>}
                  </Col>
                  <Col md={6}>
                    <NewResuableForm
                      label="Title"
                      placeholder="Enter Title"
                      name="title"
                      type="text"
                      onChange={handleChange}
                      initialData={formData}
                    />
                    {errors.title && (
                      <p className="text-danger">{errors.title}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <NewResuableForm
                      label="Person Name"
                      placeholder="Enter person name"
                      name="person_name"
                      type="text"
                      onChange={handleChange}
                      initialData={formData}
                
                    />
                    {errors.person_name && (
                      <p className="text-danger">{errors.person_name}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <NewResuableForm
                      label="Phone"
                      placeholder="Enter Phone"
                      type="number"
                      name="phone"
                      onChange={handleChange}
                      initialData={formData}
                    />
                    {errors.phone && (
                      <span className="error text-danger">{errors.phone}</span>
                    )}
                  </Col>
                  <Col md={6}>
                    <NewResuableForm
                      label="Email"
                      placeholder="Enter Email"
                      type="text"
                      name="email"
                      onChange={handleChange}
                      initialData={formData}
                    />
                    {errors.email && (
                      <span className="error text-danger">{errors.email}</span>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col className="d-flex justify-content-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="me-2"
                      onClick={() => {
                        setFormData({});
                        toggleForm();
                        toggleShow();
                        setEditMode(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      {editMode ? "Update" : "Submit"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          )}
        </Col>
      </Row>

      {!shows && !editMode && (
        <Row>
          <Col>
            <TablePagination data={searchQuery.trim() ? filteredData : team} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProjectTitleName;
