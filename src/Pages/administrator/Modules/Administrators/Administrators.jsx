import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdministrators } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Loader from '../../../../Component/Loader/Loader';
import { FaEye } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Administrator.css';

const Administrators = () => {
  const [searchKey, setSearchKey] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
  const [selectedOperator, setSelectedOperator] = useState(null);

  // Fetch administrators using React Query
  const { data: administrators = [], isLoading, error } = useQuery({
    queryKey: ['administrators'],
    queryFn: fetchAdministrators,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 1000,
  });

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
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
  ];

  const displayLabels = {
    administratorsid: 'administrators ID',
    ufirstname: 'First Name',
    ulastname: 'Last Name',
    uemail: 'Email',
    uphoneno: 'Phone Number',
    uactivation: 'Status',
    ugender: 'Gender',
    ucountry: 'Country',
  };

  // Filtering administrators based on search key and status
  const filteredadministratorss = administrators.filter((administrators) => {
    const searchInFields =
      `${administrators.administratorsid} ${administrators.ufirstname} ${administrators.ulastname} ${administrators.uemail} ${administrators.uphoneno} ${administrators.uactivation}`
        .toLowerCase()
        .includes(searchKey.toLowerCase());

    const statusFilter =
      appliedFilters.status === 'All' || administrators.uactivation === appliedFilters.status;

    return searchInFields && statusFilter;
  });

  const handleAction = (action, administrators) => {
    if (action === 'view') {
      const essentialFields = {
        administratorsid: administrators.administratorsid || 'N/A',
        ufirstname: administrators.ufirstname || 'N/A',
        ulastname: administrators.ulastname || 'N/A',
        uemail: administrators.uemail || 'N/A',
        uphoneno: administrators.uphoneno || 'N/A',
        uactivation: administrators.uactivation || 'N/A',
        ugender: administrators.ugender || 'N/A',
        ucountry: administrators.ucountry || 'N/A',
      };
      setSelectedOperator(essentialFields);
    }
  };

  const operatorDropdownItems = [{ label: 'View Details', icon: <FaEye />, action: 'view' }];

  const columns = [
    { header: 'ID', accessor: 'administratorsid' },
    {
      header: 'Administrator',
      accessor: 'administrator',
      render: (administrators) => (
        <div className="administrator-container">
          <div className="avatar-container">
            {administrators.uimage && administrators.uimage.length > 0 ? (
              <img
                src={`data:image/jpeg;base64,${administrators.uimage}`}
                alt={`${administrators.ufirstname} ${administrators.ulastname}`}
                className="administrator-avatar"
                onError={(e) => {
                  console.error(`Failed to load avatar for admin ${administrators.administratorsid}:`, administrators.uimage);
                  e.target.src = '/public/avatar.png';
                }}
              />
            ) : (
              <img
                src="/public/avatar.png"
                alt="Default Avatar"
                className="administrator-avatar"
              />
            )}
            <span
              className={`status-dot ${
                administrators.ustatus === 'login' ? 'status-login' :
                administrators.ustatus === 'registered' ? 'status-registered' :
                'status-logout'
              }`}
            />
          </div>
          <span className="administrator-administratorsname">{`${administrators.ufirstname} ${administrators.ulastname}` || 'N/A'}</span>
        </div>
      ),
    },
    { header: 'Email', accessor: 'uemail' },
    { header: 'Phone', accessor: 'uphoneno' },
    {
      header: 'Status',
      accessor: 'uactivation',
      render: (administrators) => (
        <span className={`status-badge ${administrators.uactivation?.toLowerCase() || 'active'}`}>
          {administrators.uactivation || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (operator) => (
        <ActionDropdown
          items={operatorDropdownItems}
          onAction={(action) => handleAction(action, operator)}
          onClose={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Administrator Details</h1>
        <SearchBar
          value={searchKey}
          onChange={(newValue) => setSearchKey(newValue)}
          placeholder="Search administrators ..."
        />
      </div>

      <Filter filters={filters} onApplyFilters={handleApplyFilters} />

      {isLoading ? (
        <div className="loader-box">
          <Loader />
        </div>
      ) : error ? (
        <p className="error-message">Failed to load administrators: {error.message}</p>
      ) : (
        <PaginatedTable data={filteredadministratorss} columns={columns} rowKey="administratorsid" enableCheckbox={false} />
      )}

      <Modal
        isOpen={!!selectedOperator}
        title={`${selectedOperator?.ufirstname} ${selectedOperator?.ulastname}`}
        data={selectedOperator || {}}
        labels={displayLabels}
        onClose={() => setSelectedOperator(null)}
      />
    </div>
  );
};

export default Administrators;
