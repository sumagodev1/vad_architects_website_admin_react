// import React, { useState, useEffect, useContext } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Button,
//   Tooltip,
//   OverlayTrigger,
// } from "react-bootstrap";
// import { useSearchExport } from "../../context/SearchExportContext";
// import { ShowContext } from "../../context/ShowContext";
// import SearchInput from "../../components/search/SearchInput";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import instance from "../../api/AxiosInstance";
// import DataTable from "react-data-table-component";
// import { ThreeDots } from "react-loader-spinner";
// import { FaDownload, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

// const CarousalForm = () => {
//   const { searchQuery, handleSearch, handleExport, setData, filteredData } =
//     useSearchExport();
//   const { shows } = useContext(ShowContext);
//   const [team, setTeam] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows per page
//   const [totalRows, setTotalRows] = useState(0);

//   useEffect(() => {
//     fetchTeam(currentPage, rowsPerPage);
//   }, [currentPage, rowsPerPage]);

//   const fetchTeam = async (page, limit) => {
//     const accessToken = localStorage.getItem("accessToken");
//     setLoading(true);
//     try {
//       const response = await instance.get("carousal-form/find-carousalform", {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//         params: {
//           page,
//           limit,
//         },
//       });
//       const reversedData = response.data.responseData.reverse();
//       setTeam(reversedData);
//       setData(reversedData);
//       setTotalRows(response.data.totalCount || reversedData.length); // Set total rows
//     } catch (error) {
//       console.error("Error fetching team data:", error);
//       toast.error("Error fetching team data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportData = () => {
//     const dataToExport = searchQuery.trim() ? filteredData : team;
//     handleExport(dataToExport, tableColumns, "UserData");
//   };

//   const handleDelete = async (id) => {
//     confirmAlert({
//       title: "Confirm to delete",
//       message: "Are you sure you want to delete this data?",
//       customUI: ({ onClose }) => (
//         <div
//           style={{
//             textAlign: "left",
//             padding: "20px",
//             backgroundColor: "white",
//             borderRadius: "8px",
//             boxShadow: "0 4px 8px rgba(5, 5, 5, 0.2)",
//             maxWidth: "400px",
//             margin: "0 auto",
//           }}
//         >
//           <h2>Confirm to delete</h2>
//           <p>Are you sure you want to delete this data?</p>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "flex-end",
//               marginTop: "20px",
//             }}
//           >
//             <button
//               style={{ marginRight: "10px" }}
//               className="btn btn-primary"
//               onClick={async () => {
//                 setLoading(true);
//                 const accessToken = localStorage.getItem("accessToken");
//                 try {
//                   await instance.delete(`carousal-form/delete/${id}`, {
//                     headers: {
//                       Authorization: `Bearer ${accessToken}`,
//                       "Content-Type": "application/json",
//                     },
//                   });
//                   toast.success("Data Deleted Successfully");
//                   fetchTeam(currentPage, rowsPerPage); // Fetch updated data
//                 } catch (error) {
//                   console.error("Error deleting data:", error);
//                   toast.error("Error deleting data");
//                 } finally {
//                   setLoading(false);
//                 }
//                 onClose();
//               }}
//             >
//               Yes
//             </button>
//             <button className="btn btn-secondary" onClick={() => onClose()}>
//               No
//             </button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const CustomHeader = ({ name }) => (
//     <div style={{ fontWeight: "bold", color: "black", fontSize: "16px" }}>
//       {name}
//     </div>
//   );

//   const tableColumns = [
//     {
//       name: <CustomHeader name="Sr. No." />,
//       selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
//       key: "srNo",
//     },
//     {
//       name: <CustomHeader name="Name" />,
//       selector: (row) => row.name,
//       key: "name",
//     },
//     {
//       name: <CustomHeader name="Email" />,
//       selector: (row) => row.email,
//       key: "email",
//     },
//     {
//       name: <CustomHeader name="Mobile No" />,
//       selector: (row) => row.mobile,
//       key: "mobile",
//     },
//     {
//       name: <CustomHeader name="Message" />,
//       selector: (row) => row.message,
//       key: "message",
//     },
//     {
//       name: <CustomHeader name="Actions" />,
//       cell: (row) => (
//         <div className="d-flex">
//           <OverlayTrigger
//             placement="top"
//             overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}
//           >
//             <Button
//               className="ms-1"
//               style={{
//                 backgroundColor: "red",
//                 color: "white",
//                 borderColor: "red",
//               }}
//               onClick={() => handleDelete(row.id)}
//             >
//               <FaTrash />
//             </Button>
//           </OverlayTrigger>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <Container>
//       <Row>
//         <Col>
//           <SearchInput
//             searchQuery={searchQuery}
//             onSearch={handleSearch}
//             onExport={exportData}
//           />
//         </Col>
//       </Row>

