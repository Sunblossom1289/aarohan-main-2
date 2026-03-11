import React from 'react';
import { APTITUDE_QUESTIONS, PERSONALITY_QUESTIONS, INTEREST_QUESTIONS } from '../../utils/constants';

export function AdminAssessmentsManagement() {
  return React.createElement('div', null,
    React.createElement('div', { className: 'page-header' },
      React.createElement('h1', { className: 'page-title' }, 'Assessments Management'),
      React.createElement('p', { className: 'page-subtitle' }, 'Manage question banks and test content')
    ),
    React.createElement('div', { className: 'grid grid-3 mb-24' },
      [
        { name: 'Aptitude Test', questions: APTITUDE_QUESTIONS.length, status: 'Active' },
        { name: 'Personality Test', questions: PERSONALITY_QUESTIONS.length, status: 'Active' },
        { name: 'Interest Inventory', questions: INTEREST_QUESTIONS.length, status: 'Active' }
      ].map((test, index) => 
        React.createElement('div', { key: index, className: 'card' },
          React.createElement('div', { className: 'card-body' },
            React.createElement('h3', null, test.name),
            React.createElement('p', { style: { color: 'var(--color-text-secondary)', margin: 'var(--space-16) 0' } },
              test.questions, ' questions'
            ),
            React.createElement('span', { className: 'badge badge-success' }, test.status),
            React.createElement('div', { className: 'flex gap-8 mt-16' },
              React.createElement('button', { className: 'btn btn-sm btn-outline' }, 'Edit'),
              React.createElement('button', { className: 'btn btn-sm btn-outline' }, 'Upload')
            )
          )
        )
      )
    ),
    React.createElement('div', { className: 'card' },
      React.createElement('div', { className: 'card-header' },
        React.createElement('h3', { className: 'card-title' }, 'Sample Questions - Aptitude Test')
      ),
      React.createElement('div', { className: 'card-body' },
        APTITUDE_QUESTIONS.slice(0, 3).map((q, index) => 
          React.createElement('div', {
            key: q.id,
            style: {
              padding: 'var(--space-16)',
              marginBottom: 'var(--space-12)',
              background: 'var(--color-bg-1)',
              borderRadius: 'var(--radius-base)'
            }
          },
            React.createElement('strong', null, `Q${index + 1}. ${q.text}`),
            React.createElement('div', { style: { marginTop: 'var(--space-8)', fontSize: 'var(--font-size-sm)' } },
              'Dimension: ', q.dimension
            )
          )
        )
      )
    )
  );
}