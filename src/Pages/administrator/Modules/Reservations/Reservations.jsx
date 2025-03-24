import React, { useState, useEffect } from 'react';
import { fetchReservation, updateReservationStatus, acceptBooking, getOperatorProperties, fetchOperators, suggestNewRoom, sendSuggestNotification } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import './Reservations.css';

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxMode, setMessageBoxMode] = useState(null);
    const [administratorProperties, setAdministratorProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [operators, setOperators] = useState([]);
    const [selectedOperators, setSelectedOperators] = useState([]);
    const [rejectedReservationID, setRejectedReservationID] = useState(null);
    const [suggestSearchKey, setSuggestSearchKey] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    useEffect(() => {
        const fetchReservationsData = async () => {
            try {
                const reservationData = await fetchReservation();
                if (Array.isArray(reservationData)) {
                    const updatedReservations = reservationData.map(reservation => {
                        const expiryDateTime = new Date(reservation.expiryDateTime).getTime();
                        const currentDateTime = Date.now() + 8 * 60 * 60 * 1000;

                        if (reservation.reservationStatus === 'Pending' && currentDateTime > expiryDateTime) {
                            return { ...reservation, reservationStatus: 'expired' };
                        }
                        return reservation;
                    });
                    setReservations(updatedReservations);
                } else {
                    console.error("Invalid data format received:", reservationData);
                    setReservations([]);
                }
            } catch (error) {
                console.error('Failed to fetch reservation details:', error);
                setReservations([]);
            }
        };
        fetchReservationsData();
    }, []);


    useEffect(() => {
        const fetchOperatorsData = async () => {
            try {
                const operatorsData = await fetchOperators();
                setOperators(operatorsData);
            } catch (error) {
                console.error('Failed to fetch operators', error);
            }
        };
        fetchOperatorsData();
    }, []);

    const handleApplyFilters = () => {
        setAppliedFilters({ status: selectedStatus });
    };

    const filters = [
        {
            name: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
                { value: 'All', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Accepted', label: 'Accepted' },
                { value: 'Rejected', label: 'Rejected' },
                { value: 'Canceled', label: 'Canceled' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Expired', label: 'Expired' },
            ],
        },
    ];

    const displayLabels = {
        reservationid: "Reservation ID",
        propertyid: "Property ID",
        checkindatetime: "Check-In Date Time",
        checkoutdatetime: "Check-Out Date Time",
        reservationblocktime: "Block Time",
        request: "Request",
        totalprice: "Total Price",
        rcid: "RC ID",
        reservationstatus: "Status",
        userid: "User ID",
        images: "Images",
    };

    const filteredReservations = Array.isArray(reservations)
        ? reservations.filter(
            (reservation) =>
                (appliedFilters.status === 'All' || (reservation.reservationstatus ?? 'Pending').toLowerCase() === appliedFilters.status.toLowerCase()) &&
                (
                    (reservation.reservationid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.propertyid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.totalprice?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.request?.toLowerCase().includes(searchKey.toLowerCase()) || '')
                )
        )
        : [];

        const handleAction = async (action, reservation) => {
            if (reservation.reservationstatus === 'expired') {
                displayToast('error', 'Action cannot be performed. This reservation has expired.');
                return;
            }
        
            if (action === 'view') {
                const essentialFields = {
                    reservationid: reservation.reservationid || 'N/A',
                    propertyid: reservation.propertyid || 'N/A',
                    checkindatetime: reservation.checkindatetime || 'N/A',
                    checkoutdatetime: reservation.checkoutdatetime || 'N/A',
                    reservationblocktime: reservation.reservationblocktime || 'N/A',
                    request: reservation.request || 'N/A',
                    totalprice: reservation.totalprice || 'N/A',
                    rcid: reservation.rcid || 'N/A',
                    reservationstatus: reservation.reservationstatus || 'N/A',
                    userid: reservation.userid || 'N/A',
                    images: reservation.propertyimage || [],
                };
                setSelectedReservation(essentialFields);
            } else if (action === 'accept') {
                const newStatus = 'Accepted';
        
                try {
                    await updateReservationStatus(reservation.reservationid, newStatus);
                    await acceptBooking(reservation.reservationid);
        
                    setReservations((prevReservations) =>
                        prevReservations.map((res) =>
                            res.reservationid === reservation.reservationid
                               ? { ...res, reservationstatus: newStatus }
                                : res
                        )
                    );
        
                    displayToast('success', 'Reservation Accepted Successfully');
                } catch (error) {
                    console.error('Failed to accept reservation or send email', error);
                }
            } else if (action ==='reject') {
                const rejectedID = {
                    reservationid: reservation.reservationid || 'N/A',
                };
        
                setRejectedReservationID(rejectedID);
        
                const newStatus = 'Rejected';
        
                try {
                    await updateReservationStatus(reservation.reservationid, newStatus);
        
                    setReservations((prevReservations) =>
                        prevReservations.map((res) =>
                            res.reservationid === reservation.reservationid
                               ? { ...res, reservationstatus: newStatus }
                                : res
                        )
                    );
        
                    setShowMessageBox(true);
        
                    displayToast('success', 'Reservation Rejected Successfully');
                } catch (error) {
                    console.error('Failed to update reservation status', error);
                }
            }
        };


    const handleMessageBoxSelect = async (mode) => {
        if (mode === 'suggest') {
            try {
                const userid = localStorage.getItem('userid');
                const response = await getOperatorProperties(userid);

                setAdministratorProperties(response.data);
            } catch (error) {
                console.error('Error fetching properties: ', error);
            }
        }

        setMessageBoxMode(mode);
        setShowMessageBox(false);
    };

    const handlePropertySelect = (propertyid) => {
        setSelectedProperty(propertyid);
    };

    const handleConfirmSuggestion = async () => {
        if (selectedProperty && rejectedReservationID.reservationid) {
            try {
                await suggestNewRoom(selectedProperty, rejectedReservationID.reservationid);

                displayToast('success', 'New Room Suggestion Email Sent Successfully');

                setMessageBoxMode(null);
            } catch (error) {
                displayToast('error', 'Error Sending New Room Suggestion Email');
            }
        } else {
            displayToast('error', 'Please select a property to suggest');
        }
    };

    const handleOperatorSelect = (userid) => {
        setSelectedOperators((prevSelectedOperators) =>
            prevSelectedOperators.includes(userid)
                ? prevSelectedOperators.filter((id) => id !== userid)
                : [...prevSelectedOperators, userid]
        );
    };

    const handleConfirmNotification = async () => {
        if (selectedOperators.length > 0 && rejectedReservationID.reservationid) {
            try {
                await sendSuggestNotification(rejectedReservationID.reservationid, selectedOperators);

                displayToast('success', 'Suggest Notification Sent Successfully');

                setMessageBoxMode(null);
            } catch (error) {
                displayToast('error', 'Error Sending Suggest Notification');
            }
        } else {
            displayToast('error', 'Please select at least one operator to notify');
        }
    };

    const reservationDropdownItems = (reservationStatus) => {
        if (reservationStatus === 'Pending') {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
                { label: 'Accept', icon: <FaCheck />, action: 'accept' },
                { label: 'Reject', icon: <FaTimes />, action: 'reject' },
            ];
        }
        return [{ label: 'View Details', icon: <FaEye />, action: 'view' }];
    };

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const getFilteredProperties = () => {
        return administratorProperties.filter(property => {
            const matchesSearch = property.propertyid.toLowerCase().includes(suggestSearchKey.toLowerCase());
            const matchesPrice = (!priceRange.min || property.rateamount >= Number(priceRange.min)) &&
                (!priceRange.max || property.rateamount <= Number(priceRange.max));
            return matchesSearch && matchesPrice;
        });
    };

    const columns = [
        { header: 'ID', accessor: 'reservationid' },
        {
            header: 'Image',
            accessor: 'propertyimage',
            render: (reservation) =>
                reservation.propertyimage && reservation.propertyimage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${reservation.propertyimage[0]}`}
                        alt={`Property ${reservation.propertyid}`}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                ),
        },
        { header: 'Property ID', accessor: 'propertyid' },
        { header: 'Total Price', accessor: 'totalprice' },
        { header: 'RC ID', accessor: 'rcid' },
        {
            header: 'Status',
            accessor: 'reservationstatus',
            render: (reservation) => (
                <span className={`reservation-status ${reservation.reservationstatus?.toLowerCase()}`}>
                    {reservation.reservationstatus}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (reservation) => (
                <ActionDropdown
                    items={reservationDropdownItems(reservation.reservationstatus)}
                    onAction={(action) => handleAction(action, reservation)}
                />
            ),
        },
    ];

    return (
        <div>
            {showToast && <Toast type={toastType} message={toastMessage} />}
            <div className="header-container">
                <h1 className="dashboard-page-title">Reservations</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search reservations..." />
            </div>

            <Filter filters={filters} onApplyFilters={handleApplyFilters} />

            <PaginatedTable
                data={filteredReservations}
                columns={columns}
                rowKey="reservationid"
                enableCheckbox={false}
            />

            <Modal
                isOpen={!!selectedReservation}
                title={`Reservation ID: ${selectedReservation?.reservationid}`}
                data={selectedReservation || {}}
                labels={displayLabels}
                onClose={() => setSelectedReservation(null)}
            />

            {showMessageBox && (
                <div className="custom-message-box-overlay">
                    <div className="custom-message-box">
                        <h2>Choose An Action</h2>
                        <p>Please Select An Action For The Rejection:</p>
                        <div className="message-box-buttons">
                            <button onClick={() => handleMessageBoxSelect('suggest')}>Suggest</button>
                            <button onClick={() => handleMessageBoxSelect('notify')}>Notify Suggest</button>
                            <button onClick={() => setShowMessageBox(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {messageBoxMode === 'suggest' && (
                <div className="custom-message-box-overlay">
                    <div className="suggest-properties custom-message-box">
                        <div className="suggest-header">
                            <h2>Select A Property To Suggest</h2>
                            <div className="close-button" onClick={() => setMessageBoxMode('')}>X</div>
                        </div>

                        <div className="suggest-filters">
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search property name..."
                                    value={suggestSearchKey}
                                    onChange={(e) => setSuggestSearchKey(e.target.value)}
                                    className="suggest-search-input"
                                />
                            </div>
                            <div className="price-filter">
                                <div className="price-input-group">
                                    <input
                                        type="number"
                                        placeholder="Min price"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="price-input"
                                    />
                                    <span className="price-separator">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max price"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="price-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="property-list">
                            {getFilteredProperties().length > 0 ? (
                                getFilteredProperties().map((property) => (
                                    <div key={property.propertyid} className="property-card">
                                        <input
                                            type="radio"
                                            id={`property-${property.propertyid}`}
                                            name="property"
                                            value={property.propertyid}
                                            onChange={() => handlePropertySelect(property.propertyid)}
                                            className="property-radio"
                                        />
                                        <label htmlFor={`property-${property.propertyid}`} className="property-label">
                                            <div className="property-image-container">
                                                <img
                                                    src={`data:image/jpeg;base64,${property.images[0]}`}
                                                    alt={property.propertyid}
                                                    className="property-image"
                                                />
                                            </div>
                                            <div className="property-details">
                                                <h3 className="property-title">{property.propertyid}</h3>
                                                <p className="property-info-text">{property.propertyGuestPaxNo} Pax</p>
                                                <p className="property-price">RM {property.rateamount}</p>
                                            </div>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="no-property-message">No properties match your search criteria</p>
                            )}
                        </div>
                        <button className="confirm-button" onClick={handleConfirmSuggestion}>
                            Confirm Suggestion
                        </button>
                    </div>
                </div>
            )}

            {messageBoxMode === 'notify' && (
                <div className="custom-message-box-overlay">
                    <div className="suggest-properties custom-message-box">
                        <div className="close-button" onClick={() => setMessageBoxMode('')}>X</div>
                        <h2>Select Operators To Notify</h2>
                        <div className="operator-list">
                            <div className="select-all-checkbox">
                                <input
                                    type="checkbox"
                                    id="select-all-operators"
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSelectedOperators(checked ? operators.map(operator => operator.userid) : []);
                                    }}
                                />
                                <label htmlFor="select-all-operators">Select All</label>
                            </div>

                            {operators.length > 0 ? (
                                operators.map((operator) => (
                                    <div key={operator.userid} className="operator-option">
                                        <input
                                            type="checkbox"
                                            id={`operator-${operator.userid}`}
                                            value={operator.userid}
                                            checked={selectedOperators.includes(operator.userid)}
                                            onChange={() => handleOperatorSelect(operator.userid)}
                                        />
                                        <label htmlFor={`operator-${operator.userid}`}>
                                            {operator.uFirstName} {operator.uLastName} ({operator.username}) - {operator.userGroup}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p>No operator available to notify</p>
                            )}
                        </div>
                        <button onClick={handleConfirmNotification}>Confirm Selection</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reservations;
