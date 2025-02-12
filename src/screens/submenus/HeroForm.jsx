//// not in use
import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import axios from "../../api/AxiosInstance";
import { useSearchExport } from "../../context/SearchExportContext";
import { ShowContext } from "../../context/ShowContext";
import NewReusableForm from "../../components/form/NewResuableForm";
import ReusableTable from "../../components/table/ReusableTable";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TablePagination from "../../components/pagination/TablePagination";

const HeroForm = () => {
  const { searchQuery, handleSearch, handleExport, setData, filteredData } = useSearchExport();
  const { shows, toggleForm, toggleShow } = useContext(ShowContext);

  const [team, setTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", message: "" });

  const tableColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "mobile", label: "Mobile" },
    { key: "message", label: "Message" },
  ];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await axios.get("heroform");
      setTeam(response.data);
      setData(response.data); // Update the context data
    } catch (error) {
      console.error("Error fetching team:", error);
    }
  };

  const validateForm = (formData) => {
    let errors = {};
    let isValid = true;

    if (!formData.name?.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email address";
      isValid = false;
    }

    if (!formData.mobile?.trim()) {
      errors.mobile = "Mobile number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = "Mobile number must be exactly 10 digits";
      isValid = false;
    }

    if (!formData.message?.trim()) {
      errors.message = "Message is required";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm(formData)) {
      try {
        if (editMode) {
          await axios.put(`heroform/${editingId}`, formData);
          toast.success("Data Updated Successfully");
        } else {
          await axios.post("heroform", formData);
          toast.success("Data Submitted Successfully");
        }
        fetchTeam();
        toggleForm();
        toggleShow();
        setEditMode(false);
        setFormData({ name: "", email: "", mobile: "", message: "" });
      } catch (error) {
        console.error("Error handling form submission:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`heroform/${id}`);
      toast.success("Data Deleted Successfully");
      fetchTeam();
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Error deleting data");
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
      setFormData({ name: "", email: "", mobile: "", message: "" });
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
            />
          ) : (
            <Card className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <NewReusableForm
                      label={"Name"}
                      placeholder={"Enter Name"}
                      type={"text"}
                      name={"name"}
                      onChange={handleChange}
                      initialData={formData}
                    />
                    {errors.name && <span className="error text-danger">{errors.name}</span>}
                  </Col>
                  <Col md={6}>
                    <NewReusableForm
                      label={"Email"}
                      placeholder={"Enter Email"}
                      type={"text"}
                      name={"email"}
                      onChange={handleChange}
                      initialData={formData}
                    />
                    {errors.email && <span className="error text-danger">{errors.email}</span>}
                  </Col>
                  <Col md={6}>
                    <NewReusableForm
                      label={"Mobile"}
                      placeholder={"Enter Mobile"}
                      type={"number"}
                      name={"mobile"}
                      onChange={handleChange}
                      initialData={formData}
                    />
                    {errors.mobile && <span className="error text-danger">{errors.mobile}</span>}
                  </Col>
                  <Col md={6}>
                    <NewReusableForm
                      label={"Message"}
                      placeholder={"Enter Message"}
                      type={"text"}
                      name={"message"}
                      onChange={handleChange}
                      initialData={formData}
                    />
                    {errors.message && <span className="error text-danger">{errors.message}</span>}
                  </Col>
                  <div className="mt-3">
                    <Button type="submit" variant="primary">
                      {editMode ? "Update" : "Submit"}
                    </Button>
                    <Button
                      onClick={() => setEditMode(false)}
                      variant="secondary"
                      className="ms-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </Row>
              </Form>
            </Card>
          )}
        </Col>
      </Row>
      {/* <Row>
        <Col>
          <TablePagination />
        </Col>
      </Row> */}
    </Container>
  );
};

export default HeroForm;
