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
import Status from '../../../../Component/Status/Status';
import RoomPlannerCalendar from '../../../../Component/Room_Planner_Calender/Room_Planner_Calender';
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
    const [showTable, setShowTable] = useState(true);
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
        queryKey: [
            'administratorProperties',
            localStorage.getItem('userid'),
            rejectedReservationID?.reservationid
        ],
        queryFn: async () => {
            const userid = localStorage.getItem('userid');
            const reservationid = rejectedReservationID?.reservationid;
        
            if (!userid || !reservationid) {
                console.error('Missing userid or reservationid');
                return [];
            }
        
            try {
                const response = await getOperatorProperties(userid, reservationid);
                return response.data;
            } catch (error) {
                console.error('Failed to fetch administrator properties:', error);
                return [];
            }
        },
        enabled: false, // Prevent automatic fetch
    });
    
    useEffect(() => {
        if (rejectedReservationID?.reservationid) {
            refetchProperties();
        }
    }, [rejectedReservationID, refetchProperties]);

    // Update reservation status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ reservationId, newStatus }) =>
            updateReservationStatus(reservationId, newStatus),
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
        mutationFn: ({ propertyId, reservationId }) =>
            suggestNewRoom(propertyId, reservationId),
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
        if (!currentUser.userid || !reservation) {
            console.log('Missing data:', { currentUser, reservation });
            return false;
        }

        const propertyOwnerID = reservation.userid;
        
        if (!propertyOwnerID) {
            console.log('Property owner userid missing in reservation:', reservation);
            return false;
        }

        const isOwner = Number(propertyOwnerID) === Number(currentUser.userid);
        
        console.log('Ownership Check:', {
            currentUserID: currentUser.userid,
            propertyOwnerID,
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
        reservationid: "RID",
        propertyaddress: "Property Name",
        checkindatetime: "Check-In Date Time",
        checkoutdatetime: "Check-Out Date Time",
        reservationblocktime: "Block Time",
        request: "Request",
        totalprice: "Total Price",
        rcid: "RCID",
        reservationstatus: "Status",
        userid: "UID",
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

    const hasOverlappingReservation = (reservation) => {
        if (!Array.isArray(reservationsData)) return false;

        const newCheckIn = new Date(reservation.checkindatetime);
        const newCheckOut = new Date(reservation.checkoutdatetime);

        return reservationsData.some(existingReservation => {
            // Skip the current reservation
            if (existingReservation.reservationid === reservation.reservationid) {
                return false;
            }

            // Only check for overlaps with Accepted reservations
            if (existingReservation.reservationstatus !== 'Accepted') {
                return false;
            }

            const existingCheckIn = new Date(existingReservation.checkindatetime);
            const existingCheckOut = new Date(existingReservation.checkoutdatetime);

            // Check for overlap
            return (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn);
        });
    };

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
            // Check for overlapping reservations before accepting
            if (hasOverlappingReservation(reservation)) {
                displayToast('error', 'Cannot accept reservation: There is an overlapping accepted reservation for these dates.');
                return;
            }

            try {
                const newStatus = 'Accepted';

                // First update the status
                await updateStatusMutation.mutateAsync({
                    reservationId: reservation.reservationid,
                    newStatus,
                    userid: currentUser.userid
                });

                try {
                    // Then try to accept the booking
                    await acceptBookingMutation.mutateAsync(reservation.reservationid);
                    displayToast('success', 'Reservation Accepted Successfully');
                } catch (bookingError) {
                    console.error('Failed to complete booking acceptance:', bookingError);
                    displayToast('warning', 'Reservation status updated but booking acceptance failed. Please try again.');
                }
            } catch (statusError) {
                console.error('Failed to update reservation status:', statusError);
                displayToast('error', 'Failed to update reservation status');
            }
        } else if (action === 'reject') {
            const rejectedID = {
                reservationid: reservation.reservationid || 'N/A',
            };

            setRejectedReservationID(rejectedID);
            
            setShowMessageBox(true);
        }
    };

    const handleMessageBoxSelect = async (mode) => {
        if (mode === 'suggest') {
            refetchProperties();
        }

        setMessageBoxMode(mode);
        setShowMessageBox(false);
    };

    const handlePropertySelect = (propertyid) => {
        setSelectedProperty(propertyid);
    };

    const handleConfirmSuggestion = async () => {
        console.log("Selected Property:", selectedProperty);
        console.log("Rejected Reservation ID:", rejectedReservationID?.reservationid);
        if (selectedProperty && rejectedReservationID.reservationid) {
            try {
                const newStatus = 'Suggested';

                await updateStatusMutation.mutateAsync({
                    reservationId: reservation.reservationid,
                    newStatus
                });

                await suggestRoomMutation.mutateAsync({
                    propertyId: selectedProperty,
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
                const newStatus = 'Published';

                await updateStatusMutation.mutateAsync({
                    reservationId: reservation.reservationid,
                    newStatus
                });

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

    const columns = [
        { header: 'RID', accessor: 'reservationid' },
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
        { header: 'Total Price', accessor: 'totalprice' },
        {
            header: 'Status',
            accessor: 'reservationstatus',
            render: (reservation) => (
                <Status value={reservation.reservationstatus} />
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

            <div className="room-planner-container">
                <RoomPlannerCalendar />
            </div>

            <div className="table-controls">
                <button
                    className="toggle-table-btn"
                    onClick={() => setShowTable(!showTable)}
                >
                    {showTable ? 'Hide Reservations Table' : 'Show Reservations Table'}
                </button>
            </div>

            {showTable && (
                reservationsLoading ? (
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
                )
            )}

            <Modal
                isOpen={!!selectedReservation}
                title={'Reservation Details'}
                data={selectedReservation || {}}
                labels={displayLabels}
                onClose={() => setSelectedReservation(null)}
            />

            {showMessageBox && (
                <div className="custom-message-box-overlay">
                    <div className="custom-message-box">
                        <h2>Choose An Action</h2>
                        <p>Please Select An Action For The Rejection:</p>
                        <button onClick={() => setShowMessageBox(false)} className="form-close-button">×</button>

                        <div class="message-box-buttons">
                            <button onClick={() => handleMessageBoxSelect('suggest')}>Suggest</button>
                            <button onClick={() => handleMessageBoxSelect('notify')}>Notify Suggest</button>
                        </div>
                    </div>
                </div>
            )}

            {messageBoxMode === 'suggest' && (
                <div className="custom-message-box-overlay">
                    <div className="suggest-properties custom-message-box">
                        <div className="suggest-header">
                            <h2>Select A Property To Suggest</h2>
                            <div className="form-close-button" onClick={() => setMessageBoxMode('')}>×</div>
                        </div>

                        <div className="property-list">
                            {administratorProperties.length > 0 ? (
                                administratorProperties.map((property) => (
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
                                                    alt={property.propertyaddress}
                                                    className="property-image"
                                                />
                                            </div>
                                            <div className="property-details">
                                                <h3 className="property-title">{property.propertyaddress}</h3>
                                                <p className="property-info-text">{property.propertyguestpaxno} Pax</p>
                                                <p className="property-price">RM {property.normalrate}</p>
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
                        <div className="form-close-button" onClick={() => setMessageBoxMode('')}>×</div>
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
