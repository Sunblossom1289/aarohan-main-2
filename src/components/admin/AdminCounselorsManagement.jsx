import React from 'react';
export function AdminCounselorsManagement({ state, dispatch }) {
  const handleUpdateStatus = (counselorId, status) => {
    dispatch({
      type: 'UPDATE_COUNSELOR_STATUS',
      payload: { counselorId, status }
    });
  };
  
  return React.createElement('div', null,
    React.createElement('div', { className: 'page-header' },
      React.createElement('h1', { className: 'page-title' }, 'Counselors Management'),
      React.createElement('p', { className: 'page-subtitle' }, `Total: ${state.counselors.length} counselors`)
    ),
    React.createElement('div', { className: 'card' },
      React.createElement('div', { className: 'card-body' },
        React.createElement('table', { className: 'table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Name'),
              React.createElement('th', null, 'District'),
              React.createElement('th', null, 'Experience'),
              React.createElement('th', null, 'Languages'),
              React.createElement('th', null, 'Status'),
              React.createElement('th', null, 'Students'),
              React.createElement('th', null, 'Sessions'),
              React.createElement('th', null, 'Actions')
            )
          ),
          React.createElement('tbody', null,
            state.counselors.map(counselor => {
              const statusBadge = counselor.verificationStatus === 'approved' ? 'badge-success' : 
                                  counselor.verificationStatus === 'pending' ? 'badge-warning' : 'badge-error';
              
              return React.createElement('tr', { key: counselor.id },
                React.createElement('td', null, counselor.name),
                React.createElement('td', null, counselor.district),
                React.createElement('td', null, counselor.experience, ' years'),
                React.createElement('td', null, counselor.languages),
                React.createElement('td', null,
                  React.createElement('span', { className: `badge ${statusBadge}` },
                    counselor.verificationStatus
                  )
                ),
                React.createElement('td', null, counselor.assignedStudents),
                React.createElement('td', null, counselor.sessionsCompleted),
                React.createElement('td', null,
                  React.createElement('div', { className: 'flex gap-8' },
                    counselor.verificationStatus === 'pending' && React.createElement(React.Fragment, null,
                      React.createElement('button', {
                        className: 'btn btn-sm btn-primary',
                        onClick: () => handleUpdateStatus(counselor.id, 'approved')
                      }, 'Approve'),
                      React.createElement('button', {
                        className: 'btn btn-sm btn-outline',
                        onClick: () => handleUpdateStatus(counselor.id, 'rejected')
                      }, 'Reject')
                    )
                  )
                )
              );
            })
          )
        )
      )
    )
  );
}