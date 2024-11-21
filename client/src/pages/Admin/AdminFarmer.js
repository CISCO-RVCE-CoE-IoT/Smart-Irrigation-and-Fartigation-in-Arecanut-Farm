import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';

const AdminFarm = () => {
    const location = useLocation();
    const { farmerId, admin_id } = location.state || {};
    const [farmerDetails, setFarmerDetails] = useState(null);
    const [farmDetails, setFarmDetails] = useState([]); // State for farm details
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [editField, setEditField] = useState(''); // State to track which field is being edited
    const [formData, setFormData] = useState({}); // State to hold form data

    useEffect(() => {
        if (farmerId && admin_id) {
            const fetchDetails = async () => {
                try {
                    const response = await fetch('/admin/farmer', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            admin_id: admin_id,
                            farmer_id: farmerId
                        })
                    });
                    const data = await response.json();
                    setFarmerDetails(data.farmer_data); // Assuming the response has farmer_data
                    setFarmDetails(data.farm_data); // Assuming the response has farm_data
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching details:', error);
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [farmerId, admin_id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!farmerDetails) {
        return <div>No farmer details found.</div>;
    }

    const handleEditClick = (field) => {
        setEditField(field);
        setFormData({ [field]: farmerDetails[field] });
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Handle save logic here (e.g., update state or send to server)
        setFarmerDetails({ ...farmerDetails, ...formData });
        setShowModal(false);
    };

    return (
        <div className='container my-5'>
            <div className=''>
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-lg-3">
                            <div className='farmer_details borderring' style={{ height: '100%' }}>
                                <div className='d-flex align-items-center justify-content-between'>
                                    <h5 className='text-secondary'>Farmer Details</h5>
                                    <h6 className='text-secondary'>Total Farms : <strong className='text-dark'>{farmerDetails.total_farms}</strong> </h6>
                                </div>
                                <hr className='my-2'></hr>
                                <div className='mt-2'>
                                    <p className='mb-3'><b>ID:</b> {farmerDetails.farmer_id}</p>
                                    <p className='mb-3'><b>First Name:</b> {farmerDetails.farmer_fname} <i className="fa-solid fa-pencil" onClick={() => handleEditClick('farmer_fname')}></i></p>
                                    <p className='mb-3'><b>Last Name:</b> {farmerDetails.farmer_lname} <i className="fa-solid fa-pencil" onClick={() => handleEditClick('farmer_lname')}></i></p>
                                    <p className='mb-3'><b>Phone:</b> {farmerDetails.farmer_phone} <i className="fa-solid fa-pencil" onClick={() => handleEditClick('farmer_phone')}></i></p>
                                    <p className='mb-3'><b>Email:</b> {farmerDetails.farmer_email} <i className="fa-solid fa-pencil" onClick={() => handleEditClick('farmer_email')}></i></p>
                                    <p className='mb-3'><b>Join Date:</b> {new Date(farmerDetails.join_date).toLocaleDateString()} </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-9">
                            <div className='borderring' style={{ height: '100%' }}>
                                <div className='d-flex align-items-center justify-content-between'>
                                    <h5 className='text-secondary'>Farms</h5>
                                    <div>
                                        <button className='btn btn-sm btn-secondary me-2'>Add Farm</button>
                                        <button className='btn btn-sm btn-secondary'>Edit Farm</button>
                                    </div>
                                </div>
                                <hr className='my-2'></hr>
                                <div className='farms-farmer mt-1' style={{ maxHeight: '30vh', overflow: 'auto' }}>
                                    <table className="table table-hover">
                                        <thead className="sticky-header">
                                            <tr>
                                                <th>Id</th>
                                                <th>Farm Name</th>
                                                <th>Farm Size (acres)</th>
                                                <th>Creation Date</th>
                                                <th>Auto On Threshold</th>
                                                <th>Auto Off Threshold</th>
                                                <th>Location Coordinates</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {farmDetails.map((farm, index) => (
                                                <tr key={index}>
                                                    <td>{farm.farm_id}</td>
                                                    <td>{farm.farm_name}</td>
                                                    <td>{farm.farm_size}</td>
                                                    <td>{new Date(farm.creation_date).toLocaleDateString()}</td>
                                                    <td>{farm.auto_on_threshold}</td>
                                                    <td>{farm.auto_off_threshold}</td>
                                                    <td>
                                                        <ul>
                                                            {farm.farm_location_cordinates.map((coord, idx) => (
                                                                <li key={idx}>{coord}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='w-100 borderring mt-3'>
                        {/* Additional content can go here */}
                    </div>
                </div>
            </div>

            {/* Modal for editing farmer details */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Farmer Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formFarmerDetail">
                            <Form.Label>{editField.replace('_', ' ').toUpperCase()}</Form.Label>
                            <Form.Control
                                type="text"
                                name={editField}
                                value={formData[editField]}
                                onChange={handleFormChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary btn-sm" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="secondary btn-sm" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminFarm;
