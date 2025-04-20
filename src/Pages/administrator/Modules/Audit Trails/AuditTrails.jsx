import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown'; // Ensure this is imported
import { fetchBookLog } from '../../../../../Api/api';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';

const AuditTrails = () => {
  const [logs, setLogs] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ actionType: 'All' });
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logData = await fetchBookLog();
        setLogs(logData || []); // Ensure logs is always an array
      } catch (error) {
        console.error('Failed to fetch Audit Trails Logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({ actionType: selectedActionType });
  };

  const filters = [
    {
      name: 'actionType',
      label: 'Action Type',
      value: selectedActionType,
      onChange: setSelectedActionType,
      options: [
        { value: 'All', label: 'All Actions' },
        { value: 'Request', label: 'Request' },
        { value: 'Payment', label: 'Payment' },
        { value: 'Modify', label: 'Modify' },
        { value: 'Remove', label: 'Remove' },
        { value: 'Checkout', label: 'Checkout' },
      ],
    },
  ];

  const displayLabels = {
    audittrailid: 'Audit Trail ID',
    entityid: 'Entity ID',
    entitytype: 'Entity Type',
    timestamp: 'Timestamp',
    action: 'Action',
    actiontype: 'Action Type',
    userid: 'User ID',
  };

  const filteredLogs = logs.filter((log) => {
    const searchInFields = `${log.userid} ${log.entityid} ${log.actiontype}`
      .toLowerCase()
      .includes(searchKey.toLowerCase());

    const actionFilter =
      appliedFilters.actionType === 'All' ||
      log.action.toLowerCase().includes(appliedFilters.actionType.toLowerCase());

    return searchInFields && actionFilter;
  });

  const handleAction = (action, log) => {
    if (action === 'view') {
      const essentialFields = {
        userid: log.userid || 'N/A',
        entityid: log.entityid || 'N/A',
        entitytype: log.entitytype || 'N/A',
        timestamp: log.timestamp || 'N/A',
        action: log.action || 'N/A',
        actiontype: log.actiontype || 'N/A',
      };
      setSelectedLog(essentialFields);
    }
  };

  const logDropdownItems = [
    { label: 'View Details', icon: <FaEye />, action: 'view' },
  ];

  const columns = [
    {
      header: 'Entity Info',
      accessor: row => `${row.entitytype}[${row.entityid}]`
    }
    { header: 'Action', accessor: 'action' },
    { header: 'User ID', accessor: 'userid' },
    { header: 'Timestamp', accessor: 'timestamp' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (log) => (
        <ActionDropdown
          items={logDropdownItems}
          onAction={(action) => handleAction(action, log)}
          onClose={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Audit Trails</h1>
        <SearchBar
          value={searchKey}
          onChange={(newValue) => setSearchKey(newValue)}
          placeholder="Search audit trail..."
        />
      </div>

      <Filter filters={filters} onApplyFilters={handleApplyFilters} />

      <PaginatedTable
        data={filteredLogs}
        columns={columns}
        rowKey={(log) => `${log.timestamp}-${log.audittrailid}`} 
        enableCheckbox={false}
      />

      <Modal
        isOpen={!!selectedLog}
        title="Audit Trail Details"
        data={selectedLog || {}}
        labels={displayLabels}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditTrails;
