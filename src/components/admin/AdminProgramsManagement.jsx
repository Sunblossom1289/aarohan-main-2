import React, { useState } from 'react';
import { PROGRAMS } from '../../utils/constants';
import { Modal } from '../shared/Modal';

export function AdminProgramsManagement() {
  const [showModal, setShowModal] = useState(false);
  
  return React.createElement('div', null,
    React.createElement('div', { className: 'page-header' },
      React.createElement('div', { className: 'flex justify-between items-center' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'page-title' }, 'Programs Management'),
          React.createElement('p', { className: 'page-subtitle' }, 'Manage subscription programs')
        ),
        React.createElement('button', {
          className: 'btn btn-primary',
          onClick: () => setShowModal(true)
        },
          React.createElement('i', { className: 'fas fa-plus' }),
          ' Add Program'
        )
      )
    ),
    React.createElement('div', { className: 'grid grid-3' },
      PROGRAMS.map(program => 
        React.createElement('div', { key: program.id, className: 'card' },
          React.createElement('div', { className: 'card-body' },
            React.createElement('h3', null, program.name),
            React.createElement('div', { style: { fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: 'var(--space-16) 0' } },
              '₹', program.price
            ),
            React.createElement('p', { style: { color: 'var(--color-text-secondary)' } }, program.description),
            React.createElement('div', { className: 'flex gap-8 mt-16' },
              React.createElement('button', { className: 'btn btn-sm btn-outline' }, 'Edit'),
              React.createElement('button', { className: 'btn btn-sm btn-outline' }, 'Deactivate')
            )
          )
        )
      )
    ),
    showModal && React.createElement(Modal, {
      title: 'Add New Program',
      onClose: () => setShowModal(false),
      footer: React.createElement('div', { className: 'flex gap-12' },
        React.createElement('button', { className: 'btn btn-outline', onClick: () => setShowModal(false) }, 'Cancel'),
        React.createElement('button', { className: 'btn btn-primary' }, 'Create Program')
      )
    },
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label required' }, 'Program Name'),
        React.createElement('input', { type: 'text', className: 'form-control' })
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label required' }, 'Price'),
        React.createElement('input', { type: 'number', className: 'form-control' })
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { className: 'form-label required' }, 'Description'),
        React.createElement('textarea', { className: 'form-control', rows: 3 })
      )
    )
  );
}