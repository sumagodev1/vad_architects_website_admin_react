

////final
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
import { FaEdit } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';
import "../../App.scss";

const HeaderContact = () => {
  const { searchQuery, handleSearch, setData, filteredData } = useSearchExport();
  const [team, setTeam] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
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
      name: <CustomHeader name="Phone Number 1" />,
      cell: (row) => <span>{row.phone1}</span>,
    },
    {
      name: <CustomHeader name="Phone Number 2" />,
      cell: (row) => <span>{row.phone2}</span>,
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
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    // const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await instance.get("header-contact/findheaderContacts", {
        headers: {
          "Content-Type": "application/json",

        },
        withCredentials: true,  // Correctly placed here
      });
      
        
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
  
    // Indian number must start with +91 and followed by 10 digits starting with 9, 8, 7, or 6
    const indianNumberRegex = /^\+91[9876]\d{9}$/;
  
    // US number must start with +1 and be exactly 10 digits long
    const usNumberRegex = /^\+1\d{10}$/;
  
    // Validate Phone 1
    if (!formData.phone1?.trim()) {
      errors.phone1 = "Phone number is required";
      isValid = false;
    } else if (!indianNumberRegex.test(formData.phone1) && !usNumberRegex.test(formData.phone1)) {
      errors.phone1 = "Phone 1 must be a valid Indian (+91) or US (+1) number";
      isValid = false;
    }
  
    // Validate Phone 2
    if (!formData.phone2?.trim()) {
      errors.phone2 = "Phone number is required";
      isValid = false;
    } else if (!indianNumberRegex.test(formData.phone2) && !usNumberRegex.test(formData.phone2)) {
      errors.phone2 = "Phone 2 must be a valid Indian (+91) or US (+1) number";
      isValid = false;
    }
  
    setErrors(errors);
    return isValid;
  };  
  

  // const validateForm = (formData) => {
  //   let errors = {};
  //   let isValid = true;

  //   if (!formData.phone1?.trim()) {
  //     errors.phone1 = "Mobile number is required";
  //     isValid = false;
  //   } else if (!/^\d+$/.test(formData.phone1)) {
  //     errors.phone1 = "Mobile number must contain only digits";
  //     isValid = false;
  //   } else if (formData.phone1.length !== 10) {
  //     errors.phone1 = "Mobile number must be exactly 10 digits";
  //     isValid = false;
  //   }

  //   if (!formData.phone2?.trim()) {
  //     errors.phone2 = "Mobile number is required";
  //     isValid = false;
  //   } else if (!/^\d+$/.test(formData.phone2)) {
  //     errors.phone2 = "Mobile number must contain only digits";
  //     isValid = false;
  //   } else if (formData.phone2.length !== 10) {
  //     errors.phone2 = "Mobile number must be exactly 10 digits";
  //     isValid = false;
  //   }

  //   setErrors(errors);
  //   return isValid;
  // };

  const handleChange = (name, value) => {

    const sanitizedValue = value.replace(/[^0-9+]/g, "");

    // Ensure + appears only at the start
    if (sanitizedValue.length > 0 && sanitizedValue[0] !== "+") {
      return; // Ignore input if + is not at the start
    }

    setFormData((prevFormData) => ({ ...prevFormData, [name]: sanitizedValue }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm(formData)) {
      setLoading(true);
      // const accessToken = localStorage.getItem("accessToken");
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      try {
        await instance.put(`header-contact/headercontact/${editingId}`, data, {
          headers: {
            "Content-Type": "application/json",
            // If needed, uncomment the following line and set accessToken correctly
            // Authorization: "Bearer " + accessToken,
          },
          withCredentials: true,  // Correct placement of withCredentials
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
            <Card.Header>
              {/* <Row>
                <Col className="d-flex justify-content-end align-items-center">
                  {showTable ? (
                    <SearchInput
                      searchQuery={searchQuery}
                      onSearch={handleSearch}
                      showExportButton={false}
                    />
                  )
                    :
                    <Button variant="outline-secondary" onClick={() => setShowTable(true)}>
                      View
                    </Button>
                  }
                </Col>
              </Row> */}
            </Card.Header>

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
                        label={<span>Phone 1 (Enter US number)<span className="text-danger">*</span></span>}
                        placeholder={"Enter first phone number"}
                        type={"text"}
                        name={"phone1"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.phone1}
                      />
                    </Col>
                    <Col md={6}>
                      <NewResuableForm
                        label={<span>Phone 2 (Enter Indian number)<span className="text-danger">*</span></span>}
                        placeholder={"Enter second phone number"}
                        type={"text"}
                        name={"phone2"}
                        onChange={handleChange}
                        initialData={formData}
                        error={errors.phone2}
                      />
                    </Col>
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

export default HeaderContact;