//       <Row>
//         <Col>
//           {loading ? (
//             <div
//               className="d-flex justify-content-center align-items-center"
//               style={{ height: "100px" }}
//             >
//               <ThreeDots
//                 height="80"
//                 width="80"
//                 radius="9"
//                 color="#000"
//                 ariaLabel="three-dots-loading"
//                 visible={true}
//               />
//             </div>
//           ) : (
//             <DataTable
//               columns={tableColumns}
//               data={filteredData.length > 0 ? filteredData : team}
//               pagination
//               paginationServer
//               paginationTotalRows={totalRows}
//               paginationDefaultPage={currentPage}
//               paginationPerPage={rowsPerPage} // Ensure this is set
//               onChangePage={(page) => setCurrentPage(page)}
//               onChangeRowsPerPage={(newRowsPerPage) =>
//                 setRowsPerPage(newRowsPerPage)
//               }
//               responsive
//               striped
//               noDataComponent="No Data Available"
//             />
//           )}
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default CarousalForm;









import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Button, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { useSearchExport } from "../../context/SearchExportContext";
import { ShowContext } from "../../context/ShowContext";
import SearchInput from "../../components/search/SearchInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../api/AxiosInstance";
import DataTable from "react-data-table-component";
import { ThreeDots } from "react-loader-spinner";
import { FaTrash,  FaEye} from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import './carousalform.css'

const CarousalForm = () => {
  const { searchQuery, handleSearch, handleExport, setData, filteredData } = useSearchExport();
  const { shows } = useContext(ShowContext);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  //for show modal 
  const [showModal, setShowModal] = useState(false); // State to handle modal visibility
  const [selectedRecord, setSelectedRecord] = useState(null); // State to store the selected record for viewing


  useEffect(() => {
    fetchTeam(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const fetchTeam = async (page, limit) => {
    const accessToken = localStorage.getItem("accessToken");
    setLoading(true);
    try {
      const response = await instance.get("carousal-form/find-carousalform", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: {
          page,
          limit,
        },
      });
      const reversedData = response.data.responseData.reverse();
      setTeam(reversedData);
      setData(reversedData);
      setTotalRows(response.data.totalCount || reversedData.length);
    } catch (error) {
      console.error("Error fetching team data:", error);
      // toast.error("Error fetching team data");
    } finally {
      setLoading(false);
    }
  };

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

  const exportData = () => {
    const dataToExport = searchQuery.trim() ? filteredData : team;
    handleExport(dataToExport, tableColumns, "UserData");
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
                  await instance.delete(`carousal-form/delete/${id}`, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                  });
                  toast.success("Data Deleted Successfully");
                  fetchTeam(currentPage, rowsPerPage);
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
    },
    {
      name: <CustomHeader name="Name" />,
      selector: (row) => row.name,
      key: "name",
    },
    {
      name: <CustomHeader name="Email" />,
      selector: (row) => row.email,
      key: "email",
      grow: 3, // This makes the column take up more space
      style: { whiteSpace: "normal" }, // Ensure content wraps if too long
    },
    {
      name: <CustomHeader name="Mobile No" />,
      selector: (row) => row.mobile,
      key: "mobile",
    },
    {
      name: <CustomHeader name="Message" />,
      // selector: (row) => row.message,
      selector: (row) => row.message.length > 30 ? row.message.slice(0, 30) + "..." : row.message,
      key: "message",
      grow: 3, // Assign even more space for the "Message" column
      style: {
        whiteSpace: "normal", // Enable text wrapping
        wordWrap: "break-word", // Break long words to prevent overflow
      },
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
              style={{ backgroundColor: "red", color: "white", borderColor: "red" }}
              onClick={() => handleDelete(row.id)}
            >
              <FaTrash />
            </Button>
          </OverlayTrigger>
        </div>
      ),
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

    // Pagination settings
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };
  
    const handleRowsPerPageChange = (e) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setCurrentPage(1);
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
              data={
                searchQuery.trim() && filteredData.length === 0
                  ? [] // Show "No Data Available" when search returns no results
                  : filteredData.length > 0
                  ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                  : team.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
              }
              pagination
              paginationServer
              paginationTotalRows={searchQuery.trim() ? filteredData.length : totalRows}
              paginationDefaultPage={currentPage}
              paginationPerPage={rowsPerPage}
              paginationRowsPerPageOptions={[10, 25, 50, 75, 100]}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setCurrentPage(1); // Reset to first page when changing rows per page
              }}
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
          <Modal.Title>Record Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <div className="row">
              <div className="col-md-6 col-lg-6 col-sm-12 mt-2">
                <div className="form-group">
                  <label><strong>Name:</strong></label>
                  <div className="form-control-readonly">{selectedRecord.name}</div>
                </div>
              </div>
              <div className="col-md-6 col-lg-6 col-sm-12 mt-2">
                <div className="form-group">
                  <label><strong>Email:</strong></label>
                  <div className="form-control-readonly">{selectedRecord.email}</div>
                </div>
              </div>

              <div className="col-md-6 col-lg-6 col-sm-12 mt-2">
                <div className="form-group">
                  <label><strong>Mobile Number:</strong></label>
                  <div className="form-control-readonly">{selectedRecord.mobile}</div>
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
                  <label><strong>Message:</strong></label>
                  <div className="form-control-readonly message-textarea">
                    {selectedRecord.message}
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

export default CarousalForm;
