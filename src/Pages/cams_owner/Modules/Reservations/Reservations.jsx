import React, { useState, useEffect } from 'react';
import { fetchReservation } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import { FaEye } from 'react-icons/fa';
import Toast from '../../../../Component/Toast/Toast';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchReservationsData = async () => {
            try {
                const reservationData = await fetchReservation();
                if (Array.isArray(reservationData)) {
                    const updatedReservations = reservationData.map(reservation => {
                        const reservationblocktime = new Date(reservation.reservationblocktime).getTime();
                        const currentDateTime = Date.now() + 8 * 60 * 60 * 1000;

                        if (reservation.reservationstatus === 'Pending' && currentDateTime > reservationblocktime) {
                            return { ...reservation, reservationstatus: 'expired' };
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

    const handleApplyFilters = () => {
        setAppliedFilters({ status: selectedStatus });
    };

    // Filter options
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
        rateamount: "Total Price",
        reservationpaxno: "Reservation Pax No",
        reservationstatus: "Reservation Status",
        checkindatetime: "Check-In Date Time",
        checkoutdatetime: "Check-Out Date Time",
        request: "Request",
        images: "Images"
    };

    const filteredReservations = reservations.filter(
        (reservation) =>
            (appliedFilters.status === 'All' || (reservation.reservationstatus ?? 'Pending').toLowerCase() === appliedFilters.status.toLowerCase()) &&
            (
                (reservation.reservationid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (reservation.propertyaddress?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (reservation.rateamount?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (reservation.reservationpaxno?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (reservation.reservationstatus?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (reservation.request?.toLowerCase().includes(searchKey.toLowerCase()) || '')
            )
    );

    const handleAction = (action, reservation) => {

        if (reservation.reservationstatus === 'expired') {
            displayToast('error', 'Action cannot be performed. This reservation has expired.');
            return;
        }

        if (action === 'view') {
            setSelectedReservation({
                reservationid: reservation.reservationid || 'N/A',
                propertyaddress: reservation.propertyaddress || 'N/A',
                rateamount: reservation.rateamount || 'N/A',
                reservationpaxno: reservation.reservationpaxno || 'N/A',
                reservationstatus: reservation.reservationstatus || 'N/A',
                checkindatetime: reservation.checkindatetime || 'N/A',
                checkoutdatetime: reservation.checkoutdatetime || 'N/A',
                request: reservation.request || 'N/A',
                images: reservation.propertyimage || [],
            });
        }
    };

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const reservationDropdownItems = [
        { label: 'View Details', icon: <FaEye />, action: 'view' }
    ];

    const columns = [
        { header: 'ID', accessor: 'reservationid' },
        {
            header: 'Image',
            accessor: 'propertyimage',
            render: (reservation) => (
                Array.isArray(reservation.propertyimage) && reservation.propertyimage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${reservation.propertyimage[0]}`}
                        alt={reservation.propertyaddress}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                )
            ),
        },
        { header: 'Property Name', accessor: 'propertyaddress' },
        { header: 'Total Price', accessor: 'rateamount' },
        { header: 'Pax', accessor: 'reservationpaxno' },
        {
            header: 'Status',
            accessor: 'reservationstatus',
            render: (reservation) => (
                <span className={`status-badge ${(reservation.reservationstatus ?? 'Pending').toLowerCase()}`}>
                    {reservation.reservationstatus}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (reservation) => (
                <ActionDropdown
                    items={reservationDropdownItems}
                    onAction={(action) => handleAction(action, reservation)}
                    onClose={() => {}}
                />
            ),
        },
    ];

    return (
        <div>
            {showToast && <Toast type={toastType} message={toastMessage} />}
            <div className="header-container">
                <h1 className="dashboard-page-title">Reservations</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search reservation..." />

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
        </div>
    );
};

export default Reservations;
