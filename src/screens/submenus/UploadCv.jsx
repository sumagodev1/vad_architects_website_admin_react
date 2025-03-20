import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { FaDownload, FaTrash, FaEye } from "react-icons/fa";
import { useSearchExport } from "../../context/SearchExportContext";
import { ShowContext } from "../../context/ShowContext";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../api/AxiosInstance";
import DataTable from "react-data-table-component";
import { ThreeDots } from "react-loader-spinner";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css for confirm alert
import { Modal } from 'react-bootstrap';


const UploadCv = () => {
  const {
    searchQuery,
    handleSearch,
    handleExport,
    setData,
    filteredData,
    data,
  } = useSearchExport();
  const { shows } = useContext(ShowContext);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  //for show modal 
  const [showModal, setShowModal] = useState(false); // State to handle modal visibility
  const [selectedRecord, setSelectedRecord] = useState(null); // State to store the selected record for viewing

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await instance.get("uploadcv/find-uploadcv", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const reversedData = response.data.responseData.reverse();
      setTeam(reversedData);
      setData(reversedData);
    } catch (error) {
      console.error("Error fetching team data:", error);
      // toast.error("Error fetching team data");
    } finally {
      setLoading(false);
    }
  };

    // This should be inside the component, after fetching data
    const paginatedData = searchQuery.trim()
    ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : team.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const customStyles = {
    rows: {
      style: {
        wordBreak: "break-word",
        whiteSpace: "normal",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal !important", // This mimics the effect of `!important`
        wordWrap: "break-word",
      },
    },
  };

  // const exportData = () => {
  //   const dataToExport = searchQuery.trim() ? filteredData : team;
  //   handleExport(dataToExport, tableColumns, "CvList");
  // };

  const exportData = () => {
    const dataToExport = searchQuery.trim() ? filteredData : team;
    // Check if we should include the "Docs" column
    const modifiedColumns = tableColumns.filter(col => col.key !== "cv"); 
    handleExport(dataToExport, modifiedColumns, "CvList");
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
                  await instance.delete(`uploadcv/isdelete-uploadcv/${id}`, {
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

  const CustomHeader = ({ name }) => (
    <div style={{ fontWeight: "bold", color: "black", fontSize: "16px" }}>
      {name}
    </div>
  );

  const tableColumns = [
    {
      name: <CustomHeader name="Sr. No." />,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      key: "srNo",
      width: "100px",
    },
    {
      name: <CustomHeader name="Name" />,
      selector: (row) => row.name,
      key: "name",
      width: "300px",
    },
    {
      name: <CustomHeader name="Mobile Number" />,
      selector: (row) => row.phone,
      key: "phone",
      width: "200px",
    },
    {
      name: <CustomHeader name="Email" />,
      selector: (row) => row.email,
      key: "email",
      width: "200px",
    },
    {
      name: <CustomHeader name="Subject" />,
      selector: (row) => row.subject,
      key: "subject",
      width: "300px",
      cell: (row) => {
        const subject = row.subject;
        const truncatedSubject = subject.length > 40 ? subject.slice(0, 40) + "..." : subject;
    
        return (
          <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {truncatedSubject}
          </div>
        );
      },

      // cell: (row) => (
      //   <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
      //     {row.subject}
      //   </div>
      // ),
    },
    {
      name: <CustomHeader name="Message" />,
      selector: (row) => row.message,
      key: "message",
      wrap: true, // Enables text wrapping in the column
      width: "400px", // Adjust width as per requirement
      cell: (row) => {
        const message = row.message;
        const truncatedMessage = message.length > 60 ? message.slice(0, 60) + "..." : message;
    
        return (
          <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {truncatedMessage}
          </div>
        );
      },
      // cell: (row) => (
      //   <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
      //     {row.message}
      //   </div>
      // ),
    },
    {
      name: <CustomHeader name="Docs" />,
      cell: (row) => (
        <a href={row.cv} target="_blank" rel="noopener noreferrer">
          view cv
        </a>
      ),
      key: "cv",
    },
    {
      name: <CustomHeader name="Date" />,
      selector: (row) => 
        // row.createdAt?.slice(0, 10),
      row.createdAt
      ? new Date(row.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
      : "N/A",
      key: "message",
    },
    {
      name: <CustomHeader name="Actions" />,
      cell: (row) => (
        <div className="d-flex">
          <OverlayTrigger
            key={`tooltip-${tooltipKey}`}
            placement="top"
            overlay={<Tooltip id="view-tooltip">View</Tooltip>}
            >
            <Button
              className="ms-1"
              style={{ backgroundColor: "blue", color: "white", borderColor: "blue" }}
              onClick={() => viewDetails(row)} // Pass the full record to the modal
            >
            <FaEye />
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
        </div>
      ),
      key: "actions",
    },
  ];

    // for modal show record
    const viewDetails = (record) => {
      setSelectedRecord(record); // Set the selected record
      setShowModal(true); // Show the modal
    };
  
    const [tooltipKey, setTooltipKey] = useState(0);
  
    const handleCloseModal = () => {
      setShowModal(false); // Hide the modal
      setSelectedRecord(null); // Reset the selected record
      setTooltipKey(prevKey => prevKey + 1); // Trigger a re-render of tooltips
    };


  return (
    <Container>
      <Row>
        <Col>
          <SearchInput
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onExport={exportData}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          {loading ? (
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
          ) : (
            <DataTable
              columns={tableColumns}
              data={paginatedData}  // Replace this line with paginatedData
              pagination
              paginationServer
              paginationTotalRows={
                filteredData.length > 0 ? filteredData.length : team.length
              }
              onChangePage={(page) => setCurrentPage(page)}  // Update page
              onChangeRowsPerPage={(newRowsPerPage) => setRowsPerPage(newRowsPerPage)}  // Update rows per page
              paginationPerPage={rowsPerPage}
              responsive
              striped
              noDataComponent="No Data Available"
              customStyles={customStyles}
            />
          )}
        </Col>
      </Row>

        {/* Modal to view the selected record */}
      <Modal show={showModal} onHide={handleCloseModal} centered  backdrop="static" keyboard={false} size="lg">
        <Modal.Header closeButton className="modal-header-custom">
          {/* <Modal.Title>{selectedRecord?.name || 'Record Details'}</Modal.Title> */}
          <Modal.Title>{selectedRecord?.name ? `${selectedRecord.name} Details` : 'Record Details'}</Modal.Title>

        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <div className="row">
              <div className="col-md-6 col-lg-6 col-sm-12">
                <div className="form-group">
                  <label><strong>Name:</strong></label>
                  <div className="form-control-readonly">{selectedRecord.name}</div>
                </div>
              </div>
              <div className="col-md-6 col-lg-6 col-sm-12">
                <div className="form-group">
                  <label><strong>Email:</strong></label>
                  <div className="form-control-readonly">{selectedRecord.email}</div>
                </div>
              </div>

              <div className="col-md-6 col-lg-6 col-sm-12 mt-2">
                <div className="form-group">
                  <label><strong>Mobile Number:</strong></label>
                  <div className="form-control-readonly">{selectedRecord.phone}</div>
                </div>
              </div>
              <div className="col-md-6 col-lg-6 col-sm-12 mt-2">
                <div className="form-group">
                  <label><strong>Date:</strong></label>
                  <div className="form-control-readonly">
                    {/* {selectedRecord.createdAt?.slice(0, 10)} */}
                    {selectedRecord.createdAt
                    ? new Date(selectedRecord.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
                    : "N/A"}
                    </div>
                </div>
              </div>

              <div className="col-12 mt-2">
                <div className="form-group">
                  <label><strong>Subject:</strong></label>
                  <div className="form-control-readonly">{selectedRecord.subject}</div>
                </div>
              </div>

              <div className="col-12 mt-2">
                <div className="form-group">
                  <label><strong>Message:</strong></label>
                  <div className="form-control-readonly message-textarea">
                    {selectedRecord.message}
                  </div>
                </div>
              </div>

              <div className="col-12 mt-2">
                <div className="form-group">
                  <label><strong>Uploaded CV:</strong></label>
                  <div className="readonly mt-2 ms-2">
                  <a href={selectedRecord.cv} target="_blank" rel="noopener noreferrer">
                    view cv
                  </a>
                  </div>
                </div>
              </div>

            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} className="btn-custom">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default UploadCv;
