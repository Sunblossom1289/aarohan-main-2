import { SCHOOLS, DISTRICTS } from './constants';

export function generateMockStudents() {
  const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Arjun', 'Ananya', 'Vikram', 'Pooja', 'Rohan', 'Ishita'];
  const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Desai', 'Gupta', 'Reddy', 'Nair', 'Joshi', 'Mehta'];
  const grades = ['9', '10', '11', '12'];
  const statuses = ['completed', 'in_progress', 'not_started'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[i % 10]} ${lastNames[Math.floor(i / 2) % 10]}`,
    phone: `98765432${10 + i}`,
    age: 14 + (i % 4),
    gender: i % 2 === 0 ? 'M' : 'F',
    school: SCHOOLS[i % SCHOOLS.length],
    grade: grades[i % grades.length],
    district: DISTRICTS[i % DISTRICTS.length],
    email: `student${i + 1}@example.com`,
    program: (i % 3) + 1,
    aptitudeStatus: statuses[i % 3],
    personalityStatus: statuses[(i + 1) % 3],
    interestStatus: statuses[(i + 2) % 3],
    assignedCounselor: (i % 3) + 1,
    profileCompleted: i % 4 !== 0
  }));
}
