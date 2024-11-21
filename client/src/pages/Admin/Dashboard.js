import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminlogo from './admin.png';

const Dashboard = () => {
    const adminID = 101;
    const [userData, setUserData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async (adminID) => {
            try {
                const response = await fetch('/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        admin_id: adminID
                    })
                });
                const data = await response.json();
                setUserData(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };
        fetchUser(adminID);
    }, [adminID]);

    const adminData = userData?.admin_data?.[0] || {};
    const farmerData = userData?.farmer_data || [];

    const { admin_fname: adminName = "No Admin Name", admin_id: adminId = 0, admin_location: adminLocation = "No location" } = adminData;

    const upperCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const filteredFarmers = farmerData.filter(f => 
        f.farmer_id.toString().includes(searchTerm) ||
        `${f.farmer_fname} ${f.farmer_lname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderAdminInfo = () => (
        <div className='d-flex adminwidth flex-wrap'>
            <img src={adminlogo} width={90} alt='admin logo' className='img-fluid' />
            <div className='ms-3 me-4'>
                <h5 className='fw-bold'>{upperCase(adminName)}</h5>
                <span className='text-second'>Id: <strong>A{adminId}</strong></span><br />
                <small className='text-second'>{adminLocation}</small>
            </div>
        </div>
    );

    const renderStats = () => (
        <ul className='d-flex list-unstyled flex-wrap'>
            {['Farmers', 'Farms', 'Sections', 'Devices'].map((stat, index) => (
                <li key={index} className='d-flex flex-column align-items-center m-2'>
                    <h5 className='m-0 text-secondary'>{stat}</h5>
                    <span className='spancolor'>{farmerData.length}</span>
                </li>
            ))}
        </ul>
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='container my-5'>
                <div className='borderring wh topfromparent'>
                    <aside className='d-flex py-1 flex-wrap justify-content-between align-items-center'>
                        {renderAdminInfo()}
                        {renderStats()}
                    </aside>
                    <div className='mt-3 ms-1'>
                        <div className='d-flex justify-content-between align-items-center p-2'>
                            <h5>Farmer Details</h5>
                            <div className='d-flex'>
                                <button className='btn btn-secondary btn-sm me-2'>Add Farmer</button>
                                <div className='ms-2'>
                                    <form className="d-flex">
                                        <input
                                            className="form-control me-2 h-100"
                                            type="search"
                                            placeholder="Search by ID or Name"
                                            aria-label="Search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive mt-3">
                            <table className="table table-hover overflow-auto">
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Phone</th>
                                        <th scope="col">E-mail</th>
                                        <th scope="col">Password</th>
                                        <th scope="col">Date of Joined</th>
                                        <th scope="col">Total Farms</th>
                                        <th scope="col">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFarmers.map((f, index) => (
                                        <tr key={index}>
                                            <td>{f.farmer_id}</td>
                                            <td>{upperCase(f.farmer_fname) + " " + upperCase(f.farmer_lname)}</td>
                                            <td>{f.farmer_phone}</td>
                                            <td>{f.farmer_email}</td>
                                            <td>{f.farmer_password}</td>
                                            <td>{new Date(f.join_date).toLocaleDateString()}</td>
                                            <td>0</td>
                                            <td><button className='btn btn-outline-secondary btn-sm' onClick={() => navigate('/admin/farmer', { state: { farmerId: f.farmer_id, admin_id: adminID } })}>View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
