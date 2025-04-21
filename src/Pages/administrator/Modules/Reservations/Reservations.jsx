import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReservation, updateReservationStatus, acceptBooking, getOperatorProperties, fetchOperators, suggestNewRoom, sendSuggestNotification } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Loader from '../../../../Component/Loader/Loader';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import './Reservations.css';

const Reservations = () => {
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxMode, setMessageBoxMode] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedOperators, setSelectedOperators] = useState([]);
    const [rejectedReservationID, setRejectedReservationID] = useState(null);
    const [suggestSearchKey, setSuggestSearchKey] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [currentUser, setCurrentUser] = useState({
        username: '',
        userid: '',
        userGroup: ''
    });
    
    const queryClient = useQueryClient();


    useEffect(() => {
        const username = localStorage.getItem('username');
        const userid = localStorage.getItem('userid');
        const userGroup = localStorage.getItem('userGroup');
        
        setCurrentUser({
            username,
            userid,
            userGroup
        });
        
        console.log('Current user loaded:', { username, userid, userGroup });
    }, []);

    // Fetch reservations with React Query
    const { data: reservationsData = [], isLoading: reservationsLoading } = useQuery({
        queryKey: ['reservations'],
        queryFn: async () => {
            try {
                const reservationData = await fetchReservation();
                if (Array.isArray(reservationData)) {
                    console.log('Reservations Data:', reservationData);
                    return reservationData.map(reservation => {
                        const reservationblocktime = new Date(reservation.reservationblocktime).getTime();
                        const currentDateTime = Date.now() + 8 * 60 * 60 * 1000;
    
                        if (reservation.reservationstatus === 'Pending' && currentDateTime > reservationblocktime) {
                            return { ...reservation, reservationstatus: 'expired' };
                        }
                        return reservation;
                    });
                } else {
                    console.error("Invalid data format received:", reservationData);
                    return [];
                }
            } catch (error) {
                console.error('Failed to fetch reservation details:', error);
                throw error;
            }
        },
        staleTime: 30 * 60 * 1000,
        refetchInterval: 1000,
    });
 // Fetch operators with React Query
   
    const { data: operators = [] } = useQuery({
        queryKey: ['operators'],
        queryFn: fetchOperators,
    });

    // Fetch administrator properties when needed
    const { data: administratorProperties = [], refetch: refetchProperties } = useQuery({
        queryKey: ['administratorProperties'],
        queryFn: async () => {
            const userid = localStorage.getItem('userid');
            const response = await getOperatorProperties(userid);
            return response.data;
        },
        enabled: false, // Don't run this query automatically
    });

    // Update reservation status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ reservationId, newStatus, userid }) => 
            updateReservationStatus(reservationId, newStatus, userid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });

    // Accept booking mutation
    const acceptBookingMutation = useMutation({
        mutationFn: (reservationId) => acceptBooking(reservationId),
    });

    // Suggest new room mutation
    const suggestRoomMutation = useMutation({
        mutationFn: ({ propertyAddress, reservationId }) => 
            suggestNewRoom(propertyAddress, reservationId),
    });

    // Send notification mutation
    const sendNotificationMutation = useMutation({
        mutationFn: ({ reservationId, operators }) => 
            sendSuggestNotification(reservationId, operators),
    });

    const handleApplyFilters = () => {
        setAppliedFilters({ status: selectedStatus });
    };

    const isPropertyOwner = (reservation) => {
        if (!currentUser.username || !reservation) {
            console.log('Missing data:', { currentUser, reservation });
            return false;
        }
    
        const propertyOwnerUsername = reservation.property_owner_username;
        if (!propertyOwnerUsername) {
            console.log('Property owner username missing in reservation:', reservation);
            return false;
        }
    
        const isOwner = propertyOwnerUsername.toLowerCase() === currentUser.username.toLowerCase();
        console.log('Ownership Check:', { 
            currentUsername: currentUser.username, 
            propertyOwnerUsername, 
            userGroup: currentUser.userGroup, 
            isOwner 
        });
        return isOwner;
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
        propertyaddress: "Property Name",
        checkindatetime: "Check-In Date Time",
        checkoutdatetime: "Check-Out Date Time",
        reservationblocktime: "Block Time",
        request: "Request",
        totalprice: "Total Price",
        reservationstatus: "Status",
        userid: "User ID",
        images: "Images",
    };

    const filteredReservations = Array.isArray(reservationsData)
        ? reservationsData.filter(
            (reservation) =>
                (appliedFilters.status === 'All' || (reservation.reservationstatus ?? 'Pending').toLowerCase() === appliedFilters.status.toLowerCase()) &&
                (
                    (reservation.reservationid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                    (reservation.propertyaddress?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
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
                propertyaddress: reservation.propertyaddress || 'N/A',
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
            try {

                const newStatus = 'Accepted';
                

                await updateStatusMutation.mutateAsync({ 
                    reservationId: reservation.reservationid, 
                    newStatus,
                    userid: currentUser.userid
                });
                
   
                await acceptBookingMutation.mutateAsync(reservation.reservationid);
        
                displayToast('success', 'Reservation Accepted Successfully');
            } catch (error) {
                console.error('Failed to accept reservation or send email', error);
                displayToast('error', 'Failed to accept reservation');
            }
        } else if (action === 'reject') {
            const rejectedID = {
                reservationid: reservation.reservationid || 'N/A',
            };
    
            setRejectedReservationID(rejectedID);
    
            try {
                const newStatus = 'Rejected';
                
                await updateStatusMutation.mutateAsync({ 
                    reservationId: reservation.reservationid, 
                    newStatus,
                    userid: currentUser.userid
                });
    
                setShowMessageBox(true);
                displayToast('success', 'Reservation Rejected Successfully');
            } catch (error) {
                console.error('Failed to update reservation status', error);
                displayToast('error', 'Failed to reject reservation');
            }
        }
    };

    const handleMessageBoxSelect = async (mode) => {
        if (mode === 'suggest') {
            // Trigger the properties query
            refetchProperties();
        }

        setMessageBoxMode(mode);
        setShowMessageBox(false);
    };

    const handlePropertySelect = (propertyaddress) => {
        setSelectedProperty(propertyaddress);
    };

    const handleConfirmSuggestion = async () => {
        if (selectedProperty && rejectedReservationID.reservationid) {
            try {
                await suggestRoomMutation.mutateAsync({
                    propertyAddress: selectedProperty,
                    reservationId: rejectedReservationID.reservationid
                });

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
                await sendNotificationMutation.mutateAsync({
                    reservationId: rejectedReservationID.reservationid,
                    operators: selectedOperators
                });

                displayToast('success', 'Suggest Notification Sent Successfully');
                setMessageBoxMode(null);
            } catch (error) {
                displayToast('error', 'Error Sending Suggest Notification');
            }
        } else {
            displayToast('error', 'Please select at least one operator to notify');
        }
    };

    const reservationDropdownItems = (reservation) => {
        if (reservation.reservationstatus === 'Pending' && isPropertyOwner(reservation)) {
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
        if (!Array.isArray(administratorProperties)) return []; // Ensure an array
        return administratorProperties.filter(property => {
            const matchesSearch = property.propertyaddress.toString().toLowerCase().includes(suggestSearchKey.toLowerCase());
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
                        alt={`Property ${reservation.propertyaddress}`}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                ),
        },
        { header: 'Property Name', accessor: 'propertyaddress' },
        { header: 'Total Price(RM)', accessor: 'totalprice' },
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
                    items={reservationDropdownItems(reservation)}
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

            {reservationsLoading ? (
                <div className="loader-box">
                    <Loader />
                </div>
            ) : (
                <PaginatedTable
                    data={filteredReservations}
                    columns={columns}
                    rowKey="reservationid"
                    enableCheckbox={false}
                />
            )}

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
                                    <div key={property.propertyaddress} className="property-card">
                                        <input
                                            type="radio"
                                            id={`property-${property.propertyaddress}`}
                                            name="property"
                                            value={property.propertyaddress}
                                            onChange={() => handlePropertySelect(property.propertyaddress)}
                                            className="property-radio"
                                        />
                                        <label htmlFor={`property-${property.propertyaddress}`} className="property-label">
                                            <div className="property-image-container">
                                                <img
                                                    src={`data:image/jpeg;base64,${property.images[0]}`}
                                                    alt={property.propertyaddress}
                                                    className="property-image"
                                                />
                                            </div>
                                            <div className="property-details">
                                                <h3 className="property-title">{property.propertyaddress}</h3>
                                                <p className="property-info-text">{property.propertyguestpaxno} Pax</p>
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
                                    checked={selectedOperators.length === operators.length && operators.length > 0}
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
                                            {operator.ufirstname} {operator.ulastname} ({operator.username}) - {operator.usergroup}
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
