import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, Button, Form, Collapse } from 'react-bootstrap';
import logo from '../User/Images/farmer.jpg';

const AdminFarm = () => {
    const location = useLocation();
    const { farmerId, admin_id } = location.state || {};
    const [farmerDetails, setFarmerDetails] = useState(null);
    const [farmDetails, setFarmDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editField, setEditField] = useState('');
    const [formData, setFormData] = useState({});
    const [firstFarmDetails, setFirstFarm] = useState({});
    const [expandedSections, setExpandedSections] = useState({});
    const [expandedSectionDevices, setExpandedSectionDevices] = useState({});
    const [activeFarmId, setActiveFarmId] = useState(null);
    const [activeSectionId, setActiveSectionId] = useState(null);

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
                    setFarmerDetails(data.farmer_data);
                    setFarmDetails(data.farm_data);
                    setLoading(false);

                    if (data.farm_data && data.farm_data.length > 0) {
                        const first_farm_id = data.farm_data[0]?.farm_id;
                        const getFarm = async (admin_id, farmerId, farmid) => {
                            try {
                                const result = await fetch(`/admin/farmer/farm`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        admin_id: admin_id,
                                        farmer_id: farmerId,
                                        farm_id: farmid
                                    })
                                });
                                const farmData = await result.json();
                                setFirstFarm(farmData);
                                console.log(farmData);
                            } catch (error) {
                                console.log(error);
                            }
                        };
                        getFarm(admin_id, farmerId, first_farm_id);
                    }
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
        setFarmerDetails({ ...farmerDetails, ...formData });
        setShowModal(false);
    };

    const toggleSectionDetails = async (farmId) => {
        if (activeFarmId === farmId) {
            setActiveFarmId(null);
        } else {
            try {
                const response = await fetch('/admin/farmer/farm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        admin_id: admin_id,
                        farmer_id: farmerId,
                        farm_id: farmId
                    })
                });
                const farmData = await response.json();
                setFirstFarm(farmData);
                setActiveFarmId(farmId);
            } catch (error) {
                console.error('Error fetching farm details:', error);
            }
        }
    };

    console.log(firstFarmDetails);
    

    const toggleSectionDevices = async (sectionId) => {
        if (activeSectionId === sectionId) {
            setActiveSectionId(null);
        } else {
            try {
                const response = await fetch('/admin/farmer/farm/section/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        admin_id: admin_id,
                        farmer_id: farmerId,
                        farm_id: firstFarmDetails[0]?.farm_id || 0,
                        section_id: sectionId
                    })
                });
                const sectionDevicesData = await response.json();
                setExpandedSectionDevices(prevState => ({
                    ...prevState,
                    [sectionId]: sectionDevicesData
                }));
                setActiveSectionId(sectionId);
            } catch (error) {
                console.error('Error fetching section devices details:', error);
            }
        }
    };

    

    const getSectionDeviceTable = (sectionId, devices) => (
        <Collapse in={activeSectionId === sectionId}>
            <div className='mx-4 my-2 bg-secondary p-2 shadow' style={{ borderRadius: '8px' }}>
                <table className="table table-hover table-striped text-center m-0">
                    <thead className="sticky-header">
                        <tr>
                            <th>Device Id</th>
                            <th>Device Name</th>
                            <th>Device Location</th>
                            <th>Installation Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(devices) && devices.map((device, key) => (
                            <tr key={key}>
                                <td>{device.section_device_id}</td>
                                <td>{device.device_name}</td>
                                <td>{device.device_location}</td>
                                <td>{new Date(device.installation_date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Collapse>
    );

    const getFarmSectionTable = (sections) => (
        <Collapse in={!!activeFarmId}>
            <div>
                <table className="table table-hover text-center mt-3">
                    <thead className="sticky-header">
                        <tr>
                            <th>Id</th>
                            <th>Section Name</th>
                            <th>Creation Date</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(sections) && sections.map((section, key) => (
                            <React.Fragment key={key}>
                                <tr>
                                    <td>{section.section_id}</td>
                                    <td>{section.section_name}</td>
                                    <td>{new Date(section.creation_date).toLocaleDateString()}</td>
                                    <td>
                                        <button className='btn btn-secondary btn-sm' onClick={() => toggleSectionDevices(section.section_id)}>View</button>
                                    </td>
                                </tr>
                                {getSectionDeviceTable(section.section_id, expandedSectionDevices[section.section_id]?.section_devices_data)}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </Collapse>
    );

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
                                <hr className='mb-3 mt-2'></hr>
                                <img src={logo} width={100} height={'auto'} className='img-fluid rounded' style={{ background: 'grey', padding: '2px' }} />
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
                                <div className='farms-farmer mt-1' style={{ maxHeight: '40vh', overflow: 'auto' }}>
                                    <table className="table table-hover text-center">
                                        <thead className="sticky-header">
                                            <tr>
                                                <th>Id</th>
                                                <th>Farm Name</th>
                                                <th>Farm Size (acres)</th>
                                                <th>Creation Date</th>
                                                <th>Auto On, Off Threshold</th>
                                                <th>Location Coordinates</th>
                                                <th>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {farmDetails.map((farm, index) => (
                                                <React.Fragment key={index}>
                                                    <tr>
                                                        <td>{farm.farm_id}</td>
                                                        <td>{farm.farm_name}</td>
                                                        <td>{farm.farm_size}</td>
                                                        <td>{new Date(farm.creation_date).toLocaleDateString()}</td>
                                                        <td>{farm.auto_on_threshold}, {farm.auto_off_threshold}</td>
                                                        <td>
                                                            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '10rem' }}>
                                                                {farm.farm_location_cordinates.map((coord, idx) => (
                                                                    <span key={idx}>{coord} </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <button className='btn btn-secondary btn-sm' onClick={() => toggleSectionDetails(farm.farm_id)}>View</button>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='w-100 borderring mt-3'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <h5 className='text-secondary'>Farm Sections</h5>
                            <h6 className='text-secondary'>Total Sections: <strong className='text-dark'>{firstFarmDetails.section_data?.length || 0}</strong> </h6>
                            <div>
                                <button className='btn btn-sm btn-secondary me-2'>Add Section</button>
                                <button className='btn btn-sm btn-secondary'>Edit Section</button>
                            </div>
                        </div>
                        <hr className='mb-3 mt-2'></hr>
                        <div>
                            <table className="table table-hover text-center">
                                <thead className="sticky-header">
                                    <tr>
                                        <th>Id</th>
                                        <th>Section Name</th>
                                        <th>Creation Date</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {firstFarmDetails.section_data && firstFarmDetails.section_data.map((section, key) => (
                                        <React.Fragment key={key}>
                                            <tr>
                                                <td>{section.section_id}</td>
                                                <td>{section.section_name}</td>
                                                <td>{new Date(section.creation_date).toLocaleDateString()}</td>
                                                <td>
                                                    <button className='btn btn-secondary btn-sm' onClick={() => toggleSectionDevices(section.section_id)}>View</button>
                                                </td>
                                            </tr>
                                            {getSectionDeviceTable(section.section_id, expandedSectionDevices[section.section_id]?.section_devices_data)}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
    
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
                                value={formData[editField] || ''}
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
