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
    ufirstname: 'First Name',
    ulastname: 'Last Name',
    uemail: 'Email',
    uphoneno: 'Phone Number',
    ugender: 'Gender',
    ucountry: 'Country'
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
        ufirstname: owner.ufirstname || 'N/A',
        ulastname: owner.ulastname || 'N/A',
        uemail: owner.uemail || 'N/A',
        uphoneno: owner.uphoneno || 'N/A',
        ugender: owner.ugender || 'N/A',
        ucountry: owner.ucountry || 'N/A'
      };
      setSelectedOwner(essentialFields);
    }
    setOpenDropdown(null);
  };


  const ownerDropdownItems = [
    { label: 'View Owner', icon: <FaEye />, action: 'view' },

  ];

  const filteredOwners = owners.filter((owner) =>
    `${owner.ufirstname} ${owner.ulastname} ${owner.uemail} ${owner.uphoneno}`
      .toLowerCase()
      .includes(searchKey.toLowerCase())
  );

  const columns = [
    { header: 'First Name', accessor: 'ufirstname', type: 'text' },
    { header: 'Last Name', accessor: 'ulastname', type: 'text' },
    { header: 'Email', accessor: 'uemail', type: 'text' },
    { header: 'Phone', accessor: 'uphoneno', type: 'text' },
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
        title={`${selectedOwner?.ufirstname} ${selectedOwner?.ulastname}`}
        data={selectedOwner || {}}
        labels={displayLabels}
        onClose={() => setSelectedOwner(null)}
      />
    </div>
  );
};

export default Owners;
