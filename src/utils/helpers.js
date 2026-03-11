export function getStatusBadge(status) {
  const statusMap = {
    completed: { label: 'Completed', class: 'badge-success' },
    in_progress: { label: 'In Progress', class: 'badge-warning' },
    not_started: { label: 'Not Started', class: 'badge-info' }
  };
  return statusMap[status] || { label: 'Unknown', class: 'badge-info' };
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function calculateTestResults(answers, questions) {
  let correct = 0;
  const dimensionScores = {};
  
  answers.forEach((answer, index) => {
    const question = questions[index];
    if (answer === question.correct) {
      correct++;
      if (question.dimension) {
        dimensionScores[question.dimension] = (dimensionScores[question.dimension] || 0) + 1;
      }
    }
  });
  
  return {
    totalScore: Math.round((correct / questions.length) * 100),
    dimensionScores,
    correct,
    total: questions.length
  };
}
