import React, { useState, useEffect } from 'react';
import { fetchOwners } from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import {FaEye, FaBan } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const displayLabels = {
    uFirstName: 'First Name',
    uLastName: 'Last Name',
    uEmail: 'Email',
    uPhoneNo: 'Phone Number',
    uGender: 'Gender',
    uCountry: 'Country'
  };

  useEffect(() => {
    const fetchOwnersData = async () => {
      try {
        const ownerData = await fetchOwners();
        setOwners(ownerData);
      } catch (error) {
        console.error('Failed to fetch owner details', error);
      }
    };
    fetchOwnersData();
  }, []);

  const handleAction = (action, owner) => {
    if (action === 'view') {
      const essentialFields = {
        uFirstName: owner.uFirstName || 'N/A',
        uLastName: owner.uLastName || 'N/A',
        uEmail: owner.uEmail || 'N/A',
        uPhoneNo: owner.uPhoneNo || 'N/A',
        uGender: owner.uGender || 'N/A',
        uCountry: owner.uCountry || 'N/A'
      };
      setSelectedOwner(essentialFields);
    }
    setOpenDropdown(null);
  };


  const ownerDropdownItems = [
    { label: 'View Owner', icon: <FaEye />, action: 'view' },

  ];

  const filteredOwners = owners.filter((owner) =>
    `${owner.uFirstName} ${owner.uLastName} ${owner.uEmail} ${owner.uPhoneNo}`
      .toLowerCase()
      .includes(searchKey.toLowerCase())
  );

  const columns = [
    { header: 'First Name', accessor: 'uFirstName', type: 'text' },
    { header: 'Last Name', accessor: 'uLastName', type: 'text' },
    { header: 'Email', accessor: 'uEmail', type: 'text' },
    { header: 'Phone', accessor: 'uPhoneNo', type: 'text' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (owner) => (
        <ActionDropdown
          items={ownerDropdownItems}
          onAction={(action) => handleAction(action, owner)}
          onClose={() => { }}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Owner Details</h1>
        <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search owners..." />

      </div>

      <PaginatedTable
        data={filteredOwners}
        columns={columns}
        rowKey="userID"
        enableCheckbox={false}
      />

      <Modal
        isOpen={!!selectedOwner}
        title={`${selectedOwner?.uFirstName} ${selectedOwner?.uLastName}`}
        data={selectedOwner || {}}
        labels={displayLabels}
        onClose={() => setSelectedOwner(null)}
      />
    </div>
  );
};

export default Owners;